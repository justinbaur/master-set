"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "./image-upload";
import { createCard } from "@/lib/actions/create-card";
import { updateCard } from "@/lib/actions/update-card";
import type { Card, ActionResult } from "@/lib/types/card";

const emptyResult: ActionResult<Card> = { success: false };

interface CardFormProps {
  mode?: "create" | "edit";
  card?: Card;
  collectionId?: string;
}

export function CardForm({ mode = "create", card, collectionId }: CardFormProps) {
  const router = useRouter();
  const action = mode === "create" ? createCard : updateCard;
  const [state, formAction, isPending] = useActionState(action, emptyResult);
  const [hasImage, setHasImage] = useState(mode === "edit");

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden fields */}
      {mode === "edit" && card && (
        <input type="hidden" name="id" value={card.id} />
      )}
      {mode === "create" && collectionId && (
        <input type="hidden" name="collectionId" value={collectionId} />
      )}

      {/* Card Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Card Name *</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={card?.name}
          placeholder="e.g. Charizard Base Set 4/102"
        />
        {state.errors?.name && (
          <p className="text-sm text-destructive">{state.errors.name[0]}</p>
        )}
      </div>

      {/* Image Upload (only in create mode) */}
      {mode === "create" && (
        <div className="space-y-1.5">
          <Label htmlFor="image">Card Image *</Label>
          <ImageUpload
            name="image"
            required
            onFileSelected={(f) => setHasImage(f !== null)}
          />
          {state.errors?.image && (
            <p className="text-sm text-destructive">{state.errors.image[0]}</p>
          )}
          {state.errors?.collectionId && (
            <p className="text-sm text-destructive">
              {state.errors.collectionId[0]}
            </p>
          )}
        </div>
      )}

      {/* Purchase Link */}
      <div className="space-y-1.5">
        <Label htmlFor="purchaseLink">Purchase Link</Label>
        <Input
          id="purchaseLink"
          name="purchaseLink"
          type="url"
          defaultValue={card?.purchaseLink ?? ""}
          placeholder="https://example.com/listing"
        />
        <p className="text-xs text-muted-foreground">
          Where you found this card for sale
        </p>
        {state.errors?.purchaseLink && (
          <p className="text-sm text-destructive">
            {state.errors.purchaseLink[0]}
          </p>
        )}
      </div>

      {/* Max Price (wanted state only) */}
      {(mode === "create" || (mode === "edit" && !card?.isPurchased)) && (
        <div className="space-y-1.5">
          <Label htmlFor="maxPrice">Max Budget</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            <Input
              id="maxPrice"
              name="maxPrice"
              type="number"
              min="0.01"
              step="0.01"
              defaultValue={card?.maxPrice ?? ""}
              placeholder="0.00"
              className="pl-7"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Maximum you&apos;re willing to spend on this card
          </p>
          {state.errors?.maxPrice && (
            <p className="text-sm text-destructive">{state.errors.maxPrice[0]}</p>
          )}
        </div>
      )}

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={card?.notes ?? ""}
          placeholder="Condition, grade, set details, etc."
        />
        {state.errors?.notes && (
          <p className="text-sm text-destructive">{state.errors.notes[0]}</p>
        )}
      </div>

      {/* Form-level error */}
      {state.errors?._form && (
        <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
          {state.errors._form[0]}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isPending || (mode === "create" && !hasImage)}
        >
          {isPending
            ? mode === "create"
              ? "Adding card…"
              : "Saving…"
            : mode === "create"
              ? "Add Card"
              : "Save Changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
