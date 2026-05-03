import type {
  Card,
  CreateCardInput,
  UpdateCardInput,
  MarkPurchasedInput,
  AddImageInput,
} from "@/lib/types/card";

export interface ICardRepository {
  // Query operations
  findAll(collectionId?: string): Promise<Card[]>;
  findById(id: string): Promise<Card | null>;
  findByPurchaseStatus(isPurchased: boolean, collectionId?: string): Promise<Card[]>;

  // Mutation operations
  create(input: CreateCardInput): Promise<Card>;
  update(input: UpdateCardInput): Promise<Card>;
  delete(id: string): Promise<void>;
  markPurchased(input: MarkPurchasedInput): Promise<Card>;
  addImage(input: AddImageInput): Promise<Card>;
  deleteImage(cardId: string, imageId: string): Promise<Card>;

  // Utility operations
  count(collectionId?: string): Promise<number>;
  exists(id: string): Promise<boolean>;
}
