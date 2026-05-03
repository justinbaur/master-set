import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const ALLOWED_SUBDIRS = ["original", "thumbnails"];

// Serve images stored in /data/images/ as /api/images/
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const segments = (await params).path;

  // Safety: only allow known subdirectories and no path traversal
  if (!segments || segments.length < 2) {
    return new NextResponse("Not found", { status: 404 });
  }

  const [subdir, ...rest] = segments;
  if (!ALLOWED_SUBDIRS.includes(subdir) || rest.some((s) => s.includes(".."))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const filename = rest.join("/");
  const filePath = path.join(process.cwd(), "data", "images", subdir, filename);

  try {
    const file = await fs.readFile(filePath);
    const ext = path.extname(filename).toLowerCase();

    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
    };

    const contentType = mimeTypes[ext] ?? "application/octet-stream";

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
