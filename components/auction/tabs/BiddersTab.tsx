import { useMemo, useState } from "react";
import { AuctionOverviewResponse } from "@/features/auction/types";
import { useAuctionBidders } from "@/features/auction/hooks/useAuctionBidders";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Search,
  MoreHorizontal,
  Check,
  X,
  Eye,
  Users,
  Mail,
  Phone,
  ArrowUpDown,
  Shield,
  ShieldOff,
  type LucideIcon,
} from "lucide-react";

interface BiddersTabProps {
  auction: AuctionOverviewResponse;
}

type RegistrationRecord = {
  id: number;
  bidder?: {
    name?: string;
    email?: string;
    phone?: string;
  } | null;
  status?: "approved" | "rejected" | "suspended";
  created_at?: string;
  deposit_verified?: boolean;
};

function getStatusBadge(status?: string) {
  const key = (status || "rejected").toLowerCase();
  const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive"; icon: LucideIcon }> = {
    approved: { label: "Approved", variant: "default", icon: Check },
    rejected: { label: "Rejected", variant: "secondary", icon: X },
    suspended: { label: "Suspended", variant: "destructive", icon: X },
  };
  return config[key] || config.rejected;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
};

const extractRegistrationRecords = (payload: unknown): RegistrationRecord[] => {
  if (Array.isArray(payload)) {
    return payload as RegistrationRecord[];
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    const nested = (payload as { data?: unknown }).data;
    if (Array.isArray(nested)) {
      return nested as RegistrationRecord[];
    }
  }

  return [];
};

export default function BiddersTab({ auction }: BiddersTabProps) {
  const { bidders, updateRegistration } = useAuctionBidders(auction.auction.id);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField] = useState<"created_at">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedRegistration, setSelectedRegistration] = useState<RegistrationRecord | null>(null);

  const registrationList: RegistrationRecord[] = useMemo(() => {
    return extractRegistrationRecords(bidders.data);
  }, [bidders.data]);

  const filteredBidders = registrationList
    .filter((reg) => {
      const name = reg.bidder?.name?.toLowerCase() || "";
      const email = reg.bidder?.email?.toLowerCase() || "";
      return name.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      const aVal = a[sortField] || "";
      const bVal = b[sortField] || "";
      return sortOrder === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

  const handleSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleUpdateStatus = async (registrationId: number, status: "approved" | "rejected" | "suspended", reason?: string) => {
    try {
      await updateRegistration.mutateAsync({
        registrationId,
        payload: { status, rejection_reason: reason || null },
      });
      toast.success("Registration updated.");
    } catch (error: unknown) {
      toast.error("Failed to update registration", {
        description: getErrorMessage(error, "Please try again."),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-foreground">Bidders</h2>
          <p className="text-sm text-muted-foreground font-body mt-1">
            Manage registered bidders and approvals
          </p>
        </div>
      </div>

      <Card className="border border-border shadow-soft">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search bidders by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 font-body"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border shadow-soft overflow-hidden pt-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="font-body font-semibold text-foreground">Bidder</TableHead>
              <TableHead className="font-body font-semibold text-foreground">Contact</TableHead>
              <TableHead className="font-body font-semibold text-foreground cursor-pointer" onClick={handleSort}>
                <div className="flex items-center gap-1">
                  Registered
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead className="font-body font-semibold text-foreground">Deposit</TableHead>
              <TableHead className="font-body font-semibold text-foreground">Status</TableHead>
              <TableHead className="font-body font-semibold text-foreground w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBidders.length > 0 ? (
              filteredBidders.map((reg) => {
                const statusConfig = getStatusBadge(reg.status);
                const StatusIcon = statusConfig.icon;
                return (
                  <TableRow key={reg.id} className="group hover:bg-secondary/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                          <span className="font-body font-semibold text-muted-foreground text-sm">
                            {(reg.bidder?.name || "NA")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-body font-medium text-foreground">
                            {reg.bidder?.name || "Unknown"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                          <Mail className="w-3 h-3" />
                          {reg.bidder?.email || "—"}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                          <Phone className="w-3 h-3" />
                          {reg.bidder?.phone || "—"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-body text-muted-foreground">
                      {reg.created_at ? new Date(reg.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </TableCell>
                    <TableCell>
                      {reg.deposit_verified ? (
                        <Badge variant="outline" className="font-body text-xs gap-1 text-success border-success">
                          <Check className="w-3 h-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="font-body text-xs gap-1 text-muted-foreground">
                          <X className="w-3 h-3" />
                          Unverified
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig.variant} className="font-body text-xs gap-1">
                        {StatusIcon && <StatusIcon className="w-3 h-3" />}
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="font-body">
                          <DropdownMenuItem className="gap-2">
                            <Eye className="w-4 h-4" />
                            View Profile
                          </DropdownMenuItem>
                          {reg.status !== "approved" && (
                            <DropdownMenuItem className="gap-2 text-success" onClick={() => handleUpdateStatus(reg.id, "approved")}>
                              <Shield className="w-4 h-4" />
                              Approve Bidder
                            </DropdownMenuItem>
                          )}
                          {reg.status !== "rejected" && (
                            <DropdownMenuItem
                              className="gap-2 text-warning"
                              onClick={() => {
                                setSelectedRegistration(reg);
                                setIsRejectOpen(true);
                              }}
                            >
                              <X className="w-4 h-4" />
                              Reject Bidder
                            </DropdownMenuItem>
                          )}
                          {reg.status !== "suspended" && (
                            <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleUpdateStatus(reg.id, "suspended")}>
                              <ShieldOff className="w-4 h-4" />
                              Suspend Bidder
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground font-body">No bidders found</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Bidder</DialogTitle>
            <DialogDescription>Provide a reason for rejection.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="rejection-reason">Rejection Reason</Label>
            <Input
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!selectedRegistration) return;
                handleUpdateStatus(selectedRegistration.id, "rejected", rejectionReason);
                setIsRejectOpen(false);
                setRejectionReason("");
              }}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
