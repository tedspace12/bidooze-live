"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  CreditCard,
  Calendar,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Info,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type SubscriptionStatus = "active" | "past_due" | "grace_period" | "suspended";

export default function Billing() {
  const [isUpdatePaymentOpen, setIsUpdatePaymentOpen] = useState(false);
  const [isRetryPaymentOpen, setIsRetryPaymentOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  // Mock subscription data - in real app, this would come from API
  const subscription = {
    status: "active" as SubscriptionStatus,
    planName: "Seller Access Plan",
    price: 99.00,
    billingCycle: "monthly",
    nextBillingDate: "2026-01-15",
    currentPeriodStart: "2025-12-15",
    currentPeriodEnd: "2024-02-15",
  };

  const paymentMethod = {
    type: "card",
    brand: "Visa",
    last4: "4242",
    expiryMonth: "12",
    expiryYear: "2025",
  };

  const failedPayment = subscription.status === "past_due" || subscription.status === "grace_period" ? {
    reason: "Insufficient funds",
    failedDate: "2024-01-15",
    gracePeriodDays: 5,
    gracePeriodEnds: "2024-01-20",
  } : null;

  const invoices = [
    {
      id: "INV-2024-001",
      date: "2024-01-15",
      period: "Nov 15 - Dec 14, 2024",
      amount: 99.00,
      status: "paid",
    },
    {
      id: "INV-2024-002",
      date: "2023-12-15",
      period: "Oct 15 - Nov 14, 2024",
      amount: 99.00,
      status: "paid",
    },
    {
      id: "INV-2024-003",
      date: "2023-11-15",
      period: "Sep 15 - Oct 14, 2023",
      amount: 99.00,
      status: "paid",
    },
    {
      id: "INV-2024-004",
      date: "2023-10-15",
      period: "Aug 15 - Sep 14, 2023",
      amount: 99.00,
      status: "paid",
    },
  ];

  const getStatusBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-600 hover:bg-green-600">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "past_due":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Past Due
          </Badge>
        );
      case "grace_period":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-700 bg-yellow-50">
            <Clock className="h-3 w-3 mr-1" />
            Grace Period
          </Badge>
        );
      case "suspended":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Suspended
          </Badge>
        );
      default:
        return null;
    }
  };

  const getStatusAlert = (status: SubscriptionStatus) => {
    if (status === "active") return null;

    if (status === "past_due" || status === "grace_period") {
      return (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Payment Required</AlertTitle>
          <AlertDescription>
            {failedPayment && (
              <>
                Payment failed on {new Date(failedPayment.failedDate).toLocaleDateString()}. 
                {status === "grace_period" && (
                  <> You have {failedPayment.gracePeriodDays} days before auctions are paused.</>
                )}
                {status === "past_due" && (
                  <> Please update your payment method to continue using the platform.</>
                )}
              </>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    if (status === "suspended") {
      return (
        <Alert variant="destructive" className="mb-6">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Account Suspended</AlertTitle>
          <AlertDescription>
            Your subscription has been suspended due to payment failure. Please update your payment method to reactivate your account.
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and payment information
        </p>
      </div>

      {/* Status Alert - Only shown when not active */}
      {getStatusAlert(subscription.status)}

      {/* A. Current Subscription Status - Top Priority */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Current Subscription</CardTitle>
              <CardDescription>
                Your active subscription details
              </CardDescription>
            </div>
            {getStatusBadge(subscription.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Plan
              </p>
              <p className="text-lg font-semibold">{subscription.planName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Price
              </p>
              <p className="text-lg font-semibold">${subscription.price.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">per {subscription.billingCycle}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Billing Cycle
              </p>
              <p className="text-lg font-semibold capitalize">{subscription.billingCycle}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Next Billing Date
              </p>
              <p className="text-lg font-semibold">
                {new Date(subscription.nextBillingDate).toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {Math.ceil((new Date(subscription.nextBillingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* B. Payment Method */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                Your primary payment method for subscription billing
              </CardDescription>
            </div>
            <Dialog open={isUpdatePaymentOpen} onOpenChange={setIsUpdatePaymentOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Update Payment Method
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Payment Method</DialogTitle>
                  <DialogDescription>
                    Update your payment method to ensure uninterrupted service
                  </DialogDescription>
                </DialogHeader>
                  <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Card Number</label>
                    <Input 
                      placeholder="1234 5678 9012 3456" 
                      value={paymentForm.cardNumber}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Expiry Date</label>
                      <Input 
                        placeholder="MM/YY" 
                        value={paymentForm.expiryDate}
                        onChange={(e) => setPaymentForm({ ...paymentForm, expiryDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">CVV</label>
                      <Input 
                        placeholder="123" 
                        type="password" 
                        value={paymentForm.cvv}
                        onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cardholder Name</label>
                    <Input 
                      placeholder="John Doe" 
                      value={paymentForm.cardholderName}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cardholderName: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsUpdatePaymentOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={async () => {
                      if (!paymentForm.cardNumber || !paymentForm.expiryDate || !paymentForm.cvv || !paymentForm.cardholderName) {
                        toast.error("Please fill in all fields");
                        return;
                      }
                      setIsLoading(true);
                      await new Promise(resolve => setTimeout(resolve, 1500));
                      setIsLoading(false);
                      setIsUpdatePaymentOpen(false);
                      setPaymentForm({ cardNumber: "", expiryDate: "", cvv: "", cardholderName: "" });
                      toast.success("Payment method updated", {
                        description: "Your payment method has been updated successfully.",
                      });
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? "Updating..." : "Update Payment Method"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-background rounded-lg border">
                <CreditCard className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {paymentMethod.brand} •••• {paymentMethod.last4}
                </p>
                <p className="text-xs text-muted-foreground">
                  Expires {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}
                </p>
              </div>
            </div>
            <Badge variant="outline">Primary</Badge>
          </div>
        </CardContent>
      </Card>

      {/* D. Failed Payment & Recovery - Only when relevant */}
      {(subscription.status === "past_due" || subscription.status === "grace_period") && failedPayment && (
        <Card className="border-yellow-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <CardTitle>Payment Failed</CardTitle>
            </div>
            <CardDescription>
              Action required to maintain your subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Failure Reason</p>
                  <p className="text-sm text-muted-foreground">{failedPayment.reason}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Failed Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(failedPayment.failedDate).toLocaleDateString()}
                  </p>
                </div>
                {subscription.status === "grace_period" && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Grace Period Ends</p>
                    <p className="text-sm font-medium text-yellow-700">
                      {new Date(failedPayment.gracePeriodEnds).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Dialog open={isRetryPaymentOpen} onOpenChange={setIsRetryPaymentOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Payment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Retry Payment</DialogTitle>
                    <DialogDescription>
                      Attempt to process payment again with your current payment method
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        We will attempt to charge your payment method ending in {paymentMethod.last4}. 
                        If this fails, please update your payment method.
                      </AlertDescription>
                    </Alert>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsRetryPaymentOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={async () => {
                        setIsLoading(true);
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        setIsLoading(false);
                        setIsRetryPaymentOpen(false);
                        toast.success("Payment processed", {
                          description: "Your payment has been processed successfully.",
                        });
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : "Retry Payment"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={() => setIsUpdatePaymentOpen(true)}>
                Update Payment Method
              </Button>
            </div>
            {subscription.status === "grace_period" && (
              <p className="text-sm text-muted-foreground">
                ⚠️ You have {failedPayment.gracePeriodDays} days before auctions are paused. Please update your payment method to continue using the platform.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* C. Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            Your invoice and payment history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-sm font-medium">{invoice.id}</p>
                    <Badge
                      variant={invoice.status === "paid" ? "default" : "destructive"}
                      className={
                        invoice.status === "paid"
                          ? "bg-green-600 hover:bg-green-600"
                          : ""
                      }
                    >
                      {invoice.status === "paid" ? (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{invoice.period}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(invoice.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold">${invoice.amount.toFixed(2)}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      toast.info("Downloading receipt...", {
                        description: `Preparing receipt for ${invoice.id}`,
                      });
                      setTimeout(() => {
                        toast.success("Download started", {
                          description: "Your receipt download should begin shortly.",
                        });
                      }, 1000);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Receipt
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {invoices.length > 10 && (
            <div className="mt-4 text-center">
              <Button variant="outline">Load More</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* E. Cancellation / Suspension Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Subscription Information</CardTitle>
          </div>
          <CardDescription>
            Important information about your subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">What happens if payment stops?</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>You enter a 5-day grace period where all features remain accessible</li>
              <li>After the grace period, your account is suspended</li>
              <li>Suspended accounts cannot create new auctions or accept bids</li>
              <li>Existing auction data and history remain accessible</li>
            </ul>
          </div>
          <Separator />
          <div>
            <h3 className="text-sm font-medium mb-2">Features disabled during suspension</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Creating new auctions</li>
              <li>Accepting new bids on existing auctions</li>
              <li>Processing payments</li>
              <li>Access to advanced reporting features</li>
            </ul>
          </div>
          <Separator />
          <div>
            <h3 className="text-sm font-medium mb-2">How to reactivate</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Update your payment method on this page</li>
              <li>Retry the failed payment if applicable</li>
              <li>Once payment is successful, your account is reactivated immediately</li>
              <li>All your data and auction history will be restored</li>
            </ul>
          </div>
          <Separator />
          <div>
            <h3 className="text-sm font-medium mb-2">Cancellation</h3>
            <p className="text-sm text-muted-foreground mb-2">
              If you need to cancel your subscription, please contact support. Cancellations take effect at the end of your current billing period.
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                toast.info("Opening support", {
                  description: "Redirecting to support contact form...",
                });
              }}
            >
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

