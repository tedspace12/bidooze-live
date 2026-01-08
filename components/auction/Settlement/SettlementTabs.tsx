import { useState } from "react";
import { User, Store, DollarSign, Package, Truck, FileText, Check, X } from "lucide-react";
import { PremiumTable } from "../PremiumTable";
import { StatusBadge } from "../StatusBadge";
import { PremiumButton } from "../PremiumButton";
import { cn } from "@/lib/utils";

interface BidderSettlement {
  id: number;
  bidder: string;
  name: string;
  cashBuyer: boolean;
  lotCount: number;
  shippedPickedUp: string;
  balance: number;
  invoiceNumber: string;
  invoiceStatus: "paid" | "pending" | "overdue";
  shippingRequested: boolean;
}

interface SellerSettlement {
  id: number;
  seller: string;
  name: string;
  lotCount: number;
  soldCount: number;
  grossSales: number;
  commission: number;
  netPayout: number;
  paymentStatus: "paid" | "pending";
}

const mockBidderSettlements: BidderSettlement[] = [
  { id: 1, bidder: "B001", name: "John Smith", cashBuyer: false, lotCount: 5, shippedPickedUp: "3/5", balance: 2450.00, invoiceNumber: "INV-2024-001", invoiceStatus: "paid", shippingRequested: true },
  { id: 2, bidder: "B002", name: "Sarah Johnson", cashBuyer: true, lotCount: 3, shippedPickedUp: "0/3", balance: 890.00, invoiceNumber: "INV-2024-002", invoiceStatus: "pending", shippingRequested: false },
  { id: 3, bidder: "B003", name: "Michael Chen", cashBuyer: false, lotCount: 8, shippedPickedUp: "8/8", balance: 0, invoiceNumber: "INV-2024-003", invoiceStatus: "paid", shippingRequested: true },
  { id: 4, bidder: "B004", name: "Emily Davis", cashBuyer: false, lotCount: 2, shippedPickedUp: "0/2", balance: 15600.00, invoiceNumber: "INV-2024-004", invoiceStatus: "overdue", shippingRequested: false },
];

const mockSellerSettlements: SellerSettlement[] = [
  { id: 1, seller: "S001", name: "Estate of Williams", lotCount: 45, soldCount: 42, grossSales: 28500, commission: 4275, netPayout: 24225, paymentStatus: "paid" },
  { id: 2, seller: "S002", name: "Antique Traders LLC", lotCount: 32, soldCount: 28, grossSales: 15200, commission: 2280, netPayout: 12920, paymentStatus: "pending" },
  { id: 3, seller: "S003", name: "Private Collection", lotCount: 25, soldCount: 25, grossSales: 42000, commission: 6300, netPayout: 35700, paymentStatus: "paid" },
];

type TabType = "bidder" | "seller";

