import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  isBlocked: boolean;
}

export function StatusBadge({ isBlocked }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        isBlocked
          ? 'bg-status-blocked-bg text-status-blocked'
          : 'bg-status-active-bg text-status-active'
      )}
    >
      {isBlocked ? 'Blocked' : 'Active'}
    </span>
  );
}
