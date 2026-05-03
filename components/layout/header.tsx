import Link from "next/link";
import { getCollectionRepository } from "@/lib/repositories";
import { CollectionNav } from "./collection-nav";
import { auth, signOut } from "@/auth";

export async function Header() {
  const [collections, session] = await Promise.all([
    getCollectionRepository().findAll(),
    auth(),
  ]);

  return (
    <header className="border-b bg-white sticky top-0 z-10">
      <div className="container mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-bold tracking-tight shrink-0"
        >
          Master Set
        </Link>

        {/* Collection nav */}
        <div className="flex-1 flex items-center justify-end md:justify-start min-w-0">
          <CollectionNav collections={collections} />
        </div>

        {/* Sign-out */}
        {session?.user && (
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="hidden md:block text-sm text-muted-foreground hover:text-foreground shrink-0"
            >
              Sign out
            </button>
          </form>
        )}
      </div>
    </header>
  );
}
