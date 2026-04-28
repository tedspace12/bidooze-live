import { SubPageShell } from "@/components/miscellaneous/sub-page-shell";
import { FormulasList } from "@/components/miscellaneous/formulas/FormulasList";
import { Calculator } from "lucide-react";

export default function FormulasPage() {
  return (
    <SubPageShell
      eyebrow="Rate Library"
      title="Formulas"
      description="Build your rate library once — buyer's premiums, taxes, commissions, and sliding scales. Reference them from any auction without redefining rates."
      icon={Calculator}
      phase={2}
    >
      <FormulasList />
    </SubPageShell>
  );
}
