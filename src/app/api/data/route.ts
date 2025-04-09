// app/api/data/route.ts (or route.js)
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

        // Just return raw string for now
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
    const body = await req.json()

    const newData = await prisma.data.create({
        data: {
            timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
            accountId: body.accountId,
            locationId: body.locationId,
            parameters: body.parameters,
            wqi: body.wqi,
        },
    })

    console.log('New data created:', newData)

    return NextResponse.json(newData)
}
