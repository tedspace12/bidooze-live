import { ReputationStatus, REPUTATION_CONFIG } from '@/types/bidder';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ReputationBadgeProps {
  reputation: ReputationStatus;
  showTooltip?: boolean;
  size?: 'sm' | 'md';
}

const reputationStyles: Record<ReputationStatus, string> = {
  low_trust: 'bg-red-100 text-red-700',
  neutral: 'bg-gray-100 text-gray-700',
  reliable: 'bg-blue-100 text-blue-700',
  trusted: 'bg-emerald-100 text-emerald-700',
  elite: 'bg-purple-100 text-purple-700',
};


export function ReputationBadge({ reputation, showTooltip = true, size = 'md' }: ReputationBadgeProps) {
  const config = REPUTATION_CONFIG[reputation];
  
  const badge = (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        reputationStyles[reputation],
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      )}
    >
      {config.label}
    </span>
  );

  if (!showTooltip) return badge;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {badge}
      </TooltipTrigger>
      <TooltipContent className="max-w-xs bg-popover text-popover-foreground">
        <p className="text-sm">{config.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}
