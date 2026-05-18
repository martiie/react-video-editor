import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import mime from "mime-types";

interface UploadUrlRequest {
  userId: string;
  urls: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: UploadUrlRequest = await request.json();
    const { userId, urls } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "urls array is required and must not be empty" },
        { status: 400 }
      );
    }

    const uploads = await Promise.all(
      urls.map(async (originalUrl) => {
        const response = await fetch(originalUrl);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch ${originalUrl}: ${response.status} ${response.statusText}`
          );
        }

        // Derive file name from URL or Content-Type
        const urlPath = new URL(originalUrl).pathname;
        const rawName = path.basename(urlPath) || "file";
        const ext =
          path.extname(rawName) ||
          `.${mime.extension(response.headers.get("content-type") || "application/octet-stream") || "bin"}`;
        const base = path.basename(rawName, path.extname(rawName));
        const unique = `${base}-${Date.now()}${ext}`;
        const filePath = `uploads/${userId}/${unique}`;
        const contentType =
          response.headers.get("content-type") ||
          (mime.lookup(unique) as string | false) ||
          "application/octet-stream";

        const dest = path.join(process.cwd(), "public", filePath);
        fs.mkdirSync(path.dirname(dest), { recursive: true });

        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync(dest, buffer);

        return {
          fileName: unique,
          filePath,
          contentType,
          originalUrl,
          url: `/${filePath}`
        };
      })
    );

    return NextResponse.json({ success: true, uploads });
  } catch (error) {
    console.error("Error in upload URL route:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
