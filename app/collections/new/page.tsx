import type { Metadata } from "next";
import { CollectionForm } from "@/components/collections/collection-form";

export const metadata: Metadata = {
  title: "New Collection | Master Set",
};

export default function NewCollectionPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">New Collection</h1>
        <p className="text-muted-foreground mt-1">
          Create a new set to track
        </p>
      </div>
      <CollectionForm mode="create" />
    </div>
  );
}
