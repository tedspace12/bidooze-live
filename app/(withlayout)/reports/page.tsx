"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { DateRangeFilter } from "@/components/auction/date-range-filter";
import { DateRange } from "react-day-picker";
import {
  FileText,
  Download,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Gavel,
  AlertTriangle,
  Database,
  Save,
  History,
  FileSpreadsheet,
  File,
  Eye,
  X,
  CheckCircle2,
  Clock,
  BarChart3,
  PieChart,
  CreditCard,
  Shield,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

type ReportCategory = "financial" | "auctions" | "sellers" | "buyers" | "risk" | "system";
type ReportStatus = "draft" | "generating" | "ready" | "failed";
type ExportFormat = "csv" | "excel" | "pdf";

interface Report {
  id: string;
  name: string;
  category: ReportCategory;
  description: string;
  icon: any;
  featured?: boolean;
}

interface SavedReport {
  id: string;
  name: string;
  reportType: string;
  lastGenerated: string;
  filters: any;
}

interface ExportHistory {
  id: string;
  reportName: string;
  format: ExportFormat;
  generatedAt: string;
  size: string;
  status: "completed" | "failed";
}

export default function Reports() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | "all">("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportConfig, setReportConfig] = useState<any>({});
  const [reportData, setReportData] = useState<any[]>([]);
  const [reportStatus, setReportStatus] = useState<ReportStatus>("draft");
  const [activeTab, setActiveTab] = useState("library");

  const reports: Report[] = [
    // Financial
    { id: "rev-summary", name: "Platform Revenue Summary", category: "financial", description: "Total revenue from commissions, fees, and premiums", icon: DollarSign, featured: true },
    { id: "fees-breakdown", name: "Platform Fees Breakdown", category: "financial", description: "Detailed breakdown of all platform fees", icon: FileText },
    { id: "payouts-summary", name: "Auctioneer Payouts Summary", category: "financial", description: "Total payouts to all sellers", icon: TrendingUp },
    { id: "payment-methods", name: "Payment Method Breakdown", category: "financial", description: "Revenue by payment method", icon: CreditCard },
    
    // Auctions
    { id: "auction-performance", name: "Auction Performance Overview", category: "auctions", description: "Performance metrics across all auctions", icon: BarChart3, featured: true },
    { id: "bid-activity", name: "Bid Activity Report", category: "auctions", description: "Bidding patterns and activity", icon: TrendingUp },
    { id: "closing-prices", name: "Closing Price Analysis", category: "auctions", description: "Analysis of final hammer prices", icon: DollarSign },
    { id: "failed-auctions", name: "Unsold / Failed Auctions", category: "auctions", description: "Auctions that did not meet reserve", icon: AlertTriangle, featured: true },
    
    // Sellers
    { id: "seller-activity", name: "Seller Activity Report", category: "sellers", description: "Activity and performance by seller", icon: Users, featured: true },
    { id: "seller-lifecycle", name: "Seller Lifecycle Report", category: "sellers", description: "Seller onboarding and retention", icon: Users },
    { id: "top-sellers", name: "Top Sellers Report", category: "sellers", description: "Highest performing sellers", icon: TrendingUp },
    
    // Buyers
    { id: "buyer-activity", name: "Buyer Activity Report", category: "buyers", description: "Buyer registration and bidding activity", icon: Users },
    { id: "failed-transactions", name: "Failed Transactions Report", category: "buyers", description: "Payment failures and issues", icon: AlertTriangle },
    
    // Risk & Compliance
    { id: "disputes-refunds", name: "Disputes & Refunds Report", category: "risk", description: "All disputes and refund transactions", icon: AlertTriangle },
    { id: "suspended-accounts", name: "Suspended & Flagged Accounts", category: "risk", description: "Accounts flagged for review", icon: Shield },
    
    // System
    { id: "system-health", name: "System Health Report", category: "system", description: "Platform performance and uptime", icon: Database },
    { id: "report-log", name: "Report Generation Log", category: "system", description: "History of all report generations", icon: History },
    { id: "audit-export", name: "Financial Audit Export", category: "system", description: "Complete financial data for auditing", icon: FileText },
  ];

  const savedReports: SavedReport[] = [
    { id: "saved-1", name: "Monthly Revenue Report", reportType: "Platform Revenue Summary", lastGenerated: "2024-01-15", filters: { dateRange: "2024-01" } },
    { id: "saved-2", name: "Q4 Seller Performance", reportType: "Seller Activity Report", lastGenerated: "2024-01-10", filters: { dateRange: "2023-Q4" } },
  ];

  const exportHistory: ExportHistory[] = [
    { id: "exp-1", reportName: "Platform Revenue Summary", format: "excel", generatedAt: "2024-01-15 10:30 AM", size: "2.4 MB", status: "completed" },
    { id: "exp-2", reportName: "Auction Performance Overview", format: "pdf", generatedAt: "2024-01-14 3:45 PM", size: "1.8 MB", status: "completed" },
    { id: "exp-3", reportName: "Seller Activity Report", format: "csv", generatedAt: "2024-01-13 9:15 AM", size: "856 KB", status: "completed" },
  ];

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           report.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || report.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const featuredReports = reports.filter(r => r.featured);

  const handleGenerateReport = (report: Report) => {
    setSelectedReport(report);
    setReportConfig({});
    setReportStatus("generating");
    setActiveTab("viewer");
    toast.info("Generating report...", {
      description: `Preparing ${report.name}`,
    });
    // Simulate report generation
    setTimeout(() => {
      setReportStatus("ready");
      // Mock data
      setReportData([
        { id: 1, name: "Sample Data 1", value: "$10,000", date: "2024-01-15" },
        { id: 2, name: "Sample Data 2", value: "$8,500", date: "2024-01-14" },
        { id: 3, name: "Sample Data 3", value: "$12,300", date: "2024-01-13" },
      ]);
      toast.success("Report generated", {
        description: `${report.name} is ready to view.`,
      });
    }, 2000);
  };

  const handleExport = (format: ExportFormat) => {
    if (!selectedReport) {
      toast.error("No report selected");
      return;
    }
    toast.info("Exporting report...", {
      description: `Preparing ${format.toUpperCase()} export`,
    });
    setTimeout(() => {
      toast.success("Export completed", {
        description: `Report exported as ${format.toUpperCase()}`,
      });
    }, 1500);
  };

  const handleSaveReport = () => {
    if (!selectedReport) {
      toast.error("No report selected");
      return;
    }
    toast.success("Report configuration saved", {
      description: "You can re-run this report from the Saved Reports tab.",
    });
  };

  const categoryLabels: Record<ReportCategory | "all", string> = {
    all: "All Categories",
    financial: "Financial",
    auctions: "Auctions",
    sellers: "Sellers",
    buyers: "Buyers",
    risk: "Risk & Compliance",
    system: "System & Audit",
  };

  const categoryIcons: Record<ReportCategory, any> = {
    financial: DollarSign,
    auctions: Gavel,
    sellers: Users,
    buyers: Users,
    risk: AlertTriangle,
    system: Database,
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 via-primary/5 to-background border border-primary/20 p-8">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Reports Center</h1>
              <p className="text-muted-foreground text-lg">
                Platform-level analytics, financial reports, and business intelligence
              </p>
            </div>
            <Badge variant="outline" className="bg-background/80">
              <Shield className="h-3 w-3 mr-1" />
              Admin Only
            </Badge>
          </div>

          {/* Reports Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-background/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Reports Generated</p>
                    <p className="text-2xl font-bold">24</p>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </div>
                  <FileText className="h-8 w-8 text-green-700 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-background/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold">$245K</p>
                    <p className="text-xs text-muted-foreground">Last 30 days</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-background/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Active Auctions</p>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-xs text-muted-foreground">Currently running</p>
                  </div>
                  <Gavel className="h-8 w-8 text-blue-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-background/80 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Sell-Through Rate</p>
                    <p className="text-2xl font-bold">87%</p>
                    <p className="text-xs text-muted-foreground">Last 30 days</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Global Date Range Selector */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Date Range:</span>
            </div>
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
            {dateRange && (
              <Button variant="ghost" size="sm" onClick={() => setDateRange(undefined)}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      </div>

      {/* Featured Reports */}
      <Card className="shadow-lg">
        <CardHeader className="bg-linear-to-r from-primary/5 to-transparent border-b">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-700" />
            Featured Reports
          </CardTitle>
          <CardDescription>Quick access to commonly used reports</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredReports.map((report) => {
              const Icon = report.icon;
              return (
                <button
                  key={report.id}
                  onClick={() => handleGenerateReport(report)}
                  className="group p-4 bg-linear-to-br from-muted/50 to-muted/30 rounded-xl border hover:border-primary/50 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-5 w-5 text-green-700" />
                    </div>
                    <Badge variant="outline" className="text-xs">Featured</Badge>
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{report.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{report.description}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="library">
            <FileText className="h-4 w-4 mr-2" />
            Reports Library
          </TabsTrigger>
          <TabsTrigger value="viewer">
            <Eye className="h-4 w-4 mr-2" />
            Report Viewer
          </TabsTrigger>
          <TabsTrigger value="saved">
            <Save className="h-4 w-4 mr-2" />
            Saved Reports
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            Export History
          </TabsTrigger>
        </TabsList>

        {/* Reports Library Tab */}
        <TabsContent value="library" className="space-y-6 mt-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reports by Category */}
          {["financial", "auctions", "sellers", "buyers", "risk", "system"].map((category) => {
            const categoryReports = filteredReports.filter(r => r.category === category);
            if (categoryReports.length === 0) return null;
            
            const CategoryIcon = categoryIcons[category as ReportCategory];
            
            return (
              <Card key={category} className="shadow-lg p-0 overflow-hidden">
                <CardHeader className="bg-linear-to-r from-muted/50 to-transparent border-b pt-4">
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="h-5 w-5 text-muted-foreground" />
                    <CardTitle>{categoryLabels[category as ReportCategory]}</CardTitle>
                    <Badge variant="secondary" className="ml-auto">
                      {categoryReports.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryReports.map((report) => {
                      const Icon = report.icon;
                      return (
                        <button
                          key={report.id}
                          onClick={() => handleGenerateReport(report)}
                          className="group p-4 bg-muted/30 rounded-xl border hover:border-primary/50 hover:shadow-md transition-all text-left"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Icon className="h-4 w-4 text-green-700" />
                            </div>
                          </div>
                          <h3 className="font-semibold text-sm mb-1">{report.name}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">{report.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Report Viewer Tab */}
        <TabsContent value="viewer" className="space-y-6 mt-6">
          {selectedReport ? (
            <>
              {/* Report Configuration */}
              <Card className="shadow-lg p-0 overflow-hidden">
                <CardHeader className="bg-linear-to-r from-blue-50 to-transparent border-b pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <selectedReport.icon className="h-5 w-5 text-green-700" />
                        {selectedReport.name}
                      </CardTitle>
                      <CardDescription>Configure report parameters</CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => setSelectedReport(null)}>
                      <X className="h-4 w-4 mr-2" />
                      Close
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Date Range</label>
                      <DateRangeFilter value={dateRange} onChange={setDateRange} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Auction Category</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="heavy-equipment">Heavy Equipment</SelectItem>
                          <SelectItem value="collectibles">Collectibles</SelectItem>
                          <SelectItem value="vehicles">Vehicles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Status</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Format</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Table View" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="table">Table View</SelectItem>
                          <SelectItem value="chart">Chart View</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-3">
                    <Button onClick={() => handleGenerateReport(selectedReport)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                    <Button variant="outline" onClick={handleSaveReport}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Report Results */}
              {reportStatus === "generating" && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Clock className="h-12 w-12 text-green-700 mx-auto mb-4 animate-spin" />
                    <p className="text-muted-foreground">Generating report...</p>
                  </CardContent>
                </Card>
              )}

              {reportStatus === "ready" && reportData.length > 0 && (
                <Card className="shadow-lg p-0 overflow-hidden">
                  <CardHeader className="bg-linear-to-r from-green-50 to-transparent border-b p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Report Results</CardTitle>
                        <CardDescription>
                          Showing data for {dateRange?.from ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to?.toLocaleDateString()}` : "All Time"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
                          <FileSpreadsheet className="h-4 w-4 mr-2" />
                          CSV
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleExport("excel")}>
                          <FileSpreadsheet className="h-4 w-4 mr-2" />
                          Excel
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
                          <File className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell>{row.id}</TableCell>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>{row.value}</TableCell>
                            <TableCell>{row.date}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell colSpan={2} className="font-semibold">Total</TableCell>
                          <TableCell className="font-semibold">$30,800</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a report from the library to view results</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Saved Reports Tab */}
        <TabsContent value="saved" className="space-y-6 mt-6">
          <Card className="shadow-lg p-0 overflow-hidden">
            <CardHeader className="bg-linear-to-r from-purple-50 to-transparent border-b pt-4">
              <CardTitle>Saved Report Configurations</CardTitle>
              <CardDescription>Re-run saved reports with pre-configured filters</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {savedReports.map((saved) => (
                  <div
                    key={saved.id}
                    className="p-4 bg-muted/30 rounded-xl border hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{saved.name}</h3>
                          <Badge variant="outline">{saved.reportType}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Last generated: {saved.lastGenerated}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const report = reports.find(r => r.name === saved.reportType);
                            if (report) {
                              handleGenerateReport(report);
                            }
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const report = reports.find(r => r.name === saved.reportType);
                            if (report) {
                              handleGenerateReport(report);
                            }
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Re-run
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export History Tab */}
        <TabsContent value="history" className="space-y-6 mt-6">
          <Card className="shadow-lg p-0 overflow-hidden">
            <CardHeader className="bg-linear-to-r from-orange-50 to-transparent border-b pt-4">
              <CardTitle>Export History</CardTitle>
              <CardDescription>Previously generated report exports</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exportHistory.map((export_) => (
                    <TableRow key={export_.id}>
                      <TableCell className="font-medium">{export_.reportName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase">
                          {export_.format}
                        </Badge>
                      </TableCell>
                      <TableCell>{export_.generatedAt}</TableCell>
                      <TableCell>{export_.size}</TableCell>
                      <TableCell>
                        <Badge
                          variant={export_.status === "completed" ? "default" : "destructive"}
                          className={export_.status === "completed" ? "bg-green-600" : ""}
                        >
                          {export_.status === "completed" ? (
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                          ) : null}
                          {export_.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            toast.info("Downloading export...", {
                              description: `Preparing ${export_.reportName} (${export_.format.toUpperCase()})`,
                            });
                            setTimeout(() => {
                              toast.success("Download started", {
                                description: "Your file download should begin shortly.",
                              });
                            }, 1000);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
