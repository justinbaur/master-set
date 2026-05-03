"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Collection } from "@/lib/types/card";

interface CollectionNavProps {
  collections: Collection[];
}

function getActiveCollectionId(pathname: string): string | null {
  const match = pathname.match(/^\/collections\/([^/]+)/);
  return match ? match[1] : null;
}

export function CollectionNav({ collections }: CollectionNavProps) {
  const pathname = usePathname();
  const activeId = getActiveCollectionId(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <>
      {/* Desktop tabs — shown on md+ */}
      <nav
        className="hidden md:flex items-center gap-1 overflow-x-auto"
        aria-label="Collections"
      >
        {collections.map((col) => {
          const isActive = col.id === activeId;
          return (
            <Link
              key={col.id}
              href={`/collections/${col.id}`}
              className={[
                "px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              ].join(" ")}
            >
              {col.name}
            </Link>
          );
        })}
        <Link
          href="/collections/new"
          className="px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="New collection"
        >
          +
        </Link>
      </nav>

      {/* Mobile hamburger — shown below md */}
      <div className="relative md:hidden" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            // ✕ close icon
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            // ☰ hamburger icon
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border bg-popover shadow-lg z-50 py-1">
            {/* Collections list */}
            {collections.length > 0 && (
              <>
                <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Collections
                </p>
                {collections.map((col) => {
                  const isActive = col.id === activeId;
                  return (
                    <Link
                      key={col.id}
                      href={`/collections/${col.id}`}
                      onClick={() => setMenuOpen(false)}
                      className={[
                        "flex items-center px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground hover:bg-muted",
                      ].join(" ")}
                    >
                      {isActive && (
                        <span className="mr-2 h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                      {col.name}
                    </Link>
                  );
                })}
              </>
            )}

            {/* Divider */}
            <div className="my-1 border-t" />

            {/* New Collection */}
            <Link
              href="/collections/new"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Collection
            </Link>

            {/* Settings placeholder */}
            <button
              type="button"
              disabled
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed opacity-50"
              title="Coming soon"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Settings
              <span className="ml-auto text-xs bg-muted rounded px-1">
                Soon
              </span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
