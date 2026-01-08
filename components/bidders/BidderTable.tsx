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
import { DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger, DropdownMenu, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
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
                <p className="text-sm text-muted-foreground">
                    Try adjusting your filters or search query.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="overflow-x-auto scrollbar-thin">
                <Table className='p-2'>
                    <TableHeader>
                        <TableRow className="border-border bg-muted/50 hover:bg-muted/50">
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={onSelectAll}
                                    aria-label="Select all bidders"
                                    className={someSelected ? 'data-[state=checked]:bg-primary' : ''}
                                />
                            </TableHead>
                            <TableHead className="min-w-[200px]">Bidder</TableHead>
                            <TableHead className="min-w-[200px]">Contact</TableHead>
                            <TableHead className="min-w-[120px]">Country</TableHead>
                            <TableHead className="min-w-[100px]">Reputation</TableHead>
                            <TableHead className="min-w-[100px] text-right">Total Bids</TableHead>
                            <TableHead className="min-w-[100px] text-right">Win Rate</TableHead>
                            <TableHead className="min-w-[100px]">Status</TableHead>
                            <TableHead className="min-w-40">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bidders.map((bidder, index) => (
                            <TableRow
                                key={bidder.id}
                                className="group border-border transition-colors hover:bg-muted/30"
                                style={{ animationDelay: `${index * 30}ms` }}
                            >
                                <TableCell>
                                    <Checkbox
                                        checked={selectedIds.has(bidder.id)}
                                        onCheckedChange={(checked) => onSelectOne(bidder.id, !!checked)}
                                        aria-label={`Select ${bidder.firstName} ${bidder.lastName}`}
                                    />
                                </TableCell>
                                <TableCell>
                                    <button
                                        onClick={() => onView(bidder)}
                                        className="flex items-center gap-3 text-left transition-opacity hover:opacity-80"
                                    >
                                        <BidderAvatar
                                            firstName={bidder.firstName}
                                            lastName={bidder.lastName}
                                            avatar={bidder.avatar}
                                        />
                                        <span className="font-medium text-foreground">
                                            {bidder.firstName} {bidder.lastName}
                                        </span>
                                    </button>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-0.5">
                                        <p className="text-sm text-foreground">{bidder.email}</p>
                                        <p className="text-xs text-muted-foreground">{bidder.phone}</p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-foreground">{bidder.country}</span>
                                </TableCell>
                                <TableCell>
                                    <ReputationBadge reputation={bidder.reputation} />
                                </TableCell>
                                <TableCell className="text-right">
                                    <span className="font-medium text-foreground">{bidder.totalBids}</span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <span className="font-medium text-foreground">{bidder.winRate}%</span>
                                </TableCell>
                                <TableCell>
                                    <StatusBadge isBlocked={bidder.isBlocked} />
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem className="gap-2" onClick={() => onView(bidder)}>
                                                <Eye className="w-4 h-4" />
                                                View Details
                                            </DropdownMenuItem>

                                            <DropdownMenuSeparator />

                                            {bidder.isBlocked ? (
                                                <DropdownMenuItem
                                                    className="gap-2 text-emerald-600 focus:text-emerald-600"
                                                    onClick={() => onUnblock(bidder)}
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Approve
                                                </DropdownMenuItem>
                                            ) : (
                                                <DropdownMenuItem
                                                    className="gap-2 text-destructive focus:text-destructive"
                                                    onClick={() => onBlock(bidder)}
                                                >
                                                    <Ban className="w-4 h-4" />
                                                    Block
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>

                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div >
    );
}

function BidderTableSkeleton() {
    return (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border bg-muted/50">
                            <TableHead className="w-12"><div className="h-4 w-4 animate-pulse rounded bg-muted" /></TableHead>
                            <TableHead><div className="h-4 w-20 animate-pulse rounded bg-muted" /></TableHead>
                            <TableHead><div className="h-4 w-20 animate-pulse rounded bg-muted" /></TableHead>
                            <TableHead><div className="h-4 w-16 animate-pulse rounded bg-muted" /></TableHead>
                            <TableHead><div className="h-4 w-20 animate-pulse rounded bg-muted" /></TableHead>
                            <TableHead><div className="h-4 w-16 animate-pulse rounded bg-muted" /></TableHead>
                            <TableHead><div className="h-4 w-16 animate-pulse rounded bg-muted" /></TableHead>
                            <TableHead><div className="h-4 w-16 animate-pulse rounded bg-muted" /></TableHead>
                            <TableHead><div className="h-4 w-24 animate-pulse rounded bg-muted" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i} className="border-border">
                                <TableCell><div className="h-4 w-4 animate-pulse rounded bg-muted" /></TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                                        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                                    </div>
                                </TableCell>
                                <TableCell><div className="h-4 w-40 animate-pulse rounded bg-muted" /></TableCell>
                                <TableCell><div className="h-4 w-24 animate-pulse rounded bg-muted" /></TableCell>
                                <TableCell><div className="h-6 w-20 animate-pulse rounded-full bg-muted" /></TableCell>
                                <TableCell><div className="h-4 w-12 animate-pulse rounded bg-muted" /></TableCell>
                                <TableCell><div className="h-4 w-12 animate-pulse rounded bg-muted" /></TableCell>
                                <TableCell><div className="h-6 w-16 animate-pulse rounded-full bg-muted" /></TableCell>
                                <TableCell><div className="h-8 w-24 animate-pulse rounded bg-muted" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
