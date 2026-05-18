import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Receives a raw file body (PUT from upload-service) and saves it to public/
export async function PUT(request: NextRequest) {
  try {
    const filePath = request.nextUrl.searchParams.get("filePath");
    if (!filePath) {
      return NextResponse.json(
        { error: "filePath query param is required" },
        { status: 400 }
      );
    }

    // Prevent path traversal
    const normalized = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, "");
    const dest = path.join(process.cwd(), "public", normalized);

    fs.mkdirSync(path.dirname(dest), { recursive: true });

    const buffer = Buffer.from(await request.arrayBuffer());
    fs.writeFileSync(dest, buffer);

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Error writing uploaded file:", error);
    return NextResponse.json(
      {
        error: "Failed to save file",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
