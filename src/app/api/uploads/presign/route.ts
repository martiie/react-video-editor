import { NextRequest, NextResponse } from "next/server";
import mime from "mime-types";
import path from "path";

interface PresignRequest {
  userId: string;
  fileNames: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: PresignRequest = await request.json();
    const { userId, fileNames } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    if (!fileNames || !Array.isArray(fileNames) || fileNames.length === 0) {
      return NextResponse.json(
        { error: "fileNames array is required and must not be empty" },
        { status: 400 }
      );
    }

    const uploads = fileNames.map((fileName) => {
      const ext = path.extname(fileName);
      const base = path.basename(fileName, ext);
      const unique = `${base}-${Date.now()}${ext}`;
      const filePath = `uploads/${userId}/${unique}`;
      const contentType =
        (mime.lookup(fileName) as string | false) || "application/octet-stream";

      return {
        fileName: unique,
        filePath,
        contentType,
        // Local PUT endpoint — Next.js will save the raw body to public/
        presignedUrl: `/api/uploads/write?filePath=${encodeURIComponent(filePath)}`,
        url: `/${filePath}`
      };
    });

    return NextResponse.json({ success: true, uploads });
  } catch (error) {
    console.error("Error in presign route:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
