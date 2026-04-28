import Link from "next/link";
import { cn } from "@/lib/utils";
import { LEGAL_LINKS } from "@/lib/legal";

type SiteLegalLinksProps = {
  className?: string;
  linkClassName?: string;
};

export function SiteLegalLinks({
  className,
  linkClassName,
}: SiteLegalLinksProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}>
      {LEGAL_LINKS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "text-sm text-muted-foreground transition-colors hover:text-foreground",
            linkClassName
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
