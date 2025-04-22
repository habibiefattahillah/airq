// /app/api/clerk-webhook/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma" // Adjust path if needed

export async function POST(req: Request) {
    const payload = await req.json()

    console.log("Received payload:", payload)

    if (payload.type !== "user.created") {
        return NextResponse.json({ message: "Not handled" }, { status: 200 })
    }

    const { id, email_addresses, first_name, last_name } = payload.data

    const name = [first_name, last_name].filter(Boolean).join(" ")
    const email = email_addresses?.[0]?.email_address || ""

    console.log("User data:", { id, name, email })
    console.log("typeof id:", typeof id, "value:", id)

    try {
        await prisma.account.create({
            data: {
                id,
                name,
                email,
            },
        })

        return NextResponse.json({ message: "User saved!" }, { status: 201 })
    } catch (error: any) {
        console.error("Prisma insert error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
