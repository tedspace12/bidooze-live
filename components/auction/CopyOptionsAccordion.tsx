import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyOption {
  id: string;
  label: string;
  checked: boolean;
}

interface CopyOptionsAccordionProps {
  options: CopyOption[];
  onOptionChange: (id: string, checked: boolean) => void;
}

export function CopyOptionsAccordion({ options, onOptionChange }: CopyOptionsAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const checkedCount = options.filter(o => o.checked).length;

  return (
    <div className="rounded-lg border border-border-subtle overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 bg-accent/30 hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Copy Options</span>
          <span className="text-xs text-muted-foreground">
            ({checkedCount} selected)
          </span>
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>
      
      <div className={cn(
        "grid transition-all duration-200",
        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}>
        <div className="overflow-hidden">
          <div className="p-4 space-y-2 bg-card">
            {options.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className={cn(
                  "h-5 w-5 rounded border-2 flex items-center justify-center transition-all duration-150",
                  option.checked 
                    ? "bg-primary border-primary" 
                    : "border-border group-hover:border-primary/50"
                )}>
                  {option.checked && (
                    <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
                  )}
                </div>
                <span className="text-sm text-foreground">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
