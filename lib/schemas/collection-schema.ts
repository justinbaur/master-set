import { z } from "zod";

export const createCollectionSchema = z.object({
  name: z
    .string()
    .min(1, "Collection name is required")
    .max(80, "Name is too long"),
  description: z.string().max(300, "Description is too long").optional(),
});

export const updateCollectionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Collection name is required").max(80).optional(),
  description: z.string().max(300).optional(),
});

export type CreateCollectionSchema = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionSchema = z.infer<typeof updateCollectionSchema>;
