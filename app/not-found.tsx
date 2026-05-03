import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <h2 className="text-4xl font-bold mb-4">404</h2>
      <p className="text-muted-foreground mb-8">
        This page or card could not be found.
      </p>
      <Link href="/">
        <Button>Go to collection</Button>
      </Link>
    </div>
  );
}
