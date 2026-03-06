import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface WizardShellProps {
  title: string;
  description?: string;
  stepLabel?: string;
  leading?: ReactNode;
  headerCenter?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

export function WizardShell({
  title,
  description,
  stepLabel,
  leading,
  headerCenter,
  actions,
  children,
}: WizardShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-5 space-y-3 sm:space-y-4">
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              {leading && <div className="pt-1">{leading}</div>}
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{stepLabel}</p>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h1>
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
              </div>
            </div>
            {actions && <div className="hidden lg:flex items-center gap-3">{actions}</div>}
          </div>
          {headerCenter && <div className="hidden md:flex justify-center">{headerCenter}</div>}
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 lg:pb-8">{children}</main>
    </div>
  );
}

interface WizardStepRailProps {
  children: ReactNode;
  className?: string;
}

export function WizardStepRail({ children, className }: WizardStepRailProps) {
  return (
    <div className={cn("rounded-2xl border border-border bg-muted/30 p-2", className)}>
      {children}
    </div>
  );
}

interface WizardSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function WizardSection({ title, description, children, className }: WizardSectionProps) {
  return (
    <section className={cn("rounded-2xl border border-border bg-background p-6 shadow-sm", className)}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}
