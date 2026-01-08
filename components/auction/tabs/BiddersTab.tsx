import { useState } from "react";
import { Auction, Bidder } from "@/data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Plus, 
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
  ShieldOff
} from "lucide-react";

interface BiddersTabProps {
  auction: Auction;
}

function getStatusBadge(status: Bidder["status"]) {
  const config = {
    Accepted: { label: "Accepted", variant: "default" as const, icon: Check },
    Rejected: { label: "Rejected", variant: "secondary" as const, icon: X },
    Blocked: { label: "Blocked", variant: "destructive" as const, icon: X },
  };
  return config[status] || config.Rejected;
}

export default function BiddersTab({ auction }: BiddersTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof Bidder>("registrationDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isAddBidderOpen, setIsAddBidderOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bidderForm, setBidderForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const filteredBidders = auction.bidders
    .filter((bidder) =>
      bidder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bidder.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortOrder === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

  const handleSort = (field: keyof Bidder) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const rejectedCount = auction.bidders.filter(b => b.status === "Rejected").length;

  const handleAddBidder = async () => {
    if (!bidderForm.name || !bidderForm.email || !bidderForm.phone) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsAddBidderOpen(false);
    setBidderForm({ name: "", email: "", phone: "" });
    setIsLoading(false);
    toast.success("Bidder added successfully", {
      description: `${bidderForm.name} has been added to the auction.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-semibold text-foreground">Bidders</h2>
          <p className="text-sm text-muted-foreground font-body mt-1">
            Manage registered bidders and approvals
            {rejectedCount > 0 && (
              <Badge variant="secondary" className="ml-2 font-body">
                {rejectedCount} rejected
              </Badge>
            )}
          </p>
        </div>
        <Button 
          className="gap-2 font-body gradient-gold border-0 text-accent-foreground hover:opacity-90"
          onClick={() => setIsAddBidderOpen(true)}
          disabled={isLoading}
        >
          <Plus className="w-4 h-4" />
          Add Bidder
        </Button>
      </div>

      {/* Search */}
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

      {/* Bidders table */}
      <Card className="border border-border shadow-soft overflow-hidden pt-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="font-body font-semibold text-foreground">Bidder</TableHead>
              <TableHead className="font-body font-semibold text-foreground">Contact</TableHead>
              <TableHead 
                className="font-body font-semibold text-foreground cursor-pointer"
                onClick={() => handleSort("registrationDate")}
              >
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
              filteredBidders.map((bidder) => {
                const statusConfig = getStatusBadge(bidder.status);
                const StatusIcon = statusConfig.icon;
                return (
                  <TableRow key={bidder.id} className="group hover:bg-secondary/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                          <span className="font-body font-semibold text-muted-foreground text-sm">
                            {bidder.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-body font-medium text-foreground">
                            {bidder.name}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                          <Mail className="w-3 h-3" />
                          {bidder.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                          <Phone className="w-3 h-3" />
                          {bidder.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-body text-muted-foreground">
                      {new Date(bidder.registrationDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      {bidder.depositStatus ? (
                        <Badge variant="outline" className="font-body text-xs gap-1 text-success border-success">
                          <Check className="w-3 h-3" />
                          Paid
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="font-body text-xs gap-1 text-muted-foreground">
                          <X className="w-3 h-3" />
                          Unpaid
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
                          {bidder.status !== "Accepted" && (
                            <DropdownMenuItem className="gap-2 text-success">
                              <Shield className="w-4 h-4" />
                              Accept Bidder
                            </DropdownMenuItem>
                          )}
                          {bidder.status === "Accepted" && (
                            <DropdownMenuItem className="gap-2 text-warning">
                              <X className="w-4 h-4" />
                              Reject Bidder
                            </DropdownMenuItem>
                          )}
                          {bidder.status !== "Blocked" && (
                            <DropdownMenuItem className="gap-2 text-destructive">
                              <ShieldOff className="w-4 h-4" />
                              Block Bidder
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

      {/* Add Bidder Dialog */}
      <Dialog open={isAddBidderOpen} onOpenChange={setIsAddBidderOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Bidder</DialogTitle>
            <DialogDescription>
              Add a new bidder to this auction. They will need to be approved before they can place bids.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bidder-name">Full Name *</Label>
              <Input
                id="bidder-name"
                value={bidderForm.name}
                onChange={(e) => setBidderForm({ ...bidderForm, name: e.target.value })}
                placeholder="Enter bidder's full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bidder-email">Email Address *</Label>
              <Input
                id="bidder-email"
                type="email"
                value={bidderForm.email}
                onChange={(e) => setBidderForm({ ...bidderForm, email: e.target.value })}
                placeholder="Enter bidder's email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bidder-phone">Phone Number *</Label>
              <Input
                id="bidder-phone"
                type="tel"
                value={bidderForm.phone}
                onChange={(e) => setBidderForm({ ...bidderForm, phone: e.target.value })}
                placeholder="Enter bidder's phone number"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddBidderOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleAddBidder} disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Bidder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
