import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getCardRepository, getCollectionRepository } from "@/lib/repositories";
import { PurchasedBadge } from "@/components/cards/purchased-badge";
import { MarkPurchasedButton } from "@/components/cards/mark-purchased-button";
import { AddImageForm } from "@/components/cards/add-image-form";
import { DeleteCardButton } from "@/components/cards/delete-card-button";
import { Button } from "@/components/ui/button";

interface CardDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: CardDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const repository = getCardRepository();
  const card = await repository.findById(id);
  if (!card) return { title: "Card Not Found | Master Set" };
  return {
    title: `${card.name} | Master Set`,
    description: card.notes ?? `View details for ${card.name}`,
  };
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function CardDetailPage({ params }: CardDetailPageProps) {
  const { id } = await params;
  const repository = getCardRepository();
  const card = await repository.findById(id);

  if (!card) notFound();

  const collectionRepo = getCollectionRepository();
  const collection = await collectionRepo.findById(card.collectionId);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back link */}
      <Link href={`/collections/${card.collectionId}`} className="mb-6 block w-fit">
        <Button variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4" />
          Back to collection
        </Button>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-[0.04em] break-words">
            {card.name}
          </h1>
          <div className="mt-2">
            <PurchasedBadge isPurchased={card.isPurchased} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <MarkPurchasedButton cardId={card.id} isPurchased={card.isPurchased} />
          <Link href={`/cards/${card.id}/edit`}>
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </Link>
          <DeleteCardButton cardId={card.id} />
        </div>
      </div>

      {/* Main image */}
      <div className="relative w-full aspect-[4/3] bg-muted rounded-xl overflow-hidden mb-8">
        <Image
          src={card.imageUrl}
          alt={card.name}
          fill
          className="object-contain p-4"
          priority
          sizes="(max-width: 768px) 100vw, 896px"
        />
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {card.purchaseLink && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Purchase Link
            </h3>
            <a
              href={card.purchaseLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              {new URL(card.purchaseLink).hostname.replace(/^www\./, "")}
            </a>
          </div>
        )}

        {!card.isPurchased && card.maxPrice != null && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Max Budget
            </h3>
            <p className="text-sm font-medium">
              ${card.maxPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        )}

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Added
          </h3>
          <p className="text-sm">{formatDate(card.createdAt)}</p>
        </div>

        {card.isPurchased && card.purchasedAt && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Purchased
            </h3>
            <p className="text-sm">{formatDate(card.purchasedAt)}</p>
          </div>
        )}
      </div>

      {card.notes && (
        <div className="mb-8">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Notes
          </h3>
          <p className="text-sm whitespace-pre-wrap bg-muted/40 rounded-lg p-4">
            {card.notes}
          </p>
        </div>
      )}

      {/* Physical card photos */}
      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold mb-4">Physical Card Photos</h2>

        {card.isPurchased && (
          <div className="mb-6">
            <AddImageForm cardId={card.id} />
          </div>
        )}

        {card.uploadedImages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {card.uploadedImages.map((img) => (
              <div key={img.id} className="space-y-1">
                <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                  <Image
                    src={img.thumbnailUrl}
                    alt={img.caption ?? "Card photo"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                </div>
                {img.caption && (
                  <p className="text-xs text-muted-foreground">{img.caption}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {card.isPurchased
              ? "No photos uploaded yet. Upload a photo above."
              : "Mark this card as purchased to upload photos of the physical card."}
          </p>
        )}
      </div>
    </div>
  );
}
