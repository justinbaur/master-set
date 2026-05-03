"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { markPurchasedSchema } from "@/lib/schemas/card-schema";
import { getCardRepository } from "@/lib/repositories";
import type { ActionResult, Card } from "@/lib/types/card";

export async function markCardPurchased(
  id: string,
  isPurchased: boolean
): Promise<ActionResult<Card>> {
  const session = await auth();
  if (!session?.user) return { success: false, errors: { _form: ["Unauthorized"] } };
  const validation = markPurchasedSchema.safeParse({ id, isPurchased });
  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const repository = getCardRepository();

  try {
    const card = await repository.markPurchased(validation.data);
    revalidatePath("/");
    revalidatePath(`/cards/${card.id}`);
    return { success: true, data: card };
  } catch (error) {
    console.error("Failed to update purchase status:", error);
    return {
      success: false,
      errors: { _form: ["Failed to update purchase status. Please try again."] },
    };
  }
}
