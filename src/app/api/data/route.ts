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
            const newLocation = await prisma.location.create({
                data: {
                    name: body.location.name,
                    latitude: body.location.latitude,
                    longitude: body.location.longitude,
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
            accountId: body.accountId || 1, // fallback dummy
            locationId: locationId,
            parameters: body.parameters,
            wqi: body.wqi,
        },
    });

    console.log("New data created:", newData);
    return NextResponse.json(newData);
}