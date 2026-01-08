import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    direction: "up" | "down";
    percentage: number;
  };
}

export function StatCard({ label, value, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {label}
          </p>
          <p className="text-3xl font-bold text-foreground">
            {typeof value === "number" && label.includes("Value")
              ? `$${(value / 1000000).toFixed(1)}M`
              : value}
          </p>
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`text-sm font-medium ${
                  trend.direction === "up"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {trend.direction === "up" ? "↑" : "↓"} {trend.percentage}%
              </span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6 text-green-700" />
        </div>
      </div>
    </div>
  );
}
