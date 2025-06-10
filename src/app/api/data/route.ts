import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const data = await prisma.data.findMany({
        include: {
            account: {
                select: {
                    id: true,
                    name: true,
                },
            },
            location: {
                select: {
                    id: true,
                    name: true,
                    latitude: true,
                    longitude: true,
                    state: true,
                    country: true,
                    address: true,
                },
            },
        },
    });

    return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
    });
}


// POST new data
export async function POST(req: Request) {
    try {
        const body = await req.json();
    
        if (!body.accountId) {
            return NextResponse.json({ error: "accountId is required" }, { status: 400 });
        }
    
        let locationId = body.location?.id;
    
        if (!locationId && body.location?.latitude != null && body.location?.longitude != null && body.location?.name) {
            const existingLocation = await prisma.location.findFirst({
            where: {
                latitude: body.location.latitude,
                longitude: body.location.longitude,
            },
            });
    
            if (existingLocation) {
            locationId = existingLocation.id;
            } else {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${body.location.latitude}&lon=${body.location.longitude}&format=json&addressdetails=1&accept-language=en`,
            );
    
            if (!response.ok) {
                console.error("Failed to fetch location data:", response.statusText);
                return NextResponse.json({ error: "Failed to fetch location data" }, { status: 500 });
            }
    
            const locationData = await response.json();
    
            const newLocation = await prisma.location.create({
                data: {
                name: body.location.name,
                latitude: body.location.latitude,
                longitude: body.location.longitude,
                state: locationData?.address?.state || null,
                country: locationData?.address?.country || null,
                address: locationData?.display_name || null,
                },
            });
            locationId = newLocation.id;
            }
        }
    
        const newData = await prisma.data.create({
            data: {
            timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
            accountId: body.accountId,
            locationId: locationId,
            parameters: body.parameters,
            wqi: body.wqi,
            },
        });
    
        return NextResponse.json(newData, { status: 201 });
    } catch (error) {
        console.error("Error in POST /data:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}