import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    context: { params: { id: string } }
) {
try {
    const { id } = context.params;

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

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching data:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
