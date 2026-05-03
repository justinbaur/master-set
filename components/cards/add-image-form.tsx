"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "./image-upload";
import { addCardImage } from "@/lib/actions/add-image";
import type { ActionResult, Card } from "@/lib/types/card";

const emptyResult: ActionResult<Card> = { success: false };

interface AddImageFormProps {
  cardId: string;
}

export function AddImageForm({ cardId }: AddImageFormProps) {
  const [state, formAction, isPending] = useActionState(
    addCardImage,
    emptyResult
  );

  return (
    <form action={formAction} className="space-y-4 p-4 rounded-lg border bg-muted/30">
      <h3 className="font-semibold text-sm">Upload a photo of your card</h3>
      <input type="hidden" name="cardId" value={cardId} />

      <div className="space-y-1.5">
        <Label htmlFor="uploadImage">Photo *</Label>
        <ImageUpload name="image" required />
        {state.errors?.image && (
          <p className="text-sm text-destructive">{state.errors.image[0]}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="caption">Caption</Label>
        <Input
          id="caption"
          name="caption"
          placeholder="e.g. Front of card, graded copy"
        />
        {state.errors?.caption && (
          <p className="text-sm text-destructive">{state.errors.caption[0]}</p>
        )}
      </div>

      {state.errors?._form && (
        <p className="text-sm text-destructive">{state.errors._form[0]}</p>
      )}
      {state.success && (
        <p className="text-sm text-green-600">Photo uploaded successfully!</p>
      )}

      <Button type="submit" disabled={isPending} size="sm">
        {isPending ? "Uploading…" : "Upload Photo"}
      </Button>
    </form>
  );
}
