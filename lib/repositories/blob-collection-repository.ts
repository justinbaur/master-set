import { v4 as uuidv4 } from "uuid";
import type { ICollectionRepository } from "./collection-repository";
import type {
  Collection,
  CreateCollectionInput,
  UpdateCollectionInput,
} from "@/lib/types/card";
import { deleteImageFile } from "@/lib/utils/blob-file-upload";
import { readBlobJson, writeBlobJson } from "@/lib/utils/blob-storage";

const COLLECTIONS_BLOB_PATH = "data/collections.json";
const CARDS_BLOB_PATH = "data/cards.json";

interface CollectionJson {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CardJson {
  id: string;
  collectionId?: string;
  imageUrl: string;
  thumbnailUrl: string;
  uploadedImages: Array<{ imageUrl: string; thumbnailUrl: string }>;
  [key: string]: unknown;
}

function deserialize(json: CollectionJson): Collection {
  return {
    ...json,
    createdAt: new Date(json.createdAt),
    updatedAt: new Date(json.updatedAt),
  };
}

export class BlobCollectionRepository implements ICollectionRepository {
  private async readCollections(): Promise<Collection[]> {
    const data = await readBlobJson<CollectionJson[]>(COLLECTIONS_BLOB_PATH);
    return (data ?? []).map(deserialize);
  }

  private async writeCollections(collections: Collection[]): Promise<void> {
    await writeBlobJson(COLLECTIONS_BLOB_PATH, collections);
  }

  async findAll(): Promise<Collection[]> {
    const collections = await this.readCollections();
    return collections.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async findById(id: string): Promise<Collection | null> {
    const collections = await this.findAll();
    return collections.find((c) => c.id === id) ?? null;
  }

  async create(input: CreateCollectionInput): Promise<Collection> {
    const collections = await this.findAll();
    const now = new Date();
    const newCollection: Collection = {
      id: uuidv4(),
      name: input.name,
      description: input.description ?? null,
      createdAt: now,
      updatedAt: now,
    };
    collections.push(newCollection);
    await this.writeCollections(collections);
    return newCollection;
  }

  async update(input: UpdateCollectionInput): Promise<Collection> {
    const collections = await this.findAll();
    const index = collections.findIndex((c) => c.id === input.id);
    if (index === -1) throw new Error(`Collection ${input.id} not found`);

    const updated: Collection = {
      ...collections[index],
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && {
        description: input.description || null,
      }),
      updatedAt: new Date(),
    };
    collections[index] = updated;
    await this.writeCollections(collections);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const collections = await this.findAll();
    if (!collections.some((c) => c.id === id)) {
      throw new Error(`Collection ${id} not found`);
    }

    // Cascade: delete all cards in this collection
    const allCards = (await readBlobJson<CardJson[]>(CARDS_BLOB_PATH)) ?? [];
    const toDelete = allCards.filter((c) => c.collectionId === id);

    for (const card of toDelete) {
      await deleteImageFile(card.imageUrl as string);
      await deleteImageFile(card.thumbnailUrl as string);
      for (const img of card.uploadedImages) {
        await deleteImageFile(img.imageUrl);
        await deleteImageFile(img.thumbnailUrl);
      }
    }

    const remaining = allCards.filter((c) => c.collectionId !== id);
    await writeBlobJson(CARDS_BLOB_PATH, remaining);

    await this.writeCollections(collections.filter((c) => c.id !== id));
  }
}
