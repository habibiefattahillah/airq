import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { models, parameters } = body

        const response = await fetch("http://0.0.0.0:8000/classify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ models, parameters }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error("Backend error:", errorText)
            return NextResponse.json({ error: "Backend classification failed" }, { status: 500 })
        }

        const result = await response.json()
        return NextResponse.json(result)
    } catch (err) {
        console.error("Server error:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}
