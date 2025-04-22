import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        const { id } = params;
        
        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        const data = await prisma.data.findUnique({
            where: { id: Number(id) },
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