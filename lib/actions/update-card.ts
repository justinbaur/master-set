"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { updateCardSchema } from "@/lib/schemas/card-schema";
import { getCardRepository } from "@/lib/repositories";
import type { ActionResult, Card } from "@/lib/types/card";

export async function updateCard(
  _prevState: ActionResult<Card>,
  formData: FormData
): Promise<ActionResult<Card>> {
  const session = await auth();
  if (!session?.user) return { success: false, errors: { _form: ["Unauthorized"] } };
  const rawData = {
    id: formData.get("id") as string,
    name: (formData.get("name") as string) || undefined,
    purchaseLink: (formData.get("purchaseLink") as string) || undefined,
    maxPrice: (formData.get("maxPrice") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  };

  const validation = updateCardSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const repository = getCardRepository();

  try {
    const card = await repository.update(validation.data);
    revalidatePath("/");
    revalidatePath(`/cards/${card.id}`);
    return { success: true, data: card };
  } catch (error) {
    console.error("Failed to update card:", error);
    return {
      success: false,
      errors: { _form: ["Failed to update card. Please try again."] },
    };
  }
}