export function SettlementTabs() {
  const [activeTab, setActiveTab] = useState<TabType>("bidder");

  const bidderColumns = [
    { key: "bidder", header: "Bidder", className: "w-20" },
    { 
      key: "name", 
      header: "Name",
      render: (item: BidderSettlement) => (
        <span className="font-medium text-foreground">{item.name}</span>
      )
    },
    { 
      key: "cashBuyer", 
      header: "Cash",
      className: "w-16 text-center",
      render: (item: BidderSettlement) => (
        item.cashBuyer ? (
          <DollarSign className="h-4 w-4 text-green-700 mx-auto" />
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      )
    },
    { key: "lotCount", header: "Lots", className: "w-16 text-center" },
    { 
      key: "shippedPickedUp", 
      header: "Shipped/Picked",
      className: "w-28",
      render: (item: BidderSettlement) => (
        <div className="flex items-center gap-1">
          {item.shippedPickedUp === `${item.lotCount}/${item.lotCount}` ? (
            <Check className="h-4 w-4 text-green-700" />
          ) : (
            <Package className="h-4 w-4 text-muted-foreground" />
          )}
          <span>{item.shippedPickedUp}</span>
        </div>
      )
    },
    { 
      key: "balance", 
      header: "Balance",
      className: "w-28 text-right",
      render: (item: BidderSettlement) => (
        <span className={cn(
          "font-semibold",
          item.balance === 0 ? "text-green-700" : "text-foreground"
        )}>
          ${item.balance.toLocaleString()}
        </span>
      )
    },
    { 
      key: "invoiceNumber", 
      header: "Invoice",
      render: (item: BidderSettlement) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span>{item.invoiceNumber}</span>
        </div>
      )
    },
    { 
      key: "invoiceStatus", 
      header: "Status",
      render: (item: BidderSettlement) => (
        <StatusBadge 
          status={item.invoiceStatus === "paid" ? "completed" : item.invoiceStatus === "overdue" ? "live" : "pending"} 
          label={item.invoiceStatus.charAt(0).toUpperCase() + item.invoiceStatus.slice(1)}
        />
      )
    },
    { 
      key: "shippingRequested", 
      header: "Ship",
      className: "w-16 text-center",
      render: (item: BidderSettlement) => (
        item.shippingRequested ? (
          <Truck className="h-4 w-4 text-green-700 mx-auto" />
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      )
    },
  ];

  const sellerColumns = [
    { key: "seller", header: "Seller", className: "w-20" },
    { 
      key: "name", 
      header: "Name",
      render: (item: SellerSettlement) => (
        <span className="font-medium text-foreground">{item.name}</span>
      )
    },
    { key: "lotCount", header: "Total Lots", className: "w-24 text-center" },
    { 
      key: "soldCount", 
      header: "Sold",
      className: "w-20 text-center",
      render: (item: SellerSettlement) => (
        <span className={item.soldCount === item.lotCount ? "text-green-700 font-medium" : ""}>
          {item.soldCount}
        </span>
      )
    },
    { 
      key: "grossSales", 
      header: "Gross Sales",
      className: "w-28 text-right",
      render: (item: SellerSettlement) => (
        <span className="font-medium">${item.grossSales.toLocaleString()}</span>
      )
    },
    { 
      key: "commission", 
      header: "Commission",
      className: "w-28 text-right",
      render: (item: SellerSettlement) => (
        <span className="text-muted-foreground">${item.commission.toLocaleString()}</span>
      )
    },
    { 
      key: "netPayout", 
      header: "Net Payout",
      className: "w-28 text-right",
      render: (item: SellerSettlement) => (
        <span className="font-semibold text-green-700">${item.netPayout.toLocaleString()}</span>
      )
    },
    { 
      key: "paymentStatus", 
      header: "Payment",
      render: (item: SellerSettlement) => (
        <StatusBadge 
          status={item.paymentStatus === "paid" ? "completed" : "pending"} 
          label={item.paymentStatus.charAt(0).toUpperCase() + item.paymentStatus.slice(1)}
        />
      )
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-secondary rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("bidder")}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200",
            activeTab === "bidder" 
              ? "bg-card text-foreground shadow-sm font-semibold border border-primary/20" 
              : "text-muted-foreground hover:text-foreground hover:bg-card/50"
          )}
        >
          <User className="h-4 w-4" />
          Bidder Settlement
        </button>
        <button
          onClick={() => setActiveTab("seller")}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200",
            activeTab === "seller" 
              ? "bg-card text-foreground shadow-sm font-semibold border border-primary/20" 
              : "text-muted-foreground hover:text-foreground hover:bg-card/50"
          )}
        >
          <Store className="h-4 w-4" />
          Seller Settlement
        </button>
      </div>

      {/* Content */}
      <div className="premium-card">
        {activeTab === "bidder" ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Bidder Settlement</h3>
                <p className="text-sm text-muted-foreground">Manage bidder invoices and payments</p>
              </div>
              <div className="flex gap-3">
                <PremiumButton variant="outline" size="sm">
                  Export All
                </PremiumButton>
                <PremiumButton size="sm">
                  Generate Invoices
                </PremiumButton>
              </div>
            </div>
            <PremiumTable columns={bidderColumns} data={mockBidderSettlements} />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Seller Settlement</h3>
                <p className="text-sm text-muted-foreground">Manage seller payouts and commissions</p>
              </div>
              <div className="flex gap-3">
                <PremiumButton variant="outline" size="sm">
                  Export All
                </PremiumButton>
                <PremiumButton size="sm">
                  Process Payouts
                </PremiumButton>
              </div>
            </div>
            <PremiumTable columns={sellerColumns} data={mockSellerSettlements} />
          </div>
        )}
      </div>
    </div>
  );
}
