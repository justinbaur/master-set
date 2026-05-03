export interface UploadedImage {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  uploadedAt: Date;
  caption: string | null;
}

export interface Card {
  id: string;
  collectionId: string;
  name: string;
  imageUrl: string;
  thumbnailUrl: string;
  purchaseLink: string | null;
  maxPrice: number | null;
  isPurchased: boolean;
  purchasedAt: Date | null;
  uploadedImages: UploadedImage[];
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Collection {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCardInput {
  collectionId: string;
  name: string;
  image: File;
  purchaseLink?: string;
  maxPrice?: number;
  notes?: string;
}

export interface UpdateCardInput {
  id: string;
  name?: string;
  purchaseLink?: string;
  maxPrice?: number | null;
  notes?: string;
}

export interface MarkPurchasedInput {
  id: string;
  isPurchased: boolean;
}

export interface AddImageInput {
  cardId: string;
  image: File;
  caption?: string;
}

export interface CreateCollectionInput {
  name: string;
  description?: string;
}

export interface UpdateCollectionInput {
  id: string;
  name?: string;
  description?: string;
}

export interface ActionResult<T = undefined> {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
}
