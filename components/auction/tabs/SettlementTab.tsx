	import { Auction } from "@/data";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Download, Send, Check, Clock, DollarSign, FileText, AlertCircle } from "lucide-react";

interface SettlementTabProps {
  auction: Auction;
}

import { formatCurrency } from "@/lib/utils";

	export default function SettlementTab({ auction }: SettlementTabProps) {
	  const soldLots = auction.lots.filter(l => l.status === "Sold");
	  const totalSales = soldLots.reduce((sum, lot) => sum + lot.highestBid, 0);
	  const commissionRate = 0.10;
	  const commission = totalSales * commissionRate;
	  const netPayout = totalSales - commission;
	
	  const invoices = soldLots.map((lot, index) => ({
	    id: `INV-${String(index + 1).padStart(4, '0')}`,
	    lot,
	    buyer: auction.bidders[index % auction.bidders.length]?.name || "Unknown",
	    amount: lot.highestBid,
	    commission: lot.highestBid * commissionRate,
	    status: index === 0 ? "paid" as const : "pending" as const,
	  }));
	
	  const consignorPayouts = [
	    { id: "CON-001", name: "Art Gallery Consignment", lots: 3, totalSale: 5000000, payout: 4500000, status: "pending" as const },
	    { id: "CON-002", name: "Private Collector", lots: 1, totalSale: 1200000, payout: 1080000, status: "paid" as const },
	  ];
	
	  return (
	    <Tabs defaultValue="bidder" className="space-y-6">
	      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
	        <div>
	          <h2 className="text-2xl font-display font-semibold text-foreground">Settlement Management</h2>
	          <p className="text-sm text-muted-foreground font-body mt-1">Manage post-auction financial reconciliation for both bidders and consignors.</p>
	        </div>
	        <TabsList className="h-auto p-1 bg-transparent rounded-lg gap-1 border border-border shadow-soft">
	          <TabsTrigger value="bidder" className="px-4 py-2 text-sm font-medium data-[state=active]:bg-primary">Bidder Settlement</TabsTrigger>
	          <TabsTrigger value="seller" className="px-4 py-2 text-sm font-medium data-[state=active]:bg-primary">Seller Payouts</TabsTrigger>
	        </TabsList>
	      </div>
	
	      {/* Bidder Settlement Tab Content */}
	      <TabsContent value="bidder" className="space-y-6">
	        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
	          <Card className="border border-border shadow-soft"><CardContent className="p-4"><div className="flex items-center gap-3 mb-3"><div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center"><DollarSign className="w-4 h-4 text-accent-foreground" /></div></div><p className="text-xs text-muted-foreground font-body uppercase tracking-wide mb-1">Total Sales</p><p className="text-xl font-semibold font-body text-accent tabular-nums">{formatCurrency(totalSales, auction.currency)}</p></CardContent></Card>
	          <Card className="border border-border shadow-soft"><CardContent className="p-4"><div className="flex items-center gap-3 mb-3"><div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"><CreditCard className="w-4 h-4 text-muted-foreground" /></div></div><p className="text-xs text-muted-foreground font-body uppercase tracking-wide mb-1">Commission (10%)</p><p className="text-xl font-semibold font-body text-foreground tabular-nums">{formatCurrency(commission, auction.currency)}</p></CardContent></Card>
	          <Card className="border border-border shadow-soft"><CardContent className="p-4"><div className="flex items-center gap-3 mb-3"><div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center"><Check className="w-4 h-4 text-success" /></div></div><p className="text-xs text-muted-foreground font-body uppercase tracking-wide mb-1">Net Payout</p><p className="text-xl font-semibold font-body text-success tabular-nums">{formatCurrency(netPayout, auction.currency)}</p></CardContent></Card>
	          <Card className="border border-border shadow-soft"><CardContent className="p-4"><div className="flex items-center gap-3 mb-3"><div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center"><Clock className="w-4 h-4 text-warning" /></div></div><p className="text-xs text-muted-foreground font-body uppercase tracking-wide mb-1">Pending</p><p className="text-xl font-semibold font-body text-foreground tabular-nums">{invoices.filter(i => i.status === "pending").length} invoices</p></CardContent></Card>
	        </div>
	
	        <Card className="border border-border shadow-soft overflow-hidden pb-0 gap-0">
	          <CardHeader className="border-b border-border pt-0 flex flex-row items-center justify-between">
	            <CardTitle className="text-lg font-display font-semibold flex items-center gap-2"><FileText className="w-5 h-5 text-muted-foreground" />Bidder Invoices</CardTitle>
	            <div className="flex gap-2">
	              <Button variant="outline" size="sm" className="gap-2 font-body"><Download className="w-4 h-4" />Export</Button>
	              <Button size="sm" className="gap-2 font-body gradient-gold border-0 text-accent-foreground hover:opacity-90"><Send className="w-4 h-4" />Send All</Button>
	            </div>
	          </CardHeader>
	          <Table>
	            <TableHeader><TableRow className="bg-secondary/50 hover:bg-secondary/50"><TableHead className="font-body font-semibold text-foreground">Invoice</TableHead><TableHead className="font-body font-semibold text-foreground">Lot</TableHead><TableHead className="font-body font-semibold text-foreground">Buyer</TableHead><TableHead className="font-body font-semibold text-foreground">Amount</TableHead><TableHead className="font-body font-semibold text-foreground">Status</TableHead><TableHead className="font-body font-semibold text-foreground w-32"></TableHead></TableRow></TableHeader>
	            <TableBody>
	              {invoices.length > 0 ? invoices.map((invoice) => (
	                <TableRow key={invoice.id} className="hover:bg-secondary/30">
	                  <TableCell className="font-body font-medium text-foreground">{invoice.id}</TableCell>
	                  <TableCell><p className="font-body font-medium text-foreground">Lot {invoice.lot.lotNumber}</p><p className="text-xs text-muted-foreground truncate max-w-48">{invoice.lot.title}</p></TableCell>
	                  <TableCell className="font-body text-foreground">{invoice.buyer}</TableCell>
	                  <TableCell className="font-body font-semibold text-accent tabular-nums">{formatCurrency(invoice.amount, auction.currency)}</TableCell>
	                  <TableCell><Badge variant={invoice.status === "paid" ? "default" : "secondary"} className="font-body text-xs gap-1">{invoice.status === "paid" ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}{invoice.status === "paid" ? "Paid" : "Pending"}</Badge></TableCell>
	                  <TableCell><Button variant="ghost" size="sm" className="font-body text-xs">View</Button></TableCell>
	                </TableRow>
	              )) : (
	                <TableRow><TableCell colSpan={6} className="text-center py-12"><AlertCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" /><p className="text-muted-foreground font-body">No invoices yet</p></TableCell></TableRow>
	              )}
	            </TableBody>
	          </Table>
	        </Card>
	      </TabsContent>
	
	      {/* Seller Payouts Tab Content */}
	      <TabsContent value="seller" className="space-y-6">
	        <Card className="border border-border shadow-soft overflow-hidden pb-0 gap-0">
	          <CardHeader className="border-b border-border pt-0 flex flex-row items-center justify-between">
	            <CardTitle className="text-lg font-display font-semibold flex items-center gap-2"><DollarSign className="w-5 h-5 text-muted-foreground" />Consignor Payouts</CardTitle>
	            <div className="flex gap-2">
	              <Button variant="outline" size="sm" className="gap-2 font-body"><Download className="w-4 h-4" />Export Payouts</Button>
	              <Button size="sm" className="gap-2 font-body gradient-gold border-0 text-accent-foreground hover:opacity-90"><Send className="w-4 h-4" />Initiate Payouts</Button>
	            </div>
	          </CardHeader>
	          <Table>
	            <TableHeader>
	              <TableRow className="bg-secondary/50 hover:bg-secondary/50">
	                <TableHead className="font-body font-semibold text-foreground">Consignor</TableHead>
	                <TableHead className="font-body font-semibold text-foreground">Lots Sold</TableHead>
	                <TableHead className="font-body font-semibold text-foreground">Total Sale</TableHead>
	                <TableHead className="font-body font-semibold text-foreground">Net Payout</TableHead>
	                <TableHead className="font-body font-semibold text-foreground">Status</TableHead>
	                <TableHead className="font-body font-semibold text-foreground w-32"></TableHead>
	              </TableRow>
	            </TableHeader>
	            <TableBody>
	              {consignorPayouts.map((payout) => (
	                <TableRow key={payout.id} className="hover:bg-secondary/30">
	                  <TableCell className="font-body font-medium text-foreground">{payout.name}</TableCell>
	                  <TableCell className="font-body text-foreground">{payout.lots}</TableCell>
	                  <TableCell className="font-body font-semibold text-accent tabular-nums">{formatCurrency(payout.totalSale, auction.currency)}</TableCell>
	                  <TableCell className="font-body font-semibold text-success tabular-nums">{formatCurrency(payout.payout, auction.currency)}</TableCell>
	                  <TableCell>
	                    <Badge variant={payout.status === "paid" ? "default" : "secondary"} className="font-body text-xs gap-1">
	                      {payout.status === "paid" ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
	                      {payout.status === "paid" ? "Paid" : "Pending"}
	                    </Badge>
	                  </TableCell>
	                  <TableCell><Button variant="ghost" size="sm" className="font-body text-xs">View Details</Button></TableCell>
	                </TableRow>
	              ))}
	            </TableBody>
	          </Table>
	        </Card>
	      </TabsContent>
	    </Tabs>
	  );
	}
