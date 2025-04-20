// app/api/imputasi/route.ts
import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);

export async function POST(req: NextRequest) {
    const body = await req.json();
    const row = JSON.stringify(body.row); // stringified row data

    console.log("Row data:", row); // Log the row data for debugging

    try {
        const pythonScriptPath = path.join(process.cwd(), "scripts", "impute.py");

        const { stdout } = await execFileAsync("python3", [pythonScriptPath, row]);
        const imputedResult = JSON.parse(stdout);

        console.log("Imputed result:", imputedResult); // Log the imputed result for debugging
        return NextResponse.json({ imputed: imputedResult });
    } catch (err) {
        console.error("Imputation error:", err);
        return NextResponse.json({ error: "Failed to run imputation" }, { status: 500 });
    }
}
