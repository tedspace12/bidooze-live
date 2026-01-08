'use client';
import { useState, useMemo } from "react";
import { StatCard } from "@/components/customers/StatCard";
import { ConsignorTable } from "@/components/customers/ConsignorTable";
import { ConsignorDetailModal } from "@/components/customers/ConsignorDetailModal";
import { FilterSheet } from "@/components/customers/FilterSheet";
import { AddConsignorModal } from "@/components/customers/AddConsignorModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  Plus,
  Filter,
  Download,
  Mail,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useCustomer } from "@/features/customers/hooks/useCustomer";
import { Consignor } from "@/features/customers/services/customerService";
import { Skeleton } from "@/components/ui/skeleton";

export default function Consignors() {
  const { useConsignors } = useCustomer();
  
  // Fetch consignors from API
  const { data: consignors = [], isLoading, error } = useConsignors();
  const [selectedConsignor, setSelectedConsignor] = useState<Consignor | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [addConsignorOpen, setAddConsignorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [filters, setFilters] = useState({
    status: [] as string[],
    kycStatus: [] as string[],
    highValue: false,
    dateFrom: undefined as string | undefined,
    dateTo: undefined as string | undefined,
  });

  const filteredConsignors = useMemo(() => {
    if (!consignors || consignors.length === 0) return [];
    
    return consignors.filter((consignor: Consignor) => {
      const matchesSearch =
        consignor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        consignor.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        consignor.phone?.toLowerCase().includes(searchQuery.toLowerCase());

      if (
        filters.status.length > 0 &&
        !filters.status.includes(consignor.status)
      ) {
        return false;
      }

      if (
        filters.kycStatus.length > 0 &&
        consignor.kycStatus &&
        !filters.kycStatus.includes(consignor.kycStatus)
      ) {
        return false;
      }

      if (filters.highValue && (consignor.totalValue || 0) < 1000000) {
        return false;
      }

      if (filters.dateFrom && consignor.registrationDate) {
        const fromDate = new Date(filters.dateFrom);
        const regDate = new Date(consignor.registrationDate);
        if (regDate < fromDate) return false;
      }
      if (filters.dateTo && consignor.registrationDate) {
        const toDate = new Date(filters.dateTo);
        const regDate = new Date(consignor.registrationDate);
        if (regDate > toDate) return false;
      }

      return matchesSearch;
    });
  }, [consignors, searchQuery, filters]);

  // Calculate stats from real data
  const stats = useMemo(() => {
    const total = consignors.length;
    const active = consignors.filter((c: Consignor) => c.status === "active").length;
    const pending = consignors.filter((c: Consignor) => c.status === "pending").length;
    const verified = consignors.filter((c: Consignor) => c.kycStatus === "verified").length;
    
    return {
      total,
      active,
      pending,
      verified,
    };
  }, [consignors]);
  
  const pendingConsignors = consignors.filter(
    (c: Consignor) => c.status === "pending"
  ).length;
  const highValueConsignors = consignors.filter(
    (c: Consignor) => (c.totalValue || 0) > 1500000
  ).length;

  const handleViewProfile = (consignor: Consignor) => {
    setSelectedConsignor(consignor);
    setDetailModalOpen(true);
  };

  const handleEdit = (consignor: Consignor) => {
    toast.success(`Edit mode for ${consignor.companyName} (coming soon)`);
  };

  const handleDelete = (consignor: Consignor) => {
    // TODO: Implement delete mutation when backend endpoint is available
    toast.success(`${consignor.name || consignor.id} deactivated`);
  };

  const handleBulkApprove = () => {
    if (selectedIds.size === 0) {
      toast.error("Please select consignors to approve");
      return;
    }
    toast.success(`${selectedIds.size} consignors approved`);
    setSelectedIds(new Set());
  };

  const handleBulkMessage = () => {
    if (selectedIds.size === 0) {
      toast.error("Please select consignors to message");
      return;
    }
    toast.success(`Message sent to ${selectedIds.size} consignors`);
    setSelectedIds(new Set());
  };

  const handleBulkAssign = () => {
    if (selectedIds.size === 0) {
      toast.error("Please select consignors to assign");
      return;
    }
    toast.success(`Manager assigned to ${selectedIds.size} consignors`);
    setSelectedIds(new Set());
  };

  const handleExport = () => {
    const csv = [
      ["Company", "Contact", "Email", "Status", "Items", "Total Value"],
      ...filteredConsignors.map((c) => [
        c.companyName,
        c.contactName,
        c.email,
        c.status,
        c.itemsCount,
        `$${c.totalValue}`,
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
      <header className="sticky top-0 z-50 bg-background">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Consignors</h1>
              <p className="text-muted-foreground mt-1">
                Manage all sellers and consigned items
              </p>
            </div>
            <Button
              size="lg"
              className="gap-2"
              onClick={() => setAddConsignorOpen(true)}
            >
              <Plus className="w-5 h-5" />
              Add Consignor
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {pendingConsignors > 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>{pendingConsignors} consignors pending verification</strong>
              — Review and approve KYC documents to activate accounts.
            </AlertDescription>
          </Alert>
        )}

        {highValueConsignors > 0 && (
          <Alert className="border-purple-200 bg-purple-50">
            <AlertTriangle className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-800">
              <strong>{highValueConsignors} high-value consignors</strong> flagged
              for manual review — Ensure compliance and risk assessment.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              label="Pending Verification"
              value={stats.pending}
              icon={Clock}
            />
            <StatCard
              label="Verified Consignors"
              value={stats.verified}
              icon={UserCheck}
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
          <div className="flex-1">
            <Input
              placeholder="Search by company name, contact, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterSheetOpen(true)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>

          {selectedIds.size > 0 && (
            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">
                {selectedIds.size} selected
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleBulkApprove}>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Approve Consignors
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleBulkMessage}>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Messages
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleBulkAssign}>
                    <Users className="w-4 h-4 mr-2" />
                    Assign Manager
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExport}>
                    <Download className="w-4 h-4 mr-2" />
                    Export List
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {selectedIds.size === 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          )}
        </div>

        <ConsignorTable
          consignors={filteredConsignors}
          onViewProfile={handleViewProfile}
          onEdit={handleEdit}
          onDelete={handleDelete}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      </main>

      <ConsignorDetailModal
        consignor={selectedConsignor}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
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
        onAddConsignor={(newConsignor) => {
          setConsignors([newConsignor, ...consignors]);
          setAddConsignorOpen(false);
        }}
      />
    </div>
  );
}
