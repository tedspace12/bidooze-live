import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
  AuctionBidderRegistration,
  AuctionOverviewResponse,
} from "@/features/auction/types";
import { useAuctionBidders } from "@/features/auction/hooks/useAuctionBidders";
import { customerService } from "@/features/customers/services/customerService";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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
  Clock3,
  X,
  Eye,
  Users,
  Mail,
  Phone,
  ArrowUpDown,
  Shield,
  ShieldOff,
  Gavel,
  Trophy,
  TrendingUp,
  Calendar,
  type LucideIcon,
} from "lucide-react";

interface BiddersTabProps {
  auction: AuctionOverviewResponse;
}

type RegistrationRecord = {
  id: number;
  user_id?: number | null;
  bidder: {
    name: string;
    email: string;
    phone: string;
  };
  status: string;
  created_at?: string;
  payment_verified: boolean;
};

function getStatusBadge(status?: string) {
  const key = (status || "pending_approval").toLowerCase();
  const config: Record<
    string,
    {
      label: string;
      variant: "default" | "secondary" | "destructive";
      icon: LucideIcon;
    }
  > = {
    pending_approval: {
      label: "Pending Approval",
      variant: "secondary",
      icon: Clock3,
    },
    pending: {
      label: "Pending Approval",
      variant: "secondary",
      icon: Clock3,
    },
    approved: { label: "Approved", variant: "default", icon: Check },
    rejected: { label: "Rejected", variant: "secondary", icon: X },
    suspended: { label: "Suspended", variant: "destructive", icon: X },
  };
  return config[key] || config.pending_approval;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
};

const toText = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") return value.trim() || fallback;
  if (typeof value === "number") return String(value);
  return fallback;
};

const getBidderInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2) || "NA";

const normalizeRegistrationRecord = (
  record: AuctionBidderRegistration
): RegistrationRecord => ({
  id: record.id,
  user_id: record.user_id ?? record.user?.id ?? null,
  bidder: {
    name: toText(record.name ?? record.bidder?.name ?? record.user?.name, "Unknown"),
    email: toText(record.email ?? record.bidder?.email ?? record.user?.email, ""),
    phone: toText(record.phone ?? record.bidder?.phone ?? record.user?.phone, ""),
  },
  status: toText(record.status, "pending_approval"),
  created_at: toText(record.created_at),
  payment_verified: Boolean(
    record.payment_method_verified ?? record.deposit_verified
  ),
});

const extractRegistrationRecords = (
  payload: unknown
): AuctionBidderRegistration[] => {
  if (Array.isArray(payload)) {
    return payload as AuctionBidderRegistration[];
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    const nested = (payload as { data?: unknown }).data;
    if (Array.isArray(nested)) {
      return nested as AuctionBidderRegistration[];
    }

    if (nested && typeof nested === "object" && "data" in nested) {
      const doubleNested = (nested as { data?: unknown }).data;
      if (Array.isArray(doubleNested)) {
        return doubleNested as AuctionBidderRegistration[];
      }
    }
  }

  return [];
};

const formatRegisteredDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "-";

