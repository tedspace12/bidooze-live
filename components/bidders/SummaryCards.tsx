import { Users, ShieldCheck, ShieldX, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { BidderType } from '@/types/bidder';
import { cn } from '@/lib/utils';

interface SummaryCardsProps {
  bidders: BidderType[];
}

export function SummaryCards({ bidders }: SummaryCardsProps) {
  const totalBidders = bidders.length;
  const blockedBidders = bidders.filter((b) => b.isBlocked).length;
  const excellentBidders = bidders.filter((b) => b.reputation === 'excellent').length;
  const averageWinRate = Math.round(
    bidders.reduce((acc, b) => acc + b.winRate, 0) / bidders.length
  );

  const cards = [
    {
      title: 'Total Bidders',
      value: totalBidders,
      icon: Users,
      color: 'text-green-700',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Excellent Reputation',
      value: excellentBidders,
      icon: ShieldCheck,
      color: 'text-reputation-excellent',
      bgColor: 'bg-reputation-excellent-bg',
    },
    {
      title: 'Blocked Bidders',
      value: blockedBidders,
      icon: ShieldX,
      color: 'text-status-blocked',
      bgColor: 'bg-status-blocked-bg',
    },
    {
      title: 'Avg. Win Rate',
      value: `${averageWinRate}%`,
      icon: TrendingUp,
      color: 'text-reputation-good',
      bgColor: 'bg-reputation-good-bg',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          className="border-border bg-card shadow-sm transition-shadow hover:shadow-md"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <CardContent className="flex items-center gap-4 p-5">
            <div className={cn('rounded-lg p-3', card.bgColor)}>
              <card.icon className={cn('h-5 w-5', card.color)} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
              <p className="text-2xl font-semibold text-foreground">{card.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
