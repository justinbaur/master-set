"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { addImageSchema } from "@/lib/schemas/card-schema";
import { getCardRepository } from "@/lib/repositories";
import type { ActionResult, Card } from "@/lib/types/card";

export async function addCardImage(
  _prevState: ActionResult<Card>,
  formData: FormData
): Promise<ActionResult<Card>> {
  const session = await auth();
  if (!session?.user) return { success: false, errors: { _form: ["Unauthorized"] } };
  const rawData = {
    cardId: formData.get("cardId") as string,
    image: formData.get("image") as File,
    caption: (formData.get("caption") as string) || undefined,
  };

  const validation = addImageSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const repository = getCardRepository();

  try {
    const card = await repository.addImage(validation.data);
    revalidatePath(`/cards/${card.id}`);
    return { success: true, data: card };
  } catch (error) {
    console.error("Failed to add image:", error);
    return {
      success: false,
      errors: { _form: ["Failed to upload image. Please try again."] },
    };
  }
}
