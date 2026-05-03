import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getCardRepository } from "@/lib/repositories";
import { CardForm } from "@/components/cards/card-form";

interface EditCardPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: EditCardPageProps): Promise<Metadata> {
  const { id } = await params;
  const repository = getCardRepository();
  const card = await repository.findById(id);
  if (!card) return { title: "Card Not Found | Master Set" };
  return { title: `Edit ${card.name} | Master Set` };
}

export default async function EditCardPage({ params }: EditCardPageProps) {
  const { id } = await params;
  const repository = getCardRepository();
  const card = await repository.findById(id);

  if (!card) notFound();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link
        href={`/cards/${card.id}`}
        className="text-sm text-muted-foreground hover:text-foreground mb-6 block"
      >
        ← Back to card
      </Link>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Edit Card</h1>
        <p className="text-muted-foreground mt-1 break-words">{card.name}</p>
      </div>
      <CardForm mode="edit" card={card} />
    </div>
  );
}
