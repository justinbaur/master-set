import Link from "next/link";
import { getCollectionRepository, getCardRepository } from "@/lib/repositories";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Collections | Master Set",
};

export default async function HomePage() {
  const collectionRepo = getCollectionRepository();
  const cardRepo = getCardRepository();
  const collections = await collectionRepo.findAll();

  // Fetch counts for each collection in parallel
  const stats = await Promise.all(
    collections.map(async (col) => {
      const [total, purchased] = await Promise.all([
        cardRepo.count(col.id),
        cardRepo.findByPurchaseStatus(true, col.id).then((c) => c.length),
      ]);
      return { collectionId: col.id, total, purchased };
    })
  );

  const statsMap = Object.fromEntries(
    stats.map((s) => [s.collectionId, s])
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-[0.05em] uppercase">My Collections</h1>
          <p className="text-muted-foreground mt-1">
            {collections.length === 0
              ? "Create your first collection to get started"
              : `${collections.length} collection${collections.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link href="/collections/new">
          <Button>+ New Collection</Button>
        </Link>
      </div>

      {collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-5xl mb-4">📦</p>
          <h2 className="text-2xl font-semibold mb-2">No collections yet</h2>
          <p className="text-muted-foreground mb-6">
            A collection groups cards for a single set or game.
          </p>
          <Link href="/collections/new">
            <Button size="lg">Create your first collection</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((col) => {
            const s = statsMap[col.id];
            const pct =
              s.total > 0 ? Math.round((s.purchased / s.total) * 100) : 0;

            return (
              <Link
                key={col.id}
                href={`/collections/${col.id}`}
                className="group block rounded-xl border border-border bg-card p-6 shadow-md hover:border-primary/40 hover:shadow-[0_0_24px_oklch(0.75_0.16_82_/_0.18)] transition-all duration-300"
              >
                <h2 className="text-lg font-semibold group-hover:text-primary transition-colors mb-1">
                  {col.name}
                </h2>
                {col.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {col.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <span>{s.total} card{s.total !== 1 ? "s" : ""}</span>
                  <span>·</span>
                  <span>{s.purchased} purchased</span>
                  {s.total > 0 && (
                    <>
                      <span>·</span>
                      <span>{pct}%</span>
                    </>
                  )}
                </div>
                {s.total > 0 && (
                  <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
