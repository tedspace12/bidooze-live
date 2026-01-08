import { cn } from "@/lib/utils";

interface LinearTab {
  id: string;
  label: string;
}

interface LinearTabsProps {
  tabs: LinearTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function LinearTabs({ tabs, activeTab, onTabChange, className }: LinearTabsProps) {
  return (
    <div className={cn("flex items-center gap-1 p-1 rounded-lg bg-muted/50 w-fit", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
            activeTab === tab.id
              ? "bg-primary text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
          )}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
