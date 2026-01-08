import { cn } from "@/lib/utils";

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  accentBorder?: boolean;
}

export function FormSection({ 
  title, 
  description, 
  children, 
  className,
  accentBorder = true 
}: FormSectionProps) {
  return (
    <div className={cn(
      accentBorder ? "premium-card-accent" : "premium-card",
      "animate-in fade-in slide-in-from-bottom-2 duration-300",
      className
    )}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
