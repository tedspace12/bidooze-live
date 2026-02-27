"use client";

import { forwardRef } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FormSelectProps {
  label: string;
  name?: string;
  hint?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

export const FormSelect = forwardRef<HTMLButtonElement, FormSelectProps>(
  ({ label, name, hint, error, options, placeholder = "Select...", className, value, defaultValue, onValueChange, disabled }, ref) => {
    const triggerId = name || undefined;

    return (
      <div className="space-y-1.5">
        <label htmlFor={triggerId} className="text-xs font-medium text-muted-foreground">{label}</label>

        <Select value={value} defaultValue={defaultValue} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger
            ref={ref}
            id={triggerId}
            name={name}
            disabled={disabled}
            className={cn(
              "h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm",
              disabled && "opacity-50 cursor-not-allowed",
              error && "border-destructive focus:border-destructive focus:ring-destructive/10",
              className
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>

          <SelectContent className="rounded-md border shadow-md">
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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

FormSelect.displayName = "FormSelect";
