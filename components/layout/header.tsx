import Link from "next/link";
import { getCollectionRepository } from "@/lib/repositories";
import { CollectionNav } from "./collection-nav";
import { UserBadge } from "./user-badge";
import { auth } from "@/auth";

export async function Header() {
  const [collections, session] = await Promise.all([
    getCollectionRepository().findAll(),
    auth(),
  ]);

  return (
    <header className="border-b border-border bg-card/90 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-base font-bold tracking-[0.12em] uppercase shrink-0 text-primary hover:text-primary/80 transition-colors"
        >
          Master Set
        </Link>

        {/* Collection nav */}
        <div className="flex-1 flex items-center justify-end md:justify-start min-w-0">
          <CollectionNav collections={collections} />
        </div>

        {/* User badge */}
        {session?.user && (
          <UserBadge
            name={session.user.name}
            email={session.user.email}
            image={session.user.image}
          />
        )}
      </div>
    </header>
  );
}
