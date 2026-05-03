import { z } from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const imageFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, "Image must be less than 10MB")
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
    "Only JPEG, PNG, and WebP images are allowed"
  );

const purchaseLinkSchema = z
  .string()
  .url("Must be a valid URL")
  .optional()
  .or(z.literal(""));

const maxPriceSchema = z.preprocess(
  (val) => (val === "" || val == null ? undefined : val),
  z.coerce.number().positive("Must be a positive amount").optional()
);

export const createCardSchema = z.object({
  collectionId: z.string().min(1, "Collection is required"),
  name: z.string().min(1, "Card name is required").max(200, "Name is too long"),
  image: imageFileSchema,
  purchaseLink: purchaseLinkSchema,
  maxPrice: maxPriceSchema,
  notes: z.string().max(1000, "Notes are too long").optional(),
});

export const updateCardSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Card name is required").max(200).optional(),
  purchaseLink: purchaseLinkSchema,
  maxPrice: maxPriceSchema,
  notes: z.string().max(1000).optional(),
});

export const markPurchasedSchema = z.object({
  id: z.string().min(1),
  isPurchased: z.boolean(),
});

export const addImageSchema = z.object({
  cardId: z.string().min(1),
  image: imageFileSchema,
  caption: z.string().max(200).optional(),
});

export const deleteCardSchema = z.object({
  id: z.string().min(1),
});

export const deleteImageSchema = z.object({
  cardId: z.string().min(1),
  imageId: z.string().min(1),
});

export type CreateCardSchema = z.infer<typeof createCardSchema>;
export type UpdateCardSchema = z.infer<typeof updateCardSchema>;
export type MarkPurchasedSchema = z.infer<typeof markPurchasedSchema>;
export type AddImageSchema = z.infer<typeof addImageSchema>;
