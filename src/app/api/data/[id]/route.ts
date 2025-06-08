import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
        try {
        const { pathname } = new URL(request.url);
        const parts = pathname.split('/');
        const id = parts[parts.length - 1];
    
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
