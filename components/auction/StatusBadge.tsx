import { cn } from "@/lib/utils";

type StatusType = "live" | "closed" | "completed" | "pending";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string; dotClass: string }> = {
  live: {
    label: "Live",
    className: "status-live",
    dotClass: "bg-status-live animate-pulse",
  },
  closed: {
    label: "Closed",
    className: "status-closed",
    dotClass: "bg-status-closed",
  },
  completed: {
    label: "Completed",
    className: "status-completed",
    dotClass: "bg-status-completed",
  },
  pending: {
    label: "Pending",
    className: "status-pending",
    dotClass: "bg-status-pending",
  },
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn("status-badge", config.className, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dotClass)} />
      {label || config.label}
    </span>
  );
}
