import { Eye, Ban, CheckCircle, MoreHorizontal } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { BidderType } from '@/types/bidder';
import { BidderAvatar } from './BidderAvatar';
import { ReputationBadge } from './ReputationBadge';
import { StatusBadge } from './StatusBadge';
import {
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface BidderTableProps {
  bidders: BidderType[];
  selectedIds: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onView: (bidder: BidderType) => void;
  onBlock: (bidder: BidderType) => void;
  onUnblock: (bidder: BidderType) => void;
  isLoading?: boolean;
}

interface BidderActionsMenuProps {
  bidder: BidderType;
  onView: (bidder: BidderType) => void;
  onBlock: (bidder: BidderType) => void;
  onUnblock: (bidder: BidderType) => void;
  triggerClassName?: string;
}

function BidderActionsMenu({
  bidder,
  onView,
  onBlock,
  onUnblock,
  triggerClassName,
}: BidderActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn('h-8 w-8', triggerClassName)}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem className="gap-2" onClick={() => onView(bidder)}>
          <Eye className="h-4 w-4" />
          View Details
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {bidder.isBlocked ? (
          <DropdownMenuItem
            className="gap-2 text-emerald-600 focus:text-emerald-600"
            onClick={() => onUnblock(bidder)}
          >
            <CheckCircle className="h-4 w-4" />
            Approve
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="gap-2 text-destructive focus:text-destructive"
            onClick={() => onBlock(bidder)}
          >
            <Ban className="h-4 w-4" />
            Block
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function BidderTable({
  bidders,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onView,
  onBlock,
  onUnblock,
  isLoading,
}: BidderTableProps) {
  const allSelected = bidders.length > 0 && bidders.every((b) => selectedIds.has(b.id));
  const someSelected = bidders.some((b) => selectedIds.has(b.id)) && !allSelected;

  if (isLoading) {
    return <BidderTableSkeleton />;
  }

  if (bidders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-16">
        <div className="mb-4 rounded-full bg-muted p-4">
          <Eye className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">No bidders found</h3>
        <p className="text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <Table className="table-fixed sm:table-auto">
        <TableHeader>
          <TableRow className="border-border bg-muted/50 hover:bg-muted/50">
            <TableHead className="hidden w-10 sm:table-cell">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => onSelectAll(checked === true)}
                aria-label="Select all bidders"
                className={someSelected ? 'data-[state=checked]:bg-primary' : ''}
              />
            </TableHead>
            <TableHead className="whitespace-normal">Bidder</TableHead>
            <TableHead className="hidden md:table-cell">Contact</TableHead>
            <TableHead className="hidden md:table-cell">Reputation</TableHead>
            <TableHead className="hidden lg:table-cell">Country</TableHead>
            <TableHead className="hidden lg:table-cell text-right">Bids</TableHead>
            <TableHead className="hidden lg:table-cell text-right">Win Rate</TableHead>
            <TableHead className="hidden sm:table-cell">Status</TableHead>
            <TableHead className="w-12 text-right sm:w-16">
              <span className="sr-only sm:not-sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bidders.map((bidder, index) => (
            <TableRow
              key={bidder.id}
              className="group border-border transition-colors hover:bg-muted/30"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <TableCell className="hidden sm:table-cell">
                <Checkbox
                  checked={selectedIds.has(bidder.id)}
                  onCheckedChange={(checked) => onSelectOne(bidder.id, checked === true)}
                  aria-label={`Select ${bidder.firstName} ${bidder.lastName}`}
                />
              </TableCell>

              <TableCell className="whitespace-normal">
                <div className="flex min-w-0 items-center gap-3">
                  <Checkbox
                    checked={selectedIds.has(bidder.id)}
                    onCheckedChange={(checked) => onSelectOne(bidder.id, checked === true)}
                    aria-label={`Select ${bidder.firstName} ${bidder.lastName}`}
                    className="mt-0.5 shrink-0 sm:hidden"
                  />
                  <button
                    onClick={() => onView(bidder)}
                    className="flex min-w-0 items-center gap-3 text-left transition-opacity hover:opacity-80"
                  >
                    <BidderAvatar
                      firstName={bidder.firstName}
                      lastName={bidder.lastName}
                      avatar={bidder.avatar}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {bidder.firstName} {bidder.lastName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground md:hidden">{bidder.email}</p>
                      <div className="mt-1 sm:hidden">
                        <StatusBadge isBlocked={bidder.isBlocked} />
                      </div>
                    </div>
                  </button>
                </div>
              </TableCell>

              <TableCell className="hidden whitespace-normal md:table-cell">
                <div className="space-y-0.5">
                  <p className="text-sm text-foreground">{bidder.email}</p>
                  <p className="text-xs text-muted-foreground">{bidder.phone}</p>
                </div>
              </TableCell>

              <TableCell className="hidden md:table-cell">
                <ReputationBadge reputation={bidder.reputation} />
              </TableCell>

              <TableCell className="hidden lg:table-cell">
                <span className="text-sm text-foreground">{bidder.country}</span>
              </TableCell>

              <TableCell className="hidden text-right lg:table-cell">
                <span className="font-medium text-foreground">{bidder.totalBids}</span>
              </TableCell>

              <TableCell className="hidden text-right lg:table-cell">
                <span className="font-medium text-foreground">{bidder.winRate}%</span>
              </TableCell>

              <TableCell className="hidden sm:table-cell">
                <StatusBadge isBlocked={bidder.isBlocked} />
              </TableCell>

              <TableCell className="w-12 text-right sm:w-16">
                <BidderActionsMenu
                  bidder={bidder}
                  onView={onView}
                  onBlock={onBlock}
                  onUnblock={onUnblock}
                  triggerClassName="opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function BidderTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <Table className="table-fixed sm:table-auto">
        <TableHeader>
          <TableRow className="border-border bg-muted/50">
            <TableHead className="hidden w-10 sm:table-cell">
              <div className="h-4 w-4 animate-pulse rounded bg-muted" />
            </TableHead>
            <TableHead>
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            </TableHead>
            <TableHead className="hidden md:table-cell">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            </TableHead>
            <TableHead className="hidden md:table-cell">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            </TableHead>
            <TableHead className="hidden lg:table-cell">
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            </TableHead>
            <TableHead className="hidden lg:table-cell">
              <div className="ml-auto h-4 w-12 animate-pulse rounded bg-muted" />
            </TableHead>
            <TableHead className="hidden lg:table-cell">
              <div className="ml-auto h-4 w-12 animate-pulse rounded bg-muted" />
            </TableHead>
            <TableHead className="hidden sm:table-cell">
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            </TableHead>
            <TableHead className="w-12 sm:w-16">
              <div className="ml-auto h-4 w-16 animate-pulse rounded bg-muted" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i} className="border-border">
              <TableCell className="hidden sm:table-cell">
                <div className="h-4 w-4 animate-pulse rounded bg-muted" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 animate-pulse rounded bg-muted sm:hidden" />
                  <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                  <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="h-4 w-36 animate-pulse rounded bg-muted" />
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="ml-auto h-4 w-12 animate-pulse rounded bg-muted" />
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="ml-auto h-4 w-12 animate-pulse rounded bg-muted" />
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
              </TableCell>
              <TableCell className="w-12 sm:w-16">
                <div className="ml-auto h-8 w-8 animate-pulse rounded bg-muted" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
