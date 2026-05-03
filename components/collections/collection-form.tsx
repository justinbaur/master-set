"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCollection } from "@/lib/actions/create-collection";
import { updateCollection } from "@/lib/actions/update-collection";
import type { Collection, ActionResult } from "@/lib/types/card";

const emptyResult: ActionResult<Collection> = { success: false };

interface CollectionFormProps {
  mode?: "create" | "edit";
  collection?: Collection;
}

export function CollectionForm({
  mode = "create",
  collection,
}: CollectionFormProps) {
  const router = useRouter();
  const action = mode === "create" ? createCollection : updateCollection;
  const [state, formAction, isPending] = useActionState(action, emptyResult);

  return (
    <form action={formAction} className="space-y-6">
      {mode === "edit" && collection && (
        <input type="hidden" name="id" value={collection.id} />
      )}

      <div className="space-y-1.5">
        <Label htmlFor="colName">Collection Name *</Label>
        <Input
          id="colName"
          name="name"
          required
          defaultValue={collection?.name}
          placeholder="e.g. Pokémon Base Set, Yu-Gi-Oh! 1st Edition"
        />
        {state.errors?.name && (
          <p className="text-sm text-destructive">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={collection?.description ?? ""}
          placeholder="Optional notes about this collection"
        />
        {state.errors?.description && (
          <p className="text-sm text-destructive">
            {state.errors.description[0]}
          </p>
        )}
      </div>

      {state.errors?._form && (
        <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
          {state.errors._form[0]}
        </div>
      )}

      {state.success && mode === "edit" && (
        <p className="text-sm text-green-600">Collection updated!</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? mode === "create"
              ? "Creating…"
              : "Saving…"
            : mode === "create"
              ? "Create Collection"
              : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
