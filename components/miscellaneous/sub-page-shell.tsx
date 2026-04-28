import type { LucideIcon } from "lucide-react";

interface SubPageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Which phase this sub-page is scheduled for */
  phase: 2 | 3 | 4;
  children?: React.ReactNode;
}

const PHASE_LABELS: Record<2 | 3 | 4, string> = {
  2: "Phase 2 — Core sub-pages",
  3: "Phase 3 — Team & locations",
  4: "Phase 4 — Polish",
};

export function SubPageShell({
  eyebrow,
  title,
  description,
  icon: Icon,
  phase,
  children,
}: SubPageShellProps) {
  return (
    <div className="min-h-full px-4 py-4 sm:px-6 sm:py-10 lg:px-8">
      {/* Section header */}
      <header className="border-b border-border/40 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/40 bg-muted/50">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {eyebrow}
            </p>
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          </div>
        </div>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">{description}</p>
      </header>

      {/* Page content */}
      {children ?? (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border/50 bg-muted/30">
            <Icon className="h-6 w-6 text-muted-foreground" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-foreground">
            {title} configuration coming soon
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            This section is scheduled for{" "}
            <span className="font-medium text-foreground">{PHASE_LABELS[phase]}</span>.
          </p>
        </div>
      )}
    </div>
  );
}
