import { put, head, BlobNotFoundError } from "@vercel/blob";

export async function readBlobJson<T>(pathname: string): Promise<T | null> {
  try {
    const blob = await head(pathname);
    const res = await fetch(blob.url, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });
    return res.json() as T;
  } catch (error) {
    if (error instanceof BlobNotFoundError) return null;
    throw error;
  }
}

export async function writeBlobJson<T>(pathname: string, data: T): Promise<void> {
  await put(pathname, JSON.stringify(data, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });
}
