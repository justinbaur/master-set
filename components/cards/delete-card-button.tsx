"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteCard } from "@/lib/actions/delete-card";

interface DeleteCardButtonProps {
  cardId: string;
}

export function DeleteCardButton({ cardId }: DeleteCardButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this card? This action cannot be undone.")) {
      return;
    }
    startTransition(async () => {
      await deleteCard(cardId);
    });
  };

  return (
    <Button
      variant="destructive"
      onClick={handleDelete}
      disabled={isPending}
      size="sm"
    >
      {isPending ? "Deleting…" : "Delete Card"}
    </Button>
  );
}
