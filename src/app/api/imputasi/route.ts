// app/api/imputasi/route.ts
import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);

export async function POST(req: NextRequest) {
    const body = await req.json();
    const id = body.id;

    try {
        // Call the Python script with the row ID
        const pythonScriptPath = path.join(process.cwd(), "scripts", "impute.py");
        const { stdout } = await execFileAsync("python3", [pythonScriptPath, id]);

        const imputedResult = JSON.parse(stdout);
        return NextResponse.json({ imputed: imputedResult });
    } catch (err) {
        console.error("Imputation error:", err);
        return NextResponse.json({ error: "Failed to run imputation" }, { status: 500 });
    }
}
