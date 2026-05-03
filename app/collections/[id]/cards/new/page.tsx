import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCollectionRepository } from "@/lib/repositories";
import { CardForm } from "@/components/cards/card-form";

interface NewCardPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: NewCardPageProps): Promise<Metadata> {
  const { id } = await params;
  const repo = getCollectionRepository();
  const col = await repo.findById(id);
  if (!col) return { title: "Not Found" };
  return { title: `Add Card to ${col.name} | Master Set` };
}

export default async function NewCardInCollectionPage({
  params,
}: NewCardPageProps) {
  const { id } = await params;
  const repo = getCollectionRepository();
  const collection = await repo.findById(id);

  if (!collection) notFound();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link
        href={`/collections/${id}`}
        className="text-sm text-muted-foreground hover:text-foreground mb-6 block"
      >
        ← Back to {collection.name}
      </Link>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Add New Card</h1>
        <p className="text-muted-foreground mt-1">{collection.name}</p>
      </div>
      <CardForm mode="create" collectionId={id} />
    </div>
  );
}
