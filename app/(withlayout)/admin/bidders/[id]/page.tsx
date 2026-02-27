"use client";

import { useAdmin } from "@/features/admin/hooks/useAdmin";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/features/admin/services/adminService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ShieldAlert, ShieldCheck, Star } from "lucide-react";

export default function BidderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { updateBidderStatus } = useAdmin();

  const { data: bidder, isLoading } = useQuery({
    queryKey: ["admin", "bidder", id],
    queryFn: () => adminService.getBidder(Number(id)),
  });

  const handleStatusUpdate = async (status: string) => {
    if (window.confirm(`Are you sure you want to set this bidder to ${status}?`)) {
      await updateBidderStatus.mutateAsync({ id: Number(id), status });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!bidder) {
    return <div className="p-6 text-center">Bidder not found.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ChevronLeft className="h-4 w-4 mr-2" /> Back to List
      </Button>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{bidder.name}</h1>
          <p className="text-slate-600">{bidder.email}</p>
        </div>
        <Badge className={`text-lg px-4 py-1 ${bidder.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {bidder.status.toUpperCase()}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bidder Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">User ID:</span>
              <span className="font-medium">{bidder.id}</span>
              <span className="text-muted-foreground">Joined Date:</span>
              <span className="font-medium">{new Date(bidder.created_at).toLocaleDateString()}</span>
              <span className="text-muted-foreground">Reputation Score:</span>
              <div className="flex items-center font-medium">
                <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                {bidder.reputation_score}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Manage the bidder&apos;s access to the platform. Suspending a bidder will prevent them from placing new bids.
            </p>
            <div className="flex flex-wrap gap-2">
              {bidder.status === "active" ? (
                <Button 
                  variant="destructive"
                  onClick={() => handleStatusUpdate("suspended")}
                >
                  <ShieldAlert className="h-4 w-4 mr-2" /> Suspend Account
                </Button>
              ) : (
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleStatusUpdate("active")}
                >
                  <ShieldCheck className="h-4 w-4 mr-2" /> Reactivate Account
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
