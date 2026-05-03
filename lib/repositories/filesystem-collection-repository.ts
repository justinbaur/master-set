import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import type { ICollectionRepository } from "./collection-repository";
import type {
  Collection,
  CreateCollectionInput,
  UpdateCollectionInput,
} from "@/lib/types/card";
import { deleteImageFile } from "@/lib/utils/file-upload";

const DEFAULT_DATA_DIR = path.join(process.cwd(), "data");

// Stable ID for the auto-created Default collection
export const DEFAULT_COLLECTION_ID = "00000000-0000-0000-0000-000000000001";

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

export class FilesystemCollectionRepository implements ICollectionRepository {
  private readonly collectionsFile: string;
  private readonly cardsFile: string;

  constructor(dataDir?: string) {
    const base = dataDir ?? DEFAULT_DATA_DIR;
    this.collectionsFile = path.join(base, "collections", "collections.json");
    this.cardsFile = path.join(base, "cards", "cards.json");
  }

  private async ensureStorage(): Promise<void> {
    await fs.mkdir(path.dirname(this.collectionsFile), { recursive: true });
  }

  private async readCollections(): Promise<Collection[]> {
    await this.ensureStorage();
    try {
      const raw = await fs.readFile(this.collectionsFile, "utf-8");
      const data = JSON.parse(raw) as CollectionJson[];
      return data.map(deserialize);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return [];
      }
      throw error;
    }
  }

  private async writeCollections(collections: Collection[]): Promise<void> {
    await this.ensureStorage();
    await fs.writeFile(
      this.collectionsFile,
      JSON.stringify(collections, null, 2),
      "utf-8"
    );
  }

  /**
   * On first access, migrate orphaned cards (no collectionId) to the Default collection.
   * Creates the Default collection entry if needed.
   */
  private async runMigrationIfNeeded(
    collections: Collection[]
  ): Promise<Collection[]> {
    // Read cards to check for orphans
    let rawCards: CardJson[] = [];
    try {
      const raw = await fs.readFile(this.cardsFile, "utf-8");
      rawCards = JSON.parse(raw) as CardJson[];
    } catch {
      return collections; // No cards file yet — nothing to migrate
    }

    const orphans = rawCards.filter((c) => !c.collectionId);
    if (orphans.length === 0) return collections;

    // Ensure Default collection exists
    const alreadyHasDefault = collections.some(
      (c) => c.id === DEFAULT_COLLECTION_ID
    );
    let result = collections;
    if (!alreadyHasDefault) {
      const now = new Date();
      const defaultCollection: Collection = {
        id: DEFAULT_COLLECTION_ID,
        name: "Default",
        description: null,
        createdAt: now,
        updatedAt: now,
      };
      result = [defaultCollection, ...collections];
      await this.writeCollections(result);
    }

    // Assign default collectionId to orphaned cards and rewrite
    const updated = rawCards.map((card) =>
      card.collectionId ? card : { ...card, collectionId: DEFAULT_COLLECTION_ID }
    );
    await fs.mkdir(path.dirname(this.cardsFile), { recursive: true });
    await fs.writeFile(this.cardsFile, JSON.stringify(updated, null, 2), "utf-8");

    return result;
  }

  async findAll(): Promise<Collection[]> {
    let collections = await this.readCollections();
    collections = await this.runMigrationIfNeeded(collections);
    return collections.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
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
    try {
      const raw = await fs.readFile(this.cardsFile, "utf-8");
      const allCards = JSON.parse(raw) as CardJson[];
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
      await fs.writeFile(this.cardsFile, JSON.stringify(remaining, null, 2), "utf-8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }

    await this.writeCollections(collections.filter((c) => c.id !== id));
  }
}