export default function BiddersTab({ auction }: BiddersTabProps) {
  const { bidders, updateRegistration } = useAuctionBidders(auction.auction.id);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField] = useState<"created_at">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedRegistration, setSelectedRegistration] =
    useState<RegistrationRecord | null>(null);
  const [profileUserId, setProfileUserId] = useState<number | null>(null);

  const bidderProfile = useQuery({
    queryKey: ["bidder-profile", profileUserId],
    queryFn: () => customerService.getBidderById(profileUserId!),
    enabled: !!profileUserId,
  });

  const registrationList: RegistrationRecord[] = useMemo(() => {
    return extractRegistrationRecords(bidders.data).map(normalizeRegistrationRecord);
  }, [bidders.data]);

  const filteredBidders = registrationList
    .filter((reg) => {
      const name = reg.bidder.name.toLowerCase();
      const email = reg.bidder.email.toLowerCase();
      return (
        name.includes(searchQuery.toLowerCase()) ||
        email.includes(searchQuery.toLowerCase())
      );
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

  const handleUpdateStatus = async (
    registrationId: number,
    status: "approved" | "rejected" | "suspended",
    reason?: string
  ) => {
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-display font-semibold text-foreground">
            Bidders
          </h2>
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
        <div className="space-y-3 p-4 md:hidden">
          {filteredBidders.length > 0 ? (
            filteredBidders.map((reg) => {
              const statusConfig = getStatusBadge(reg.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={reg.id}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <span className="font-body font-semibold text-muted-foreground text-sm">
                          {getBidderInitials(reg.bidder.name)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-body font-medium text-foreground truncate">
                          {reg.bidder.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Registered {formatRegisteredDate(reg.created_at)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={statusConfig.variant}
                      className="font-body text-xs gap-1 shrink-0"
                    >
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig.label}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 shrink-0" />
                      <span className="truncate">{reg.bidder.email || "-"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 shrink-0" />
                      <span>{reg.bidder.phone || "-"}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    {reg.payment_verified ? (
                      <Badge
                        variant="outline"
                        className="font-body text-xs gap-1 text-success border-success"
                      >
                        <Check className="w-3 h-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="font-body text-xs gap-1 text-muted-foreground"
                      >
                        <X className="w-3 h-3" />
                        Unverified
                      </Badge>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="font-body">
                        <DropdownMenuItem
                          className="gap-2"
                          disabled={!reg.user_id}
                          onClick={() => reg.user_id && setProfileUserId(reg.user_id)}
                        >
                          <Eye className="w-4 h-4" />
                          View Profile
                        </DropdownMenuItem>
                        {reg.status !== "approved" && (
                          <DropdownMenuItem
                            className="gap-2 text-success"
                            onClick={() =>
                              handleUpdateStatus(reg.id, "approved")
                            }
                          >
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
                          <DropdownMenuItem
                            className="gap-2 text-destructive"
                            onClick={() =>
                              handleUpdateStatus(reg.id, "suspended")
                            }
                          >
                            <ShieldOff className="w-4 h-4" />
                            Suspend Bidder
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground font-body">No bidders found</p>
            </div>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                <TableHead className="font-body font-semibold text-foreground">
                  Bidder
                </TableHead>
                <TableHead className="font-body font-semibold text-foreground">
                  Contact
                </TableHead>
                <TableHead
                  className="font-body font-semibold text-foreground cursor-pointer"
                  onClick={handleSort}
                >
                  <div className="flex items-center gap-1">
                    Registered
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </TableHead>
                <TableHead className="font-body font-semibold text-foreground">
                  Payment
                </TableHead>
                <TableHead className="font-body font-semibold text-foreground">
                  Status
                </TableHead>
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
                              {getBidderInitials(reg.bidder.name)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-body font-medium text-foreground">
                              {reg.bidder.name}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                            <Mail className="w-3 h-3" />
                            {reg.bidder.email || "-"}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                            <Phone className="w-3 h-3" />
                            {reg.bidder.phone || "-"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-body text-muted-foreground">
                        {formatRegisteredDate(reg.created_at)}
                      </TableCell>
                      <TableCell>
                        {reg.payment_verified ? (
                          <Badge
                            variant="outline"
                            className="font-body text-xs gap-1 text-success border-success"
                          >
                            <Check className="w-3 h-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="font-body text-xs gap-1 text-muted-foreground"
                          >
                            <X className="w-3 h-3" />
                            Unverified
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={statusConfig.variant}
                          className="font-body text-xs gap-1"
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="font-body">
                            <DropdownMenuItem className="gap-2">
                              <Eye className="w-4 h-4" />
                              View Profile
                            </DropdownMenuItem>
                            {reg.status !== "approved" && (
                              <DropdownMenuItem
                                className="gap-2 text-success"
                                onClick={() =>
                                  handleUpdateStatus(reg.id, "approved")
                                }
                              >
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
                              <DropdownMenuItem
                                className="gap-2 text-destructive"
                                onClick={() =>
                                  handleUpdateStatus(reg.id, "suspended")
                                }
                              >
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
        </div>
      </Card>

      {/* Bidder Profile Dialog */}
      <Dialog open={!!profileUserId} onOpenChange={(open) => { if (!open) setProfileUserId(null); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Bidder Profile</DialogTitle>
            <DialogDescription className="font-body">Full details for this registered bidder</DialogDescription>
          </DialogHeader>

          {bidderProfile.isLoading ? (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-3">
                <Skeleton className="w-14 h-14 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          ) : bidderProfile.isError ? (
            <div className="py-12 text-center text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-body">Could not load bidder profile.</p>
            </div>
          ) : bidderProfile.data ? (() => {
            const p = bidderProfile.data;
            const fullName = [p.firstName, p.lastName].filter(Boolean).join(" ") || "—";
            return (
              <div className="space-y-5">
                {/* Identity */}
                <div className="flex items-center gap-4">
                  {p.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.avatar} alt={fullName} className="w-14 h-14 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <span className="font-semibold text-muted-foreground text-lg">
                        {getBidderInitials(fullName)}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-lg text-foreground leading-tight">{fullName}</p>
                    <p className="text-sm text-muted-foreground font-body truncate">{p.email}</p>
                    {p.phone && (
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground font-body">
                        <Phone className="w-3 h-3 shrink-0" />
                        {p.phone}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground font-body">
                  {p.country && <span className="flex items-center gap-1">🌍 {p.country}</span>}
                  {p.joinedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Joined {new Date(p.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  )}
                  {p.isBlocked && <Badge variant="destructive" className="text-xs">Blocked</Badge>}
                </div>

                <Separator />

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-secondary/60 p-3 text-center">
                    <Gavel className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xl font-display font-bold leading-none">{p.totalBids ?? 0}</p>
                    <p className="text-xs text-muted-foreground font-body mt-1">Total Bids</p>
                  </div>
                  <div className="rounded-lg bg-secondary/60 p-3 text-center">
                    <Trophy className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xl font-display font-bold leading-none">{p.wonAuctions ?? 0}</p>
                    <p className="text-xs text-muted-foreground font-body mt-1">Won</p>
                  </div>
                  <div className="rounded-lg bg-secondary/60 p-3 text-center">
                    <TrendingUp className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xl font-display font-bold leading-none">{p.winRate ?? 0}%</p>
                    <p className="text-xs text-muted-foreground font-body mt-1">Win Rate</p>
                  </div>
                </div>

                {/* Reputation */}
                {p.reputation && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between rounded-lg bg-secondary/60 px-4 py-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground font-body mb-0.5">Reputation</p>
                        <p className="font-body font-semibold text-foreground">{p.reputation.level ?? "—"}</p>
                        <p className="text-xs text-muted-foreground font-body capitalize">{p.reputation.status ?? ""}</p>
                      </div>
                      <Badge variant="outline" className="font-body text-base px-3 py-1">
                        {p.reputation.score ?? "—"}
                      </Badge>
                    </div>
                  </>
                )}

                {/* Bidding History */}
                {p.biddingHistory && p.biddingHistory.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 font-body">Recent Bids</p>
                      <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                        {p.biddingHistory.slice(0, 5).map((h) => (
                          <div key={h.id} className="flex items-center justify-between px-3 py-2.5 bg-background hover:bg-secondary/40 transition-colors">
                            <div className="min-w-0">
                              <p className="font-body text-sm text-foreground truncate max-w-[240px]">{h.auctionTitle}</p>
                              <p className="text-xs text-muted-foreground font-body">
                                {new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </p>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <p className="font-body font-semibold text-sm">${Number(h.bidAmount).toLocaleString()}</p>
                              <Badge variant="outline" className="text-xs font-body capitalize mt-0.5">{h.status}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })() : null}
        </DialogContent>
      </Dialog>

      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Bidder</DialogTitle>
            <DialogDescription>
              Provide a reason for rejection.
            </DialogDescription>
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
                handleUpdateStatus(
                  selectedRegistration.id,
                  "rejected",
                  rejectionReason
                );
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
