import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const row = body.row;

        // Call your FastAPI impute endpoint
        const response = await fetch("http://0.0.0.0:8000/impute", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ row }),
        });

        if (!response.ok) {
        const errorText = await response.text();
        console.error("FastAPI impute error:", errorText);
        return NextResponse.json(
            { error: "Failed to get imputed data from FastAPI" },
            { status: 500 }
        );
        }

        const imputedResult = await response.json();

        return NextResponse.json(imputedResult);
    } catch (err) {
        console.error("Imputation proxy error:", err);
        return NextResponse.json(
        { error: "Server error in imputation proxy" },
        { status: 500 }
        );
    }
}
