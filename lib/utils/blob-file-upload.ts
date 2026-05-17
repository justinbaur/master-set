import { put, del } from "@vercel/blob";
import sharp from "sharp";

const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_HEIGHT = 400;

const mimeToExt: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

interface ImageUrls {
  imageUrl: string;
  thumbnailUrl: string;
}

export async function saveImage(file: File, imageId: string): Promise<ImageUrls> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const ext = mimeToExt[file.type] ?? ".jpg";
  const filename = `${imageId}${ext}`;
  const thumbnailFilename = `${imageId}_thumb.webp`;

  const thumbnailBuffer = await sharp(buffer)
    .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, { fit: "cover", position: "center" })
    .webp({ quality: 80 })
    .toBuffer();

  const [original, thumbnail] = await Promise.all([
    put(`images/original/${filename}`, buffer, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type || "image/jpeg",
      cacheControlMaxAge: 31536000,
    }),
    put(`images/thumbnails/${thumbnailFilename}`, thumbnailBuffer, {
      access: "public",
      addRandomSuffix: false,
      contentType: "image/webp",
      cacheControlMaxAge: 31536000,
    }),
  ]);

  return { imageUrl: original.url, thumbnailUrl: thumbnail.url };
}

export async function deleteImageFile(imageUrl: string): Promise<void> {
  try {
    await del(imageUrl);
  } catch (error) {
    console.warn(`Could not delete blob at ${imageUrl}:`, error);
  }
}
