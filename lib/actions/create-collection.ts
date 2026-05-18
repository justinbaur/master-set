"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { createCollectionSchema } from "@/lib/schemas/collection-schema";
import { getCollectionRepository } from "@/lib/repositories";
import type { ActionResult, Collection } from "@/lib/types/card";

export async function createCollection(
  _prevState: ActionResult<Collection>,
  formData: FormData
): Promise<ActionResult<Collection>> {
  const session = await auth();
  if (!session?.user) return { success: false, errors: { _form: ["Unauthorized"] } };
  const rawData = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
  };

  const validation = createCollectionSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const repository = getCollectionRepository();

  try {
    const collection = await repository.create(validation.data);
    revalidatePath("/");
    redirect(`/`);
  } catch (error) {
    if ((error as Error).message === "NEXT_REDIRECT") throw error;
    console.error("Failed to create collection:", error);
    return {
      success: false,
      errors: { _form: ["Failed to create collection. Please try again."] },
    };
  }
}
