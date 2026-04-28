"use client";

import { useAdmin } from "@/features/admin/hooks/useAdmin";
import { useAdminSubscription } from "@/features/admin/hooks/useAdminSubscription";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/features/admin/services/adminService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ChevronLeft,
  CheckCircle,
  XCircle,
  MessageSquare,
  Building,
  Mail,
  Calendar,
  Globe,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  ExternalLink,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  PauseCircle,
  PlayCircle,
  Ban,
  Loader2,
} from "lucide-react";
import { useState } from "react";

export default function AuctioneerDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { approveAuctioneer, rejectAuctioneer, requestReview } = useAdmin();
  const { suspendAuctioneer, unsuspendAuctioneer, banAuctioneer } = useAdminSubscription();
  const [notes, setNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [banOpen, setBanOpen] = useState(false);
  const [banReason, setBanReason] = useState("");

  const { data: response, isLoading } = useQuery({
    queryKey: ["admin", "auctioneer", id],
    queryFn: () => adminService.getAuctioneer(Number(id)),
  });

  const auctioneer = response;

  const handleApprove = async () => {
    if (window.confirm("Are you sure you want to approve this application?")) {
      await approveAuctioneer.mutateAsync({ id: Number(id), notes });
    }
  };

  const handleReject = async () => {
    if (!rejectReason) {
      alert("Please provide a reason for rejection.");
      return;
    }
    await rejectAuctioneer.mutateAsync({ id: Number(id), reason: rejectReason, notes });
    setShowRejectForm(false);
  };

  const handleRequestReview = async () => {
    if (!notes) {
      alert("Please provide notes for the review request.");
      return;
    }
    await requestReview.mutateAsync({ id: Number(id), notes });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!auctioneer) {
    return <div className="p-6 text-center">Auctioneer not found.</div>;
  }

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter': return <Twitter className="h-4 w-4" />;
      case 'facebook': return <Facebook className="h-4 w-4" />;
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'linkedin': return <Linkedin className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="w-full justify-start sm:w-auto">
        <ChevronLeft className="h-4 w-4 mr-2" /> Back to List
      </Button>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-800">
            {auctioneer.company_info?.company_name || auctioneer.contacts?.contact_name || "Auctioneer"}
          </h1>
          <div className="flex flex-wrap items-center text-slate-600 gap-x-6 gap-y-2">
            <span className="flex items-center gap-1 break-all"><Mail className="h-4 w-4 shrink-0" /> {auctioneer.contacts?.email || "N/A"}</span>
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4 shrink-0" /> Joined {new Date(auctioneer.created_at).toLocaleDateString()}</span>
            {auctioneer.contacts?.phone && (
              <span className="flex items-center gap-1"><Phone className="h-4 w-4 shrink-0" /> {auctioneer.contacts.phone}</span>
            )}
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 xl:w-auto xl:justify-end">
          <Badge variant="outline" className="text-sm px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
            Step {auctioneer.registration_step}
          </Badge>
          <Badge className={`text-sm px-4 py-1 ${
            auctioneer.status === 'approved' ? 'bg-green-500' : 
            auctioneer.status === 'pending_review' ? 'bg-orange-500' : 'bg-slate-500'
          }`}>
            {auctioneer.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          {/* Company & Business Details */}
          <Card>
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="h-5 w-5 text-primary" /> Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company Name</p>
                    <p className="font-medium text-slate-900">{auctioneer.company_info?.company_name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Business Type</p>
                    <p className="font-medium text-slate-900">{auctioneer.company_info?.business_type || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Years in Business</p>
                    <p className="font-medium text-slate-900">
                      {auctioneer.company_info?.years_in_business ?? "N/A"}
                      {auctioneer.company_info?.years_in_business != null ? " Years" : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Industries</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {(auctioneer.company_info?.industries?.length ?? 0) > 0 ? (
                        auctioneer.company_info?.industries.map((ind) => (
                          <Badge key={ind} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none">
                            {ind}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-slate-400 italic">None specified</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Registration No.</p>
                    <p className="font-medium text-slate-900">{auctioneer.company_info?.registration_no || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tax ID</p>
                    <p className="font-medium text-slate-900">{auctioneer.company_info?.tax_id || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">License Number</p>
                    <p className="font-medium text-slate-900">{auctioneer.company_info?.license_number || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">License Expiration</p>
                    <p className="font-medium text-slate-900">
                      {auctioneer.company_info?.license_expiration_date
                        ? new Date(auctioneer.company_info.license_expiration_date).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-1 gap-8 border-t pt-6 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Certifications</p>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-100">
                    {auctioneer.company_info.certifications || "No certifications listed."}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Associations</p>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-100">
                    {auctioneer.company_info.associations || "No associations listed."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Address */}
          <Card>
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-primary" /> Contact & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {auctioneer.contacts ? (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Primary Contact</p>
                      <p className="font-medium text-slate-900">{auctioneer.contacts.contact_name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact Email</p>
                      <p className="font-medium text-slate-900">{auctioneer.contacts.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Website</p>
                      {auctioneer.contacts.website ? (
                        <a href={auctioneer.contacts.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 break-all font-medium text-primary hover:underline">
                          {auctioneer.contacts.website} <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : <p className="text-slate-400 italic">N/A</p>}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Address</p>
                      <p className="font-medium text-slate-900 leading-relaxed">{auctioneer.contacts.address || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Social Media</p>
                      <div className="flex flex-wrap gap-3 mt-2">
                        {auctioneer.socials?.length > 0 ? auctioneer.socials.map((social) => (
                          <a 
                            key={social.id} 
                            href={social.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-primary hover:text-white transition-colors"
                            title={social.platform}
                          >
                            {getSocialIcon(social.platform)}
                          </a>
                        )) : <span className="text-slate-400 italic text-sm">No social links</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ) : <p className="text-muted-foreground italic">No contact information provided.</p>}
            </CardContent>
          </Card>

          {/* Bank Details */}
          <Card>
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5 text-primary" /> Banking Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {auctioneer.bank ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bank Name</p>
                    <p className="font-medium text-slate-900">{auctioneer.bank.bank_name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account Name</p>
                    <p className="font-medium text-slate-900">{auctioneer.bank.account_name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account Type</p>
                      <Badge variant="outline" className="mt-1 bg-slate-50 capitalize">
                        {auctioneer.bank.account_type.replace('_', ' ')}
                      </Badge>
                  </div>
                </div>
              ) : <p className="text-muted-foreground italic">No bank details provided.</p>}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" /> Submitted Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid sm:grid-cols-2 gap-4">
                {(auctioneer.documents?.length ?? 0) > 0 ? auctioneer.documents.map((doc) => (
                  <div key={doc.id} className="group flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold capitalize">{doc.type.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground">Status: <span className="text-orange-600 font-medium">{doc.status}</span></p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                )) : <p className="text-muted-foreground italic col-span-2">No documents uploaded.</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-6">
          <Card className="xl:sticky xl:top-6">
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle className="text-lg">
                {auctioneer.status === "approved" ? "Account Control" : "Review Application"}
              </CardTitle>
            </CardHeader>

            {auctioneer.status === "approved" ? (
              /* ── Approved: suspend / unsuspend / ban ── */
              <CardContent className="space-y-3 pt-4">
                <Button
                  variant="outline"
                  className="w-full gap-2 text-yellow-700 border-yellow-200 hover:bg-yellow-50"
                  onClick={() => setSuspendOpen(true)}
                  disabled={suspendAuctioneer.isPending}
                >
                  <PauseCircle className="h-4 w-4" /> Suspend Account
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => unsuspendAuctioneer.mutate(Number(id))}
                  disabled={unsuspendAuctioneer.isPending}
                >
                  {unsuspendAuctioneer.isPending
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <PlayCircle className="h-4 w-4" />
                  }
                  Unsuspend Account
                </Button>
                <Button
                  variant="ghost"
                  className="w-full gap-2 text-destructive hover:text-destructive"
                  onClick={() => setBanOpen(true)}
                  disabled={banAuctioneer.isPending}
                >
                  <Ban className="h-4 w-4" /> Permanently Ban
                </Button>
                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground text-center">
                    Approved · Registered {new Date(auctioneer.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            ) : (
              /* ── Pending / Rejected / Under Review: review actions ── */
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Internal Notes</label>
                  <textarea
                    className="w-full min-h-[120px] p-3 border rounded-md text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Enter notes for this action..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {showRejectForm ? (
                  <div className="space-y-3 p-4 bg-red-50 rounded-lg border border-red-100">
                    <label className="text-sm font-bold text-red-800">Rejection Reason (Required)</label>
                    <textarea
                      className="w-full min-h-24 p-2 border border-red-200 rounded-md text-sm focus:ring-2 focus:ring-red-200 outline-none"
                      placeholder="Why is this application being rejected?"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button variant="destructive" size="sm" className="flex-1" onClick={handleReject} disabled={rejectAuctioneer.isPending}>
                        Confirm Reject
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowRejectForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Button
                      className="bg-green-600 hover:bg-green-700 w-full py-6"
                      onClick={handleApprove}
                      disabled={approveAuctioneer.isPending}
                    >
                      <CheckCircle className="h-5 w-5 mr-2" /> Approve Application
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-blue-200 py-6 text-blue-600 hover:bg-blue-50"
                      onClick={handleRequestReview}
                      disabled={requestReview.isPending}
                    >
                      <MessageSquare className="h-5 w-5 mr-2" /> Request More Info
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full py-6"
                      onClick={() => setShowRejectForm(true)}
                      disabled={auctioneer.status === "rejected" || rejectAuctioneer.isPending}
                    >
                      <XCircle className="h-5 w-5 mr-2" /> Reject Application
                    </Button>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground text-center">
                    Submitted: {new Date(auctioneer.created_at).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Suspend dialog */}
      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Suspend Auctioneer</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Reason <span className="text-red-500">*</span></Label>
              <Input value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} className="mt-1" placeholder="Fraudulent activity" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendOpen(false)}>Cancel</Button>
            <Button
              className="bg-yellow-600 hover:bg-yellow-700"
              disabled={!suspendReason.trim() || suspendAuctioneer.isPending}
              onClick={async () => {
                await suspendAuctioneer.mutateAsync({ id: Number(id), reason: suspendReason });
                setSuspendOpen(false);
                setSuspendReason("");
              }}
            >
              {suspendAuctioneer.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban dialog */}
      <AlertDialog open={banOpen} onOpenChange={setBanOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently ban this auctioneer?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <span>This action is irreversible. The auctioneer will lose all access.</span>
              <div className="mt-2">
                <Label>Reason <span className="text-red-500">*</span></Label>
                <Input value={banReason} onChange={(e) => setBanReason(e.target.value)} className="mt-1" placeholder="Repeated violations" />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBanReason("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              disabled={!banReason.trim() || banAuctioneer.isPending}
              onClick={async () => {
                await banAuctioneer.mutateAsync({ id: Number(id), reason: banReason });
                setBanOpen(false);
                setBanReason("");
              }}
            >
              {banAuctioneer.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ban Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
