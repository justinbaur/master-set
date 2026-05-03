import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCollectionRepository } from "@/lib/repositories";
import { CollectionForm } from "@/components/collections/collection-form";
import { DeleteCollectionButton } from "@/components/collections/delete-collection-button";

interface EditCollectionPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: EditCollectionPageProps): Promise<Metadata> {
  const { id } = await params;
  const repo = getCollectionRepository();
  const col = await repo.findById(id);
  if (!col) return { title: "Not Found" };
  return { title: `Edit ${col.name} | Master Set` };
}

export default async function EditCollectionPage({
  params,
}: EditCollectionPageProps) {
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
        ← Back to collection
      </Link>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Edit Collection</h1>
        <p className="text-muted-foreground mt-1 break-words">{collection.name}</p>
      </div>
      <CollectionForm mode="edit" collection={collection} />

      {/* Danger zone */}
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-lg font-semibold text-destructive mb-2">
          Danger Zone
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Deleting this collection will permanently remove all cards and images
          in it. This cannot be undone.
        </p>
        <DeleteCollectionButton collectionId={id} collectionName={collection.name} />
      </div>
    </div>
  );
}
