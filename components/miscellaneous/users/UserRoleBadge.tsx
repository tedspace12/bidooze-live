import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/miscellaneous/types";

export const ROLE_LABELS: Record<UserRole, string> = {
  owner: "Owner",
  admin: "Admin",
  clerk: "Clerk",
  cataloger: "Cataloger",
  accountant: "Accountant",
  custom: "Custom",
};

const ROLE_STYLES: Record<UserRole, string> = {
  owner: "bg-green-700/10 text-green-700 border-green-700/25",
  admin: "bg-blue-500/10 text-blue-700 border-blue-500/25",
  clerk: "bg-orange-500/10 text-orange-700 border-orange-500/25",
  cataloger: "bg-purple-500/10 text-purple-700 border-purple-500/25",
  accountant: "bg-yellow-500/10 text-yellow-700 border-yellow-500/25",
  custom: "bg-muted text-muted-foreground border-border/50",
};

export function UserRoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        ROLE_STYLES[role]
      )}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}
