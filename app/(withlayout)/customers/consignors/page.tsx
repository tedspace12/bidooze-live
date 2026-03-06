'use client';

import { useEffect, useMemo, useState } from "react";
import { StatCard } from "@/components/customers/StatCard";
import { ConsignorTable } from "@/components/customers/ConsignorTable";
import { ConsignorDetailModal } from "@/components/customers/ConsignorDetailModal";
import { FilterSheet } from "@/components/customers/FilterSheet";
import { AddConsignorModal } from "@/components/customers/AddConsignorModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  CheckCircle,
  Clock,
  Plus,
  Filter,
  Download,
  AlertTriangle,
  Ban,
} from "lucide-react";
import { toast } from "sonner";
import { useCustomer } from "@/features/customers/hooks/useCustomer";
import type {
  ConsignorListItem,
  ConsignorStatus,
} from "@/features/customers/services/customerService";
import { Skeleton } from "@/components/ui/skeleton";

type ConsignorFilters = {
  status?: ConsignorStatus;
  dateFrom?: string;
  dateTo?: string;
};

const getErrorMessage = (error: unknown): string => {
  if (!error || typeof error !== "object") return "Request failed.";
  const message = (error as { message?: unknown }).message;
  if (typeof message === "string" && message.trim()) return message;
  const nested = (error as { error?: { message?: unknown } }).error?.message;
  if (typeof nested === "string" && nested.trim()) return nested;
  return "Request failed.";
};

export default function Consignors() {
  const { useConsignors, createConsignor, updateConsignorStatus } = useCustomer();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState<ConsignorFilters>({});

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const consignorQuery = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      joined_from: filters.dateFrom,
      joined_to: filters.dateTo,
      status: filters.status,
      per_page: 100,
    }),
    [debouncedSearch, filters.dateFrom, filters.dateTo, filters.status]
  );

  const { data: consignorResponse, isLoading, error } = useConsignors(consignorQuery);
  const consignors = useMemo(
    () => consignorResponse?.data ?? [],
    [consignorResponse?.data]
  );
  const [selectedConsignor, setSelectedConsignor] = useState<ConsignorListItem | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [addConsignorOpen, setAddConsignorOpen] = useState(false);

  const stats = useMemo(() => {
    const total = consignors.length;
    const active = consignors.filter((c) => c.status === "active").length;
    const inactive = consignors.filter((c) => c.status === "inactive").length;
    const suspended = consignors.filter((c) => c.status === "suspended").length;

    return {
      total,
      active,
      inactive,
      suspended,
    };
  }, [consignors]);

  const handleViewProfile = (consignor: ConsignorListItem) => {
    setSelectedConsignor(consignor);
    setDetailModalOpen(true);
  };

  const handleStatusChange = async (
    consignor: ConsignorListItem,
    status: ConsignorStatus,
    reason?: string
  ) => {
    try {
      const response = await updateConsignorStatus.mutateAsync({
        id: consignor.id,
        data: {
          status,
          reason: reason || undefined,
        },
      });
      toast.success(response.message || "Consignor status updated.");
      setSelectedConsignor((prev) =>
        prev && prev.id === consignor.id ? { ...prev, status } : prev
      );
    } catch (mutationError) {
      toast.error(getErrorMessage(mutationError));
      throw mutationError;
    }
  };

  const handleExport = () => {
    const csv = [
      [
        "ID",
        "Name",
        "Email",
        "Phone",
        "Status",
        "Commission Rate",
        "Total Lots",
        "Total Value",
        "Current Balance",
        "Outstanding Payments",
        "Registration Date",
        "Notes Count",
      ],
      ...consignors.map((c) => [
        String(c.id),
        c.name,
        c.email,
        c.phone,
        c.status,
        c.commission_rate,
        c.total_lots,
        c.total_value,
        c.current_balance,
        c.outstanding_payments,
        c.registration_date,
        c.notes_count,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `consignors-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Consignors list exported");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container py-4 sm:py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Consignors</h1>
              <p className="text-muted-foreground mt-1">
                Manage consignors with backend-synced status, notes, and activity.
              </p>
            </div>
            <Button
              size="lg"
              className="h-11 gap-2 self-start"
              onClick={() => setAddConsignorOpen(true)}
            >
              <Plus className="w-5 h-5" />
              Add Consignor
            </Button>
          </div>
        </div>
      </header>

      <main className="container space-y-6 py-6 sm:space-y-8 sm:py-8">
        {stats.inactive > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-sm leading-relaxed text-yellow-800">
              <strong>{stats.inactive} consignors are inactive</strong>
              {" - "}Inactive consignors cannot be assigned new lots.
            </AlertDescription>
          </Alert>
        )}

        {stats.suspended > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <Ban className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-sm leading-relaxed text-red-800">
              <strong>{stats.suspended} consignors are suspended</strong>
              {" - "}Suspended consignors cannot be assigned lots and payouts are blocked.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : error ? (
          <Alert className="border-destructive">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription>
              Failed to load consignors. Please try again.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard
              label="Total Consignors"
              value={stats.total}
              icon={Users}
            />
            <StatCard
              label="Active Consignors"
              value={stats.active}
              icon={CheckCircle}
            />
            <StatCard
              label="Inactive Consignors"
              value={stats.inactive}
              icon={Clock}
            />
            <StatCard
              label="Suspended Consignors"
              value={stats.suspended}
              icon={Ban}
            />
          </div>
        )}

        <div className="rounded-lg border border-border/60 bg-card p-3 sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="lg:flex-1">
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterSheetOpen(true)}
                className="h-10 w-full gap-2 sm:w-auto"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="h-10 w-full gap-2 sm:w-auto"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        <ConsignorTable
          consignors={consignors}
          onViewProfile={handleViewProfile}
          onStatusChange={(consignor, status) => {
            void handleStatusChange(consignor, status);
          }}
          statusUpdatingId={
            updateConsignorStatus.isPending ? updateConsignorStatus.variables?.id : null
          }
        />
      </main>

      <ConsignorDetailModal
        consignor={selectedConsignor}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onStatusChange={handleStatusChange}
        isStatusUpdating={updateConsignorStatus.isPending}
      />

      <FilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        filters={filters}
        onFilterChange={setFilters}
      />

      <AddConsignorModal
        open={addConsignorOpen}
        onOpenChange={setAddConsignorOpen}
        onAddConsignor={async (payload) => {
          await createConsignor.mutateAsync(payload);
        }}
      />
    </div>
  );
}
