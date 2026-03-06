import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import type {
  ConsignorListItem,
  ConsignorStatus,
} from "@/features/customers/services/customerService";
import { useCustomer } from "@/features/customers/hooks/useCustomer";

interface ConsignorDetailModalProps {
  consignor: ConsignorListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (
    consignor: ConsignorListItem,
    status: ConsignorStatus,
    reason?: string
  ) => Promise<void>;
  isStatusUpdating?: boolean;
}

const getErrorMessage = (error: unknown): string => {
  if (!error || typeof error !== "object") return "Request failed.";
  const message = (error as { message?: unknown }).message;
  if (typeof message === "string" && message.trim()) return message;
  const nested = (error as { error?: { message?: unknown } }).error?.message;
  if (typeof nested === "string" && nested.trim()) return nested;
  return "Request failed.";
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const statusBadgeClass = (status: ConsignorStatus) => {
  switch (status) {
    case "active":
      return "bg-green-50 text-green-700 border-green-200";
    case "inactive":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "suspended":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

export function ConsignorDetailModal({
  consignor,
  open,
  onOpenChange,
  onStatusChange,
  isStatusUpdating,
}: ConsignorDetailModalProps) {
  const { useConsignorNotes, useConsignorActivity, addConsignorNote } = useCustomer();
  const [newNote, setNewNote] = useState("");
  const [statusReason, setStatusReason] = useState("");

  const consignorId = open && consignor ? consignor.id : "";
  const notesQuery = useConsignorNotes(consignorId, { per_page: 20 });
  const activityQuery = useConsignorActivity(consignorId, { per_page: 20 });

  if (!consignor) return null;

  const handleAddNote = async () => {
    const content = newNote.trim();
    if (!content) {
      toast.error("Please enter a note.");
      return;
    }

    try {
      await addConsignorNote.mutateAsync({ id: consignor.id, content });
      setNewNote("");
      toast.success("Note added successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleStatusUpdate = async (status: ConsignorStatus) => {
    try {
      await onStatusChange(
        consignor,
        status,
        statusReason.trim() ? statusReason.trim() : undefined
      );
      setStatusReason("");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-1rem)] max-w-3xl overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-start gap-3">
            <Avatar>
              <AvatarImage src={undefined} />
              <AvatarFallback>
                <Building size={24} className="text-gray-500" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">{consignor.name}</p>
              <p className="truncate text-sm text-muted-foreground">{consignor.email}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start gap-1 overflow-x-auto">
            <TabsTrigger value="overview" className="shrink-0 text-xs sm:text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="notes" className="shrink-0 text-xs sm:text-sm">
              Notes
            </TabsTrigger>
            <TabsTrigger value="activity" className="shrink-0 text-xs sm:text-sm">
              Activity
            </TabsTrigger>
            <TabsTrigger value="status" className="shrink-0 text-xs sm:text-sm">
              Status
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="text-foreground">{consignor.phone || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <span
                  className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${statusBadgeClass(
                    consignor.status
                  )}`}
                >
                  {consignor.status}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Commission Rate</p>
                <p className="text-foreground">
                  {(Number(consignor.commission_rate || 0) * 100).toFixed(2).replace(/\.00$/, "")}%
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Registration Date</p>
                <p className="text-foreground">{formatDateTime(consignor.registration_date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Lots</p>
                <p className="text-foreground">{consignor.total_lots}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-foreground">${Number(consignor.total_value || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                <p className="text-foreground">${Number(consignor.current_balance || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Outstanding Payments</p>
                <p className="text-foreground">
                  ${Number(consignor.outstanding_payments || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notes Count</p>
                <p className="text-foreground">{consignor.notes_count}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground">Add Note</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Textarea
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-20"
                />
                <Button
                  onClick={handleAddNote}
                  size="sm"
                  className="w-full sm:w-auto sm:self-end"
                  disabled={addConsignorNote.isPending}
                >
                  {addConsignorNote.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <p className="text-sm font-medium text-foreground">Recent Notes</p>
              {notesQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading notes...</p>
              ) : (notesQuery.data?.data?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">No notes yet.</p>
              ) : (
                notesQuery.data?.data.map((note) => (
                  <div key={String(note.id)} className="rounded-lg border border-border p-3 text-sm">
                    <p className="text-foreground">{note.content}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      By {note.created_by} on {formatDateTime(note.created_at)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <p className="text-sm font-medium text-foreground">Activity Timeline</p>
            {activityQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading activity...</p>
            ) : (activityQuery.data?.data?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">No activity records.</p>
            ) : (
              <div className="space-y-2">
                {activityQuery.data?.data.map((entry) => (
                  <div key={String(entry.id)} className="rounded-lg border border-border p-3 text-sm">
                    <p className="font-medium text-foreground">{entry.event}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDateTime(entry.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="status" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground">Reason (optional)</label>
              <Input
                placeholder="Provide reason for status change"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Button
                variant={consignor.status === "active" ? "default" : "outline"}
                disabled={isStatusUpdating}
                onClick={() => handleStatusUpdate("active")}
              >
                Mark Active
              </Button>
              <Button
                variant={consignor.status === "inactive" ? "default" : "outline"}
                disabled={isStatusUpdating}
                onClick={() => handleStatusUpdate("inactive")}
              >
                Mark Inactive
              </Button>
              <Button
                variant={consignor.status === "suspended" ? "default" : "destructive"}
                disabled={isStatusUpdating}
                onClick={() => handleStatusUpdate("suspended")}
              >
                Suspend
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
