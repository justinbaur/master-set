import type { ICardRepository } from "./card-repository";
import type { ICollectionRepository } from "./collection-repository";
import { FilesystemCardRepository } from "./filesystem-card-repository";
import { FilesystemCollectionRepository } from "./filesystem-collection-repository";
import { BlobCardRepository } from "./blob-card-repository";
import { BlobCollectionRepository } from "./blob-collection-repository";

export function getCardRepository(): ICardRepository {
  return process.env.BLOB_READ_WRITE_TOKEN
    ? new BlobCardRepository()
    : new FilesystemCardRepository();
}

export function getCollectionRepository(): ICollectionRepository {
  return process.env.BLOB_READ_WRITE_TOKEN
    ? new BlobCollectionRepository()
    : new FilesystemCollectionRepository();
}
