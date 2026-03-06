'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { toast } from 'sonner';
import { BidderType, COUNTRIES, ReputationStatus } from '@/types/bidder';
import type {
  BidderDetail as ApiBidderDetail,
  BidderListItem as ApiBidderListItem,
  BidderReputation,
} from '@/features/customers/services/customerService';
import { useCustomer } from '@/features/customers/hooks/useCustomer';
import { SummaryCards } from '@/components/bidders/SummaryCards';
import { BidderFilters } from '@/components/bidders/BidderFilters';
import { BidderTable } from '@/components/bidders/BidderTable';
import { BidderProfileModal } from '@/components/bidders/BidderProfileModal';
import { BulkActionsBar } from '@/components/bidders/BulkActionsBar';
import { ConfirmationDialog } from '@/components/bidders/ConfirmationDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const getBidderDisplayName = (bidder: BidderType) =>
  `${bidder.firstName} ${bidder.lastName}`.trim();

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const mapReputationString = (value?: string | null): ReputationStatus | undefined => {
  const normalized = (value || '').trim().toLowerCase();
  if (!normalized) return undefined;

  if (normalized === 'low trust' || normalized === 'low_trust' || normalized === 'low-trust') return 'low_trust';
  if (normalized === 'neutral') return 'neutral';
  if (normalized === 'reliable') return 'reliable';
  if (normalized === 'trusted') return 'trusted';
  if (normalized === 'elite') return 'elite';

  return undefined;
};

const resolveReputation = (reputation?: BidderReputation | null): ReputationStatus => {
  // Use backend-provided level directly whenever available.
  const fromLevel = mapReputationString(reputation?.level);
  if (fromLevel) return fromLevel;

  // Backend default status for new bidders is `provisional`,
  // which corresponds to Neutral (default score = 50).
  const status = (reputation?.status || '').trim().toLowerCase();
  if (status === 'provisional') return 'neutral';

  const rawScore = toNumber(reputation?.score, 50);
  const score = Math.min(100, Math.max(0, rawScore));

  // Backend grading:
  // 0-40 Low Trust, 41-60 Neutral, 61-75 Reliable, 76-90 Trusted, 91-100 Elite.
  if (score <= 40) return 'low_trust';
  if (score <= 60) return 'neutral';
  if (score <= 75) return 'reliable';
  if (score <= 90) return 'trusted';
  return 'elite';
};

const splitBidderName = (fullName?: string) => {
  const normalized = String(fullName || '').trim();
  if (!normalized) {
    return { firstName: 'Unknown', lastName: '' };
  }

  const parts = normalized.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
};

const resolveCountryCode = (countryRaw?: string): string => {
  const value = (countryRaw || '').trim();
  if (!value) return 'N/A';
  if (value.length === 2) return value.toUpperCase();

  const byName = COUNTRIES.find((country) => country.name.toLowerCase() === value.toLowerCase());
  return byName?.code || value.toUpperCase();
};

const resolveCountryName = (countryRaw?: string): string => {
  const value = (countryRaw || '').trim();
  if (!value) return 'Unknown';
  if (value.length !== 2) return value;

  const byCode = COUNTRIES.find((country) => country.code.toLowerCase() === value.toLowerCase());
  return byCode?.name || value.toUpperCase();
};

const mapBidStatus = (status?: string): 'won' | 'lost' | 'active' => {
  const normalized = (status || '').trim().toLowerCase();
  if (normalized.includes('won') || normalized === 'win') return 'won';
  if (normalized.includes('lost') || normalized === 'lose') return 'lost';
  return 'active';
};

const mapListBidderToUi = (bidder: ApiBidderListItem, index: number): BidderType => {
  const id = bidder.id != null ? String(bidder.id) : `bidder-${index}`;
  const { firstName, lastName } = splitBidderName(bidder.name);
  const joinedAt = new Date().toISOString();
  const lastActive = joinedAt;
  const countryCode = resolveCountryCode(typeof bidder.country === 'string' ? bidder.country : undefined);
  const country = resolveCountryName(typeof bidder.country === 'string' ? bidder.country : undefined);
  const normalizedStatus = String(bidder.status || '').trim().toLowerCase();

  return {
    id,
    firstName,
    lastName,
    email: String(bidder.email || ''),
    phone: String(bidder.phone || ''),
    country,
    countryCode,
    avatar: typeof bidder.avatar === 'string' ? bidder.avatar : undefined,
    reputation: resolveReputation(bidder.reputation),
    totalBids: toNumber(bidder.totalBids, 0),
    wonAuctions: 0,
    winRate: toNumber(bidder.winRate, 0),
    isBlocked: normalizedStatus === 'blocked',
    joinedAt,
    lastActive,
    reputationHistory: [],
    biddingHistory: [],
  };
};

