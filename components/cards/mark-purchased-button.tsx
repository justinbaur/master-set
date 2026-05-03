"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { markCardPurchased } from "@/lib/actions/mark-purchased";

interface MarkPurchasedButtonProps {
  cardId: string;
  isPurchased: boolean;
}

export function MarkPurchasedButton({
  cardId,
  isPurchased,
}: MarkPurchasedButtonProps) {
  const [purchased, setPurchased] = useState(isPurchased);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await markCardPurchased(cardId, !purchased);
      if (result.success) {
        setPurchased(!purchased);
      }
    });
  };

  return (
    <Button
      variant={purchased ? "outline" : "default"}
      onClick={handleToggle}
      disabled={isPending}
    >
      {isPending
        ? "Updating…"
        : purchased
          ? "Mark as Wanted"
          : "Mark as Purchased"}
    </Button>
  );
}
