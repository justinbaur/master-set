import { Badge } from "@/components/ui/badge";

interface PurchasedBadgeProps {
  isPurchased: boolean;
  className?: string;
}

export function PurchasedBadge({ isPurchased, className }: PurchasedBadgeProps) {
  if (isPurchased) {
    return (
      <Badge variant="default" className={className}>
        Owned
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className={`border-violet-500/60 text-violet-400 bg-violet-950/20 ${className ?? ""}`}
    >
      Wanted
    </Badge>
  );
}
