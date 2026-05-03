"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteCollection } from "@/lib/actions/delete-collection";

interface DeleteCollectionButtonProps {
  collectionId: string;
  collectionName: string;
}

export function DeleteCollectionButton({
  collectionId,
  collectionName,
}: DeleteCollectionButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (
      !confirm(
        `Delete "${collectionName}"? This will permanently remove all cards and photos in this collection.`
      )
    ) {
      return;
    }
    startTransition(async () => {
      await deleteCollection(collectionId);
    });
  };

  return (
    <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
      {isPending ? "Deleting…" : "Delete Collection"}
    </Button>
  );
}
