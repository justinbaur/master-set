import Image from "next/image";
import Link from "next/link";
import type { Card } from "@/lib/types/card";
import { PurchasedBadge } from "./purchased-badge";

interface CardItemProps {
  card: Card;
}

export function CardItem({ card }: CardItemProps) {
  return (
    <Link href={`/cards/${card.id}`} className="group block">
      <div className="rounded-lg border bg-card overflow-hidden shadow-sm transition-shadow group-hover:shadow-md">
        <div className="relative aspect-[3/4] bg-muted">
          <Image
            src={card.thumbnailUrl}
            alt={card.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>
        <div className="p-3 space-y-1">
          <p className="font-medium text-sm line-clamp-2 leading-snug">
            {card.name}
          </p>
          <PurchasedBadge isPurchased={card.isPurchased} />
        </div>
      </div>
    </Link>
  );
}
