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
    <div className="bg-white rounded-xl shadow-sm border border-border p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {label}
          </p>
          <p className="text-2xl font-bold text-foreground sm:text-3xl">
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
                {trend.direction === "up" ? "+" : "-"} {trend.percentage}%
              </span>
            </div>
          )}
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 sm:w-12 sm:h-12">
          <Icon className="w-5 h-5 text-green-700 sm:w-6 sm:h-6" />
        </div>
      </div>
    </div>
  );
}
