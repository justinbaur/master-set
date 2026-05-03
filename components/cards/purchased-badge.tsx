import { Badge } from "@/components/ui/badge";

interface PurchasedBadgeProps {
  isPurchased: boolean;
  className?: string;
}

export function PurchasedBadge({ isPurchased, className }: PurchasedBadgeProps) {
  if (isPurchased) {
    return (
      <Badge variant="default" className={className}>
        Purchased
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className={className}>
      Wanted
    </Badge>
  );
}
