'use client';
import { useState, useMemo, useCallback } from 'react';
import { Users } from 'lucide-react';
import { toast } from 'sonner';
import { BidderType, ReputationStatus } from '@/types/bidder';
import { mockBidders } from '@/data';
import { SummaryCards } from '@/components/bidders/SummaryCards';
import { BidderFilters } from '@/components/bidders/BidderFilters';
import { BidderTable } from '@/components/bidders/BidderTable';
import { BidderProfileModal } from '@/components/bidders/BidderProfileModal';
import { BulkActionsBar } from '@/components/bidders/BulkActionsBar';
import { ConfirmationDialog } from '@/components/bidders/ConfirmationDialog';

const BidderPage = () => {
  const [bidders, setBidders] = useState<BidderType[]>(mockBidders);
  const [searchQuery, setSearchQuery] = useState('');
  const [reputationFilter, setReputationFilter] = useState<ReputationStatus | 'all'>('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [showBlockedOnly, setShowBlockedOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedBidder, setSelectedBidder] = useState<Bidder | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'block' | 'unblock';
    bidder?: Bidder;
    count?: number;
  }>({ isOpen: false, type: 'block' });

  // Filtered bidders
  const filteredBidders = useMemo(() => {
    if (!bidders || bidders.length === 0) return [];
    
    return bidders.filter((bidder: Bidder) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        bidder.name?.toLowerCase().includes(searchLower) ||
        bidder.email?.toLowerCase().includes(searchLower);

      // Reputation filter
      const matchesReputation =
        reputationFilter === 'all' || bidder.reputation === reputationFilter;

      // Country filter - skip if not available in API response
      const matchesCountry = countryFilter === 'all';

      // Blocked filter
      const matchesBlocked = !showBlockedOnly || bidder.status === 'blocked';

      return matchesSearch && matchesReputation && matchesCountry && matchesBlocked;
    });
  }, [bidders, searchQuery, reputationFilter, countryFilter, showBlockedOnly]);

  const hasActiveFilters =
    searchQuery !== '' ||
    reputationFilter !== 'all' ||
    countryFilter !== 'all' ||
    showBlockedOnly;

  // Handlers
  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setReputationFilter('all');
    setCountryFilter('all');
    setShowBlockedOnly(false);
  }, []);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedIds(new Set(filteredBidders.map((b) => String(b.id))));
      } else {
        setSelectedIds(new Set());
      }
    },
    [filteredBidders]
  );

  const handleSelectOne = useCallback((id: string | number, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const handleViewBidder = useCallback((bidder: Bidder) => {
    setSelectedBidder(bidder);
    setIsProfileOpen(true);
  }, []);

  const handleBlockBidder = useCallback((bidder: Bidder) => {
    setConfirmDialog({ isOpen: true, type: 'block', bidder });
  }, []);

  const handleUnblockBidder = useCallback((bidder: Bidder) => {
    setConfirmDialog({ isOpen: true, type: 'unblock', bidder });
  }, []);

  const handleConfirmAction = useCallback(() => {
    const { type, bidder, count } = confirmDialog;

    if (bidder) {
      // TODO: Implement block/unblock mutation when backend endpoint is available
      toast.success(
        type === 'block'
          ? `${bidder.name || bidder.id} has been blocked`
          : `${bidder.name || bidder.id} has been unblocked`
      );
    } else if (count) {
      // TODO: Implement bulk block/unblock mutation when backend endpoint is available
      setSelectedIds(new Set());
      toast.success(
        type === 'block'
          ? `${count} bidders have been blocked`
          : `${count} bidders have been unblocked`
      );
    }

    setConfirmDialog({ isOpen: false, type: 'block' });
    setIsProfileOpen(false);
  }, [confirmDialog, selectedIds]);

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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Users className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Bidders</h1>
              <p className="text-sm text-muted-foreground">
                Manage bidders across your auctions.
              </p>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              Failed to load bidders. Please try again.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Summary Cards */}
            <section aria-label="Summary statistics" className="mb-6">
              <SummaryCards bidders={bidders as any} />
            </section>

            {/* Filters */}
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

            {/* Results count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredBidders.length} of {bidders.length} bidders
              </p>
            </div>

            <section aria-label="Bidder list">
              <BidderTable
                bidders={filteredBidders as any}
                selectedIds={selectedIds}
                onSelectAll={handleSelectAll}
                onSelectOne={handleSelectOne}
                onView={handleViewBidder}
                onBlock={handleBlockBidder}
                onUnblock={handleUnblockBidder}
              />
            </section>
          </>
        )}

        {/* Bulk Actions Bar */}
        <BulkActionsBar
          selectedCount={selectedIds.size}
          onBlock={handleBulkBlock}
          onUnblock={handleBulkUnblock}
          onMessage={handleBulkMessage}
          onExport={handleBulkExport}
          onClearSelection={() => setSelectedIds(new Set())}
        />

        {/* Bidder Profile Modal */}
        <BidderProfileModal
          bidder={selectedBidder}
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          onBlock={handleBlockBidder}
          onUnblock={handleUnblockBidder}
        />

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog({ isOpen: false, type: 'block' })}
          onConfirm={handleConfirmAction}
          type={confirmDialog.type}
          bidderName={
            confirmDialog.bidder
              ? confirmDialog.bidder.name || String(confirmDialog.bidder.id)
              : undefined
          }
          count={confirmDialog.count}
        />
      </div>
    </div>
  );
};

export default BidderPage;
