import { getCardRepository } from "@/lib/repositories";
import { CardItem } from "./card-item";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CardGridProps {
  collectionId: string;
  filter?: string;
}

export async function CardGrid({ collectionId, filter }: CardGridProps) {
  const repository = getCardRepository();

  const cards =
    filter === "owned"
      ? await repository.findByPurchaseStatus(true, collectionId)
      : filter === "wanted"
        ? await repository.findByPurchaseStatus(false, collectionId)
        : await repository.findAll(collectionId);

  if (cards.length === 0) {
    const emptyMessage =
      filter === "owned"
        ? { heading: "No owned cards yet", sub: "Mark a card as purchased to see it here." }
        : filter === "wanted"
          ? { heading: "Nothing on the wanted list", sub: "All cards in this collection are owned!" }
          : { heading: "No cards yet", sub: "Start building this set by adding your first card." };

    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-4xl mb-4">🃏</p>
        <h2 className="text-2xl font-semibold mb-2">{emptyMessage.heading}</h2>
        <p className="text-muted-foreground mb-6">{emptyMessage.sub}</p>
        {!filter && (
          <Link href={`/collections/${collectionId}/cards/new`}>
            <Button size="lg">Add your first card</Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <CardItem key={card.id} card={card} />
      ))}
    </div>
  );
}

export function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="rounded-lg border bg-muted aspect-[3/4] mb-2" />
          <div className="h-4 bg-muted rounded w-3/4 mb-1" />
          <div className="h-5 bg-muted rounded w-1/3" />
        </div>
      ))}
    </div>
  );
}
