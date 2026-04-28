import Link from "next/link";
import { cn } from "@/lib/utils";

type LegalNoticeProps = {
  className?: string;
};

export function LegalNotice({ className }: LegalNoticeProps) {
  return (
    <p className={cn("text-center text-xs leading-5 text-muted-foreground", className)}>
      By continuing, you agree to the{" "}
      <Link
        href="/terms-and-conditions"
        className="font-medium text-foreground underline underline-offset-4"
      >
        Terms and Conditions
      </Link>
      , acknowledge the{" "}
      <Link
        href="/privacy-policy"
        className="font-medium text-foreground underline underline-offset-4"
      >
        Privacy Policy
      </Link>
      , and can review the{" "}
      <Link
        href="/data-deletion"
        className="font-medium text-foreground underline underline-offset-4"
      >
        Data Deletion Instructions
      </Link>
      .
    </p>
  );
}
