import type { Metadata } from "next";
import { CardForm } from "@/components/cards/card-form";

export const metadata: Metadata = {
  title: "Add New Card | Master Set",
  description: "Add a new trading card to your master set collection",
};

export default function NewCardPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Add New Card</h1>
        <p className="text-muted-foreground mt-1">
          Upload an image and fill in the card details
        </p>
      </div>
      <CardForm mode="create" />
    </div>
  );
}
