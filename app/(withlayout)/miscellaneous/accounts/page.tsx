import { SubPageShell } from "@/components/miscellaneous/sub-page-shell";
import { AccountsTable } from "@/components/miscellaneous/accounts/AccountsTable";
import { CreditCard } from "lucide-react";

export default function AccountsPage() {
  return (
    <SubPageShell
      eyebrow="Chart of Accounts"
      title="Accounts"
      description="Define every payment method and charge category your auction house uses. Every receipt, payment, and surcharge references an account here."
      icon={CreditCard}
      phase={2}
    >
      <AccountsTable />
    </SubPageShell>
  );
}