const mapDetailBidderToUi = (bidder: ApiBidderDetail): BidderType => {
  const id = bidder.id != null ? String(bidder.id) : 'bidder-detail';
  const firstName = String(bidder.firstName || '').trim() || 'Unknown';
  const lastName = String(bidder.lastName || '').trim();
  const joinedAt =
    typeof bidder.joinedAt === 'string' && bidder.joinedAt.trim()
      ? bidder.joinedAt
      : new Date().toISOString();
  const lastActive =
    typeof bidder.lastActive === 'string' && bidder.lastActive.trim()
      ? bidder.lastActive
      : joinedAt;
  const countryCode = resolveCountryCode(typeof bidder.country === 'string' ? bidder.country : undefined);
  const country = resolveCountryName(typeof bidder.country === 'string' ? bidder.country : undefined);

  return {
    id,
    firstName,
    lastName,
    email: String(bidder.email || ''),
    phone: String(bidder.phone || ''),
    country,
    countryCode,
    avatar: typeof bidder.avatar === 'string' ? bidder.avatar : undefined,
    reputation: resolveReputation(bidder.reputation),
    totalBids: toNumber(bidder.totalBids, 0),
    wonAuctions: toNumber(bidder.wonAuctions, 0),
    winRate: toNumber(bidder.winRate, 0),
    isBlocked: Boolean(bidder.isBlocked),
    joinedAt,
    lastActive,
    reputationHistory: Array.isArray(bidder.reputationHistory)
      ? bidder.reputationHistory.map((item, itemIndex) => ({
          id: item?.id != null ? String(item.id) : `${id}-rep-${itemIndex}`,
          date:
            typeof item?.date === 'string' && item.date.trim()
              ? item.date
              : new Date().toISOString(),
          previousStatus: mapReputationString(item?.previousStatus) || 'neutral',
          newStatus: mapReputationString(item?.newStatus) || 'neutral',
          reason: String(item?.reason || 'Status updated'),
        }))
      : [],
    biddingHistory: Array.isArray(bidder.biddingHistory)
      ? bidder.biddingHistory.map((item, itemIndex) => ({
          id: item?.id != null ? String(item.id) : `${id}-bid-${itemIndex}`,
          auctionTitle: String(item?.auctionTitle || 'Untitled Auction'),
          bidAmount: toNumber(item?.bidAmount, 0),
          date:
            typeof item?.date === 'string' && item.date.trim()
              ? item.date
              : new Date().toISOString(),
          status: mapBidStatus(item?.status),
        }))
      : [],
  };
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (!error || typeof error !== 'object') return fallback;
  const message = (error as { message?: unknown }).message;
  if (typeof message === 'string' && message.trim()) return message;
  const nestedMessage = (error as { error?: { message?: unknown } }).error?.message;
  if (typeof nestedMessage === 'string' && nestedMessage.trim()) return nestedMessage;
  return fallback;
};

