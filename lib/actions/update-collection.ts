"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { updateCollectionSchema } from "@/lib/schemas/collection-schema";
import { getCollectionRepository } from "@/lib/repositories";
import type { ActionResult, Collection } from "@/lib/types/card";

export async function updateCollection(
  _prevState: ActionResult<Collection>,
  formData: FormData
): Promise<ActionResult<Collection>> {
  const session = await auth();
  if (!session?.user) return { success: false, errors: { _form: ["Unauthorized"] } };
  const rawData = {
    id: formData.get("id") as string,
    name: (formData.get("name") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
  };

  const validation = updateCollectionSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const repository = getCollectionRepository();

  try {
    const collection = await repository.update(validation.data);
    revalidatePath("/");
    revalidatePath(`/collections/${collection.id}`);
    return { success: true, data: collection };
  } catch (error) {
    console.error("Failed to update collection:", error);
    return {
      success: false,
      errors: { _form: ["Failed to update collection. Please try again."] },
    };
  }
}
