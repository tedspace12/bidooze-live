import { SubPageShell } from "@/components/miscellaneous/sub-page-shell";
import { UsersTable } from "@/components/miscellaneous/users/UsersTable";
import { Users } from "lucide-react";

export default function UsersPage() {
  return (
    <SubPageShell
      eyebrow="Team & Access"
      title="Users"
      description="Manage your team, their roles, and per-auction access. From full admin rights to read-only clerks and catalogers."
      icon={Users}
      phase={3}
    >
      <UsersTable />
    </SubPageShell>
  );
}
