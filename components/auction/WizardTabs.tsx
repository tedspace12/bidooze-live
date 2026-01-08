import { cn } from "@/lib/utils";

interface WizardTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface WizardTabsProps {
  tabs: WizardTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function WizardTabs({ tabs, activeTab, onTabChange }: WizardTabsProps) {
  return (
    <div className="flex items-center justify-center gap-3 p-2 bg-card rounded-full border border-border shadow-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "wizard-tab flex items-center justify-center gap-2",
            activeTab === tab.id ? "active" : "inactive"
          )}
        >
          {tab.icon && <span className="flex items-center">{tab.icon}</span>}
          <span className="tracking-wide">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
