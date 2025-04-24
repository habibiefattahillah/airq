import { NextResponse } from "next/server"
import { spawn } from "child_process"

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const { models, parameters } = body

        console.log(
            parameters
        )

        const python = spawn("python3", [
            "./scripts/classify.py",
            JSON.stringify(models),
            JSON.stringify(parameters),
        ])

        let data = ""
        python.stdout.on("data", (chunk) => {
            data += chunk.toString()
        })

        python.stderr.on("data", (error) => {
            console.error("Python error:", error.toString())
        })

        return new Promise((resolve) => {
            python.on("close", (code) => {
                if (code !== 0) {
                resolve(
                    NextResponse.json({ error: "Python script failed" }, { status: 500 })
                )
                return
                }

                try {
                    const result = JSON.parse(data)
                    console.log("Python output:", result)
                    resolve(NextResponse.json(result))
                } catch (err) {
                    console.error("Failed to parse Python output:", err)
                    resolve(
                        NextResponse.json({ error: "Invalid JSON from Python" }, { status: 500 })
                    )
                }
            })
        })
    } catch (err) {
        console.error("Server error:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}
