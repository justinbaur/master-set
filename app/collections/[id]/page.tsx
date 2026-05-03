import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCollectionRepository } from "@/lib/repositories";
import { CardGrid, CardGridSkeleton } from "@/components/cards/card-grid";
import { FilterTabs } from "@/components/cards/filter-tabs";
import { Button } from "@/components/ui/button";

interface CollectionPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ filter?: string }>;
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { id } = await params;
  const repository = getCollectionRepository();
  const collection = await repository.findById(id);
  if (!collection) return { title: "Not Found | Master Set" };
  return { title: `${collection.name} | Master Set` };
}

export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const [{ id }, { filter }] = await Promise.all([params, searchParams]);
  const repository = getCollectionRepository();
  const collection = await repository.findById(id);

  if (!collection) notFound();

  const validFilter =
    filter === "owned" || filter === "wanted" ? filter : undefined;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{collection.name}</h1>
          {collection.description && (
            <p className="text-muted-foreground mt-1">{collection.description}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href={`/collections/${id}/edit`}>
            <Button variant="outline" size="sm">Edit</Button>
          </Link>
          <Link href={`/collections/${id}/cards/new`}>
            <Button size="sm">+ Add Card</Button>
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <FilterTabs baseUrl={`/collections/${id}`} currentFilter={validFilter} />
      </div>

      <Suspense fallback={<CardGridSkeleton />}>
        <CardGrid collectionId={id} filter={validFilter} />
      </Suspense>
    </div>
  );
}
