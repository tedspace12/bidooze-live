import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { Input } from "@/components/ui/input";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, hint, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <Input
          ref={ref}
          className={cn(
            error && "border-destructive focus:border-destructive focus:ring-destructive/10",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-muted-foreground">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
