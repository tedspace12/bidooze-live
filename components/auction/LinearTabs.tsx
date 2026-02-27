import { cn } from "@/lib/utils";
import { Check, AlertTriangle, Lock } from "lucide-react";
import { toast } from "sonner";

interface LinearTab {
  id: string;
  label: string;
  status?: "complete" | "invalid" | "locked" | "current";
}

interface LinearTabsProps {
  tabs: LinearTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function LinearTabs({ tabs, activeTab, onTabChange, className }: LinearTabsProps) {
  return (
    <div className={cn("flex w-full items-center gap-1 rounded-xl bg-muted/50 p-1", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            if (tab.status === "locked") {
              toast.error("Complete previous steps first.");
              return;
            }
            onTabChange(tab.id);
          }}
          className={cn(
            "flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
            tab.status === "current" || activeTab === tab.id
              ? "bg-primary text-primary-foreground shadow-sm"
              : tab.status === "locked"
                ? "text-muted-foreground/60 cursor-not-allowed"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
          )}
          type="button"
          aria-current={activeTab === tab.id ? "step" : undefined}
          aria-disabled={tab.status === "locked" ? true : undefined}
        >
          <span className="inline-flex items-center gap-2">
            {tab.status === "complete" && (
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Check className="h-3 w-3" />
              </span>
            )}
            {tab.status === "invalid" && (
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                <AlertTriangle className="h-3 w-3" />
              </span>
            )}
            {tab.status === "locked" && (
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Lock className="h-3 w-3" />
              </span>
            )}
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}
