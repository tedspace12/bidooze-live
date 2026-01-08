import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SelectionCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  isActive: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}

export function SelectionCard({
  icon: Icon,
  title,
  subtitle,
  isActive,
  onClick,
  children,
}: SelectionCardProps) {
  return (
    <div
      className={cn(
        "selection-card group",
        isActive && "active"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-200",
          isActive ? "bg-primary/10" : "bg-secondary"
        )}>
          <Icon className={cn(
            "h-6 w-6 transition-colors duration-200",
            isActive ? "text-green-700" : "text-muted-foreground"
          )} strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className={cn(
          "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
          isActive 
            ? "border-primary bg-primary" 
            : "border-border"
        )}>
          {isActive && (
            <svg className="h-3 w-3 text-primary-foreground" fill="currentColor" viewBox="0 0 12 12">
              <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
            </svg>
          )}
        </div>
      </div>
      
      {isActive && children && (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300 border-t border-border pt-6">
          {children}
        </div>
      )}
    </div>
  );
}
