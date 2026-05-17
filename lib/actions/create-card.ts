"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { createCardSchema } from "@/lib/schemas/card-schema";
import { getCardRepository } from "@/lib/repositories";
import type { ActionResult, Card } from "@/lib/types/card";

export async function createCard(
  _prevState: ActionResult<Card>,
  formData: FormData
): Promise<ActionResult<Card>> {
  const session = await auth();
  if (!session?.user) return { success: false, errors: { _form: ["Unauthorized"] } };
  const rawData = {
    collectionId: formData.get("collectionId") as string,
    name: formData.get("name") as string,
    image: formData.get("image") as File,
    purchaseLink: (formData.get("purchaseLink") as string) || undefined,
    maxPrice: (formData.get("maxPrice") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  };

  const validation = createCardSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const repository = getCardRepository();

  try {
    const card = await repository.create(validation.data);
    revalidatePath("/");
    revalidatePath(`/collections/${card.collectionId}`);
    redirect(`/collections/${card.collectionId}`);
  } catch (error) {
    if ((error as Error).message === "NEXT_REDIRECT") throw error;
    console.error("Failed to create card:", error);
    return {
      success: false,
      errors: { _form: ["Failed to create card. Please try again."] },
    };
  }
}
