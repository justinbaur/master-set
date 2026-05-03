"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getCollectionRepository } from "@/lib/repositories";
import type { ActionResult } from "@/lib/types/card";

export async function deleteCollection(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, errors: { _form: ["Unauthorized"] } };

  if (!id) return { success: false, errors: { _form: ["Invalid collection ID."] } };

  const repository = getCollectionRepository();

  try {
    await repository.delete(id);
    revalidatePath("/");
    redirect("/");
  } catch (error) {
    if ((error as Error).message === "NEXT_REDIRECT") throw error;
    console.error("Failed to delete collection:", error);
    return {
      success: false,
      errors: { _form: ["Failed to delete collection. Please try again."] },
    };
  }
}
