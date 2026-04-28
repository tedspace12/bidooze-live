import { SubPageShell } from "@/components/miscellaneous/sub-page-shell";
import { CompanyForm } from "@/components/miscellaneous/company/CompanyForm";
import { Building2 } from "lucide-react";

export default function CompanyPage() {
  return (
    <SubPageShell
      eyebrow="Identity & Branding"
      title="Company"
      description="Your auction house identity — legal name, contact details, invoice defaults, and security policies."
      icon={Building2}
      phase={2}
    >
      <CompanyForm />
    </SubPageShell>
  );
}