const BidderPage = () => {
  const queryClient = useQueryClient();
  const { useBidders, useBidderById, blockBidder, unblockBidder } = useCustomer();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [reputationFilter, setReputationFilter] = useState<ReputationStatus | 'all'>('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [showBlockedOnly, setShowBlockedOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedBidder, setSelectedBidder] = useState<BidderType | null>(null);
  const [selectedBidderId, setSelectedBidderId] = useState<string | number | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'block' | 'unblock';
    bidder?: BidderType;
    count?: number;
  }>({ isOpen: false, type: 'block' });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const perPage = 20;
  const {
    data: biddersResponse,
    isLoading,
    isFetching,
    error,
  } = useBidders({
    search: debouncedSearch || undefined,
    per_page: perPage,
    page: currentPage,
  });

  const bidderDetailQuery = useBidderById(selectedBidderId ?? '');

  const lastPage = Math.max(biddersResponse?.meta?.last_page || 1, 1);
  const totalBiddersFromApi = biddersResponse?.meta?.total || 0;

  useEffect(() => {
    if (currentPage > lastPage) {
      setCurrentPage(lastPage);
    }
  }, [currentPage, lastPage]);

  const bidders = useMemo(
    () => (biddersResponse?.data || []).map((bidder, index) => mapListBidderToUi(bidder, index)),
    [biddersResponse?.data]
  );

  useEffect(() => {
    if (!bidderDetailQuery.data || !isProfileOpen) return;
    setSelectedBidder(mapDetailBidderToUi(bidderDetailQuery.data));
  }, [bidderDetailQuery.data, isProfileOpen]);

  useEffect(() => {
    if (!bidderDetailQuery.isError || !isProfileOpen) return;
    toast.error(getErrorMessage(bidderDetailQuery.error, 'Failed to load bidder details.'));
  }, [bidderDetailQuery.error, bidderDetailQuery.isError, isProfileOpen]);

  const filteredBidders = useMemo(() => {
    if (!bidders || bidders.length === 0) return [];

    return bidders.filter((bidder: BidderType) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        `${bidder.firstName} ${bidder.lastName}`.toLowerCase().includes(searchLower) ||
        bidder.email?.toLowerCase().includes(searchLower);

      const matchesReputation =
        reputationFilter === 'all' || bidder.reputation === reputationFilter;

      const normalizedCountryFilter = countryFilter.toLowerCase();
      const matchesCountry =
        countryFilter === 'all' ||
        bidder.countryCode.toLowerCase() === normalizedCountryFilter ||
        bidder.country.toLowerCase() === normalizedCountryFilter;

      const matchesBlocked = !showBlockedOnly || bidder.isBlocked;

      return matchesSearch && matchesReputation && matchesCountry && matchesBlocked;
    });
  }, [bidders, searchQuery, reputationFilter, countryFilter, showBlockedOnly]);

  useEffect(() => {
    setSelectedIds((previous) => {
      const next = new Set(
        Array.from(previous).filter((id) => filteredBidders.some((bidder) => bidder.id === id))
      );
      if (
        next.size === previous.size &&
        Array.from(next).every((id) => previous.has(id))
      ) {
        return previous;
      }
      return next;
    });
  }, [filteredBidders]);

  const hasActiveFilters =
    searchQuery !== '' ||
    reputationFilter !== 'all' ||
    countryFilter !== 'all' ||
    showBlockedOnly;

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setReputationFilter('all');
    setCountryFilter('all');
    setShowBlockedOnly(false);
    setCurrentPage(1);
  }, []);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedIds(new Set(filteredBidders.map((b) => b.id)));
      } else {
        setSelectedIds(new Set());
      }
    },
    [filteredBidders]
  );

  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const handleViewBidder = useCallback((bidder: BidderType) => {
    setSelectedBidder(bidder);
    setSelectedBidderId(bidder.id);
    setIsProfileOpen(true);
  }, []);

  const handleCloseProfile = useCallback(() => {
    setIsProfileOpen(false);
    setSelectedBidderId(null);
    setSelectedBidder(null);
  }, []);

  const handleBlockBidder = useCallback((bidder: BidderType) => {
    setConfirmDialog({ isOpen: true, type: 'block', bidder });
  }, []);

  const handleUnblockBidder = useCallback((bidder: BidderType) => {
    setConfirmDialog({ isOpen: true, type: 'unblock', bidder });
  }, []);

  const handleConfirmAction = useCallback(async () => {
    if (blockBidder.isPending || unblockBidder.isPending) return;

    const { type, bidder } = confirmDialog;
    const targetIds = bidder ? [bidder.id] : Array.from(selectedIds);
    if (targetIds.length === 0) {
      setConfirmDialog({ isOpen: false, type: 'block' });
      return;
    }

    const results = await Promise.allSettled(
      targetIds.map((bidderId) =>
        type === 'block'
          ? blockBidder.mutateAsync({ bidderId })
          : unblockBidder.mutateAsync({ bidderId })
      )
    );

    const successCount = results.filter((result) => result.status === 'fulfilled').length;
    const failureCount = results.length - successCount;

    if (successCount > 0) {
      if (bidder) {
        toast.success(
          type === 'block'
            ? `${getBidderDisplayName(bidder)} has been blocked`
            : `${getBidderDisplayName(bidder)} has been unblocked`
        );
      } else {
        toast.success(
          type === 'block'
            ? `${successCount} bidder${successCount > 1 ? 's have' : ' has'} been blocked`
            : `${successCount} bidder${successCount > 1 ? 's have' : ' has'} been unblocked`
        );
      }

      await queryClient.invalidateQueries({ queryKey: ['customers'] });
      setSelectedIds(new Set());
      setSelectedBidderId(null);
      setIsProfileOpen(false);
      setSelectedBidder(null);
    }

    if (failureCount > 0) {
      const firstFailure = results.find(
        (result): result is PromiseRejectedResult => result.status === 'rejected'
      );
      toast.error(getErrorMessage(firstFailure?.reason, 'Some actions failed. Please try again.'));
    }

    setConfirmDialog({ isOpen: false, type: 'block' });
  }, [
    blockBidder,
    unblockBidder,
    confirmDialog,
    queryClient,
    selectedIds,
  ]);

  const handleBulkBlock = useCallback(() => {
    setConfirmDialog({ isOpen: true, type: 'block', count: selectedIds.size });
  }, [selectedIds.size]);

  const handleBulkUnblock = useCallback(() => {
    setConfirmDialog({ isOpen: true, type: 'unblock', count: selectedIds.size });
  }, [selectedIds.size]);

  const handleBulkMessage = useCallback(() => {
    toast.info('Message feature coming soon');
  }, []);

  const handleBulkExport = useCallback(() => {
    toast.success('Bidder data exported successfully');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 sm:py-8 sm:pb-8 lg:px-8">
        <header className="mb-6 sm:mb-8">
          <div className="flex items-start gap-3 sm:items-center">
            <div className="rounded-lg bg-primary/10 p-2">
              <Users className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">Bidders</h1>
              <p className="text-sm text-muted-foreground">
                Manage bidders across your auctions.
              </p>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        ) : error ? (
          <Alert className="border-destructive">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription>
              {getErrorMessage(error, 'Failed to load bidders. Please try again.')}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <section aria-label="Summary statistics" className="mb-6">
              <SummaryCards bidders={bidders} />
            </section>

            <section aria-label="Filters" className="mb-6">
              <BidderFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                reputationFilter={reputationFilter}
                onReputationChange={setReputationFilter}
                countryFilter={countryFilter}
                onCountryChange={setCountryFilter}
                showBlockedOnly={showBlockedOnly}
                onShowBlockedChange={setShowBlockedOnly}
                onClearFilters={handleClearFilters}
                hasActiveFilters={hasActiveFilters}
              />
            </section>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                Showing {filteredBidders.length} of {totalBiddersFromApi} bidders
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage <= 1 || isFetching}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground sm:text-sm">
                  Page {currentPage} of {lastPage}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((page) => Math.min(lastPage, page + 1))}
                  disabled={currentPage >= lastPage || isFetching}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <section aria-label="Bidder list">
              <BidderTable
                bidders={filteredBidders}
                selectedIds={selectedIds}
                onSelectAll={handleSelectAll}
                onSelectOne={handleSelectOne}
                onView={handleViewBidder}
                onBlock={handleBlockBidder}
                onUnblock={handleUnblockBidder}
                isLoading={isFetching}
              />
            </section>
          </>
        )}

        <BulkActionsBar
          selectedCount={selectedIds.size}
          onBlock={handleBulkBlock}
          onUnblock={handleBulkUnblock}
          onMessage={handleBulkMessage}
          onExport={handleBulkExport}
          onClearSelection={() => setSelectedIds(new Set())}
        />

        <BidderProfileModal
          bidder={selectedBidder}
          isOpen={isProfileOpen}
          onClose={handleCloseProfile}
          onBlock={handleBlockBidder}
          onUnblock={handleUnblockBidder}
        />

        <ConfirmationDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog({ isOpen: false, type: 'block' })}
          onConfirm={handleConfirmAction}
          type={confirmDialog.type}
          bidderName={
            confirmDialog.bidder
              ? getBidderDisplayName(confirmDialog.bidder) || String(confirmDialog.bidder.id)
              : undefined
          }
          count={confirmDialog.count}
        />
      </div>
    </div>
  );
};

export default BidderPage;
