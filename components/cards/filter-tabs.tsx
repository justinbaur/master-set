import Link from "next/link";

interface FilterTabsProps {
  baseUrl: string;
  currentFilter?: string;
}

const TABS = [
  { label: "All", value: undefined },
  { label: "Owned", value: "owned" },
  { label: "Wanted", value: "wanted" },
] as const;

export function FilterTabs({ baseUrl, currentFilter }: FilterTabsProps) {
  return (
    <div className="flex gap-1 rounded-lg border border-border bg-muted/60 p-1 w-fit">
      {TABS.map(({ label, value }) => {
        const isActive =
          currentFilter === value || (!currentFilter && value === undefined);
        const href = value ? `${baseUrl}?filter=${value}` : baseUrl;
        return (
          <Link
            key={label}
            href={href}
            className={[
              "rounded-md px-3 py-1 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
            ].join(" ")}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
