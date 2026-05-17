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
      <div className="card-tcg-shine rounded-xl border border-border bg-card overflow-hidden shadow-md transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-[0_0_28px_oklch(0.75_0.16_82_/_0.28)] group-hover:-translate-y-1">
        <div className="relative aspect-[3/4] bg-muted overflow-hidden">
          <Image
            src={card.thumbnailUrl}
            alt={card.name}
            fill
            className="object-cover transition-transform duration-400 group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        </div>
        <div className="p-3 space-y-1.5 border-t border-border/60">
          <p className="font-medium text-sm line-clamp-2 leading-snug">
            {card.name}
          </p>
          <PurchasedBadge isPurchased={card.isPurchased} />
        </div>
      </div>
    </Link>
  );
}
