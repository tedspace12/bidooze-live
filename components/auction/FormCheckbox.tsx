import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface FormCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, description, className, checked, onChange, ...props }, ref) => {
    return (
      <label className={cn("flex items-start gap-3 cursor-pointer group", className)}>
        <div className="relative mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="peer sr-only"
            {...props}
          />
          <div className={cn(
            "h-5 w-5 rounded border-2 flex items-center justify-center transition-all duration-150",
            checked 
              ? "bg-primary border-primary" 
              : "border-border group-hover:border-primary/50"
          )}>
            {checked && (
              <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
            )}
          </div>
        </div>
        <div className="flex-1">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </label>
    );
  }
);

FormCheckbox.displayName = "FormCheckbox";
