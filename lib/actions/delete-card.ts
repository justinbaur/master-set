"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { deleteCardSchema } from "@/lib/schemas/card-schema";
import { getCardRepository } from "@/lib/repositories";
import type { ActionResult } from "@/lib/types/card";

export async function deleteCard(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, errors: { _form: ["Unauthorized"] } };
  const validation = deleteCardSchema.safeParse({ id });
  if (!validation.success) {
    return {
      success: false,
      errors: { _form: ["Invalid card ID."] },
    };
  }

  const repository = getCardRepository();

  try {
    await repository.delete(id);
    revalidatePath("/");
    redirect("/");
  } catch (error) {
    if ((error as Error).message === "NEXT_REDIRECT") throw error;
    console.error("Failed to delete card:", error);
    return {
      success: false,
      errors: { _form: ["Failed to delete card. Please try again."] },
    };
  }
}

export async function deleteCardImage(
  cardId: string,
  imageId: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, errors: { _form: ["Unauthorized"] } };

  if (!cardId || !imageId) {
    return { success: false, errors: { _form: ["Invalid card or image ID."] } };
  }

  const repository = getCardRepository();

  try {
    await repository.deleteImage(cardId, imageId);
    revalidatePath(`/cards/${cardId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete image:", error);
    return {
      success: false,
      errors: { _form: ["Failed to delete image. Please try again."] },
    };
  }
}
