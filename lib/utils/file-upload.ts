import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";

const DATA_DIR = path.join(process.cwd(), "data", "images");
const ORIGINAL_DIR = path.join(DATA_DIR, "original");
const THUMBNAIL_DIR = path.join(DATA_DIR, "thumbnails");

const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_HEIGHT = 400;

interface ImageUrls {
  imageUrl: string;
  thumbnailUrl: string;
}

async function ensureDirectories(): Promise<void> {
  await fs.mkdir(ORIGINAL_DIR, { recursive: true });
  await fs.mkdir(THUMBNAIL_DIR, { recursive: true });
}

export async function saveImage(file: File, imageId: string): Promise<ImageUrls> {
  await ensureDirectories();

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Derive extension from MIME type
  const mimeToExt: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };
  const ext = mimeToExt[file.type] ?? path.extname(file.name) ?? ".jpg";

  const filename = `${imageId}${ext}`;
  const thumbnailFilename = `${imageId}_thumb.webp`;

  const originalPath = path.join(ORIGINAL_DIR, filename);
  const thumbnailPath = path.join(THUMBNAIL_DIR, thumbnailFilename);

  // Save original
  await fs.writeFile(originalPath, buffer);

  // Generate and save thumbnail as WebP
  await sharp(buffer)
    .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
      fit: "cover",
      position: "center",
    })
    .webp({ quality: 80 })
    .toFile(thumbnailPath);

  return {
    imageUrl: `/api/images/original/${filename}`,
    thumbnailUrl: `/api/images/thumbnails/${thumbnailFilename}`,
  };
}

export async function deleteImageFile(imageUrl: string): Promise<void> {
  try {
    // Convert URL path to filesystem path
    // e.g. /api/images/original/xyz.jpg -> data/images/original/xyz.jpg
    const relativePath = imageUrl.replace(/^\/api\/images\//, "");
    const filePath = path.join(process.cwd(), "data", "images", relativePath);
    await fs.unlink(filePath);
  } catch (error) {
    // Log but don't throw — file may already be gone
    console.warn(`Could not delete image at ${imageUrl}:`, error);
  }
}
