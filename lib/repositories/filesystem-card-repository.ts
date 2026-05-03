import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import type { ICardRepository } from "./card-repository";
import { DEFAULT_COLLECTION_ID } from "./filesystem-collection-repository";
import type {
  Card,
  UploadedImage,
  CreateCardInput,
  UpdateCardInput,
  MarkPurchasedInput,
  AddImageInput,
} from "@/lib/types/card";
import { saveImage, deleteImageFile } from "@/lib/utils/file-upload";

const DATA_DIR = path.join(process.cwd(), "data");
const CARDS_FILE = path.join(DATA_DIR, "cards", "cards.json");

interface CardJson {
  id: string;
  collectionId?: string;
  name: string;
  imageUrl: string;
  thumbnailUrl: string;
  purchaseLink: string | null;
  maxPrice: number | null;
  isPurchased: boolean;
  purchasedAt: string | null;
  uploadedImages: Array<{
    id: string;
    imageUrl: string;
    thumbnailUrl: string;
    uploadedAt: string;
    caption: string | null;
  }>;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

function deserializeCard(json: CardJson): Card {
  return {
    ...json,
    collectionId: json.collectionId ?? DEFAULT_COLLECTION_ID,
    createdAt: new Date(json.createdAt),
    updatedAt: new Date(json.updatedAt),
    purchasedAt: json.purchasedAt ? new Date(json.purchasedAt) : null,
    uploadedImages: json.uploadedImages.map((img) => ({
      ...img,
      uploadedAt: new Date(img.uploadedAt),
    })),
  };
}

export class FilesystemCardRepository implements ICardRepository {
  private async ensureStorage(): Promise<void> {
    await fs.mkdir(path.dirname(CARDS_FILE), { recursive: true });
  }

  private async readCards(): Promise<Card[]> {
    await this.ensureStorage();
    try {
      const raw = await fs.readFile(CARDS_FILE, "utf-8");
      const data = JSON.parse(raw) as CardJson[];

      // Inline migration: assign default collectionId to any orphaned cards
      const hasOrphans = data.some((c) => !c.collectionId);
      if (hasOrphans) {
        const migrated = data.map((c) =>
          c.collectionId ? c : { ...c, collectionId: DEFAULT_COLLECTION_ID }
        );
        await this.ensureStorage();
        await fs.writeFile(
          CARDS_FILE,
          JSON.stringify(migrated, null, 2),
          "utf-8"
        );
        return migrated.map(deserializeCard);
      }

      return data.map(deserializeCard);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return [];
      }
      throw error;
    }
  }

  private async writeCards(cards: Card[]): Promise<void> {
    await this.ensureStorage();
    await fs.writeFile(CARDS_FILE, JSON.stringify(cards, null, 2), "utf-8");
  }

  async findAll(collectionId?: string): Promise<Card[]> {
    const cards = await this.readCards();
    const filtered = collectionId
      ? cards.filter((c) => c.collectionId === collectionId)
      : cards;
    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findById(id: string): Promise<Card | null> {
    const cards = await this.readCards();
    return cards.find((c) => c.id === id) ?? null;
  }

  async findByPurchaseStatus(
    isPurchased: boolean,
    collectionId?: string
  ): Promise<Card[]> {
    const cards = await this.readCards();
    return cards.filter(
      (c) =>
        c.isPurchased === isPurchased &&
        (!collectionId || c.collectionId === collectionId)
    );
  }

  async create(input: CreateCardInput): Promise<Card> {
    const cards = await this.readCards();
    const id = uuidv4();
    const now = new Date();

    const { imageUrl, thumbnailUrl } = await saveImage(input.image, id);

    const newCard: Card = {
      id,
      collectionId: input.collectionId,
      name: input.name,
      imageUrl,
      thumbnailUrl,
      purchaseLink: input.purchaseLink || null,
      maxPrice: input.maxPrice ?? null,
      isPurchased: false,
      purchasedAt: null,
      uploadedImages: [],
      notes: input.notes || null,
      createdAt: now,
      updatedAt: now,
    };

    cards.push(newCard);
    await this.writeCards(cards);
    return newCard;
  }

  async update(input: UpdateCardInput): Promise<Card> {
    const cards = await this.readCards();
    const index = cards.findIndex((c) => c.id === input.id);
    if (index === -1) throw new Error(`Card ${input.id} not found`);

    const updated: Card = {
      ...cards[index],
      ...(input.name !== undefined && { name: input.name }),
      ...(input.purchaseLink !== undefined && {
        purchaseLink: input.purchaseLink || null,
      }),
      ...(input.maxPrice !== undefined && { maxPrice: input.maxPrice ?? null }),
      ...(input.notes !== undefined && { notes: input.notes || null }),
      updatedAt: new Date(),
    };

    cards[index] = updated;
    await this.writeCards(cards);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const cards = await this.readCards();
    const card = cards.find((c) => c.id === id);
    if (!card) throw new Error(`Card ${id} not found`);

    await deleteImageFile(card.imageUrl);
    await deleteImageFile(card.thumbnailUrl);
    for (const img of card.uploadedImages) {
      await deleteImageFile(img.imageUrl);
      await deleteImageFile(img.thumbnailUrl);
    }

    await this.writeCards(cards.filter((c) => c.id !== id));
  }

  async markPurchased(input: MarkPurchasedInput): Promise<Card> {
    const cards = await this.readCards();
    const index = cards.findIndex((c) => c.id === input.id);
    if (index === -1) throw new Error(`Card ${input.id} not found`);

    cards[index] = {
      ...cards[index],
      isPurchased: input.isPurchased,
      purchasedAt: input.isPurchased ? new Date() : null,
      updatedAt: new Date(),
    };

    await this.writeCards(cards);
    return cards[index];
  }

  async addImage(input: AddImageInput): Promise<Card> {
    const cards = await this.readCards();
    const index = cards.findIndex((c) => c.id === input.cardId);
    if (index === -1) throw new Error(`Card ${input.cardId} not found`);

    const imageId = uuidv4();
    const { imageUrl, thumbnailUrl } = await saveImage(
      input.image,
      `${input.cardId}_${imageId}`
    );

    const uploadedImage: UploadedImage = {
      id: imageId,
      imageUrl,
      thumbnailUrl,
      uploadedAt: new Date(),
      caption: input.caption || null,
    };

    cards[index] = {
      ...cards[index],
      uploadedImages: [...cards[index].uploadedImages, uploadedImage],
      updatedAt: new Date(),
    };

    await this.writeCards(cards);
    return cards[index];
  }

  async deleteImage(cardId: string, imageId: string): Promise<Card> {
    const cards = await this.readCards();
    const index = cards.findIndex((c) => c.id === cardId);
    if (index === -1) throw new Error(`Card ${cardId} not found`);

    const image = cards[index].uploadedImages.find((img) => img.id === imageId);
    if (!image) throw new Error(`Image ${imageId} not found on card ${cardId}`);

    await deleteImageFile(image.imageUrl);
    await deleteImageFile(image.thumbnailUrl);

    cards[index] = {
      ...cards[index],
      uploadedImages: cards[index].uploadedImages.filter(
        (img) => img.id !== imageId
      ),
      updatedAt: new Date(),
    };

    await this.writeCards(cards);
    return cards[index];
  }

  async count(collectionId?: string): Promise<number> {
    const cards = await this.readCards();
    if (!collectionId) return cards.length;
    return cards.filter((c) => c.collectionId === collectionId).length;
  }

  async exists(id: string): Promise<boolean> {
    const card = await this.findById(id);
    return card !== null;
  }
}
