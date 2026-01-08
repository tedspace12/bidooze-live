import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { Textarea } from "@/components/ui/textarea";

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, hint, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <Textarea
          ref={ref}
          className={cn(
            "min-h-[100px] resize-y",
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

FormTextarea.displayName = "FormTextarea";
