import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
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
    } catch (error) {
        console.error("Error fetching data:", error);
        return NextResponse.json({ error: error }, { status: 500 });
    }
}

// POST new data
export async function POST(req: Request) {
    const body = await req.json();

    let locationId = body.location?.id;

    if (!locationId && body.location?.latitude != null && body.location?.longitude != null && body.location?.name) {
        try {
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
        } catch (error) {
            console.error("Failed to create new location:", error);
            return NextResponse.json({ error: "Failed to create new location" }, { status: 500 });
        }
    }

    const newData = await prisma.data.create({
        data: {
            timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
            accountId: body.accountId || 1,
            locationId: locationId,
            parameters: body.parameters,
            wqi: body.wqi,
        },
    });

    return NextResponse.json(newData);
}