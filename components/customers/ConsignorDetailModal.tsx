import { Consignor, ConsignorNote } from "@/data";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Building, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ConsignorDetailModalProps {
  consignor: Consignor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConsignorDetailModal({
  consignor,
  open,
  onOpenChange,
}: ConsignorDetailModalProps) {
  const [notes, setNotes] = useState<ConsignorNote[]>(consignor?.notes || []);
  const [newNote, setNewNote] = useState("");

  if (!consignor) return null;

  const handleAddNote = () => {
    if (newNote.trim()) {
      const note: ConsignorNote = {
        id: `note-${Date.now()}`,
        text: newNote,
        createdAt: new Date(),
        createdBy: "Current User",
      };
      setNotes([note, ...notes]);
      setNewNote("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={consignor.avatar} />
              <AvatarFallback><Building size={24} className="text-gray-500"/></AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{consignor.companyName}</p>
              <p className="text-sm text-muted-foreground">
                {consignor.contactName}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="payout">Payout</TabsTrigger>
            <TabsTrigger value="verification">KYC</TabsTrigger>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <p className="text-foreground">{consignor.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Phone
                </label>
                <p className="text-foreground">{consignor.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Join Date
                </label>
                <p className="text-foreground">
                  {consignor.joinDate.toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <p className="text-foreground capitalize">{consignor.status}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Commission
                </label>
                <p className="text-foreground">{consignor.commission}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Account Manager
                </label>
                <p className="text-foreground">{consignor.manager || "Unassigned"}</p>
              </div>
            </div>
          </TabsContent>

          {/* Payout Tab */}
          <TabsContent value="payout" className="space-y-4">
            {consignor.bankAccount ? (
              <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Account Holder
                  </label>
                  <p className="text-foreground">
                    {consignor.bankAccount.accountHolder}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Account Number
                  </label>
                  <p className="text-foreground font-mono">
                    {consignor.bankAccount.accountNumber}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Routing Number
                  </label>
                  <p className="text-foreground font-mono">
                    {consignor.bankAccount.routingNumber}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Bank Name
                  </label>
                  <p className="text-foreground">{consignor.bankAccount.bankName}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No payout information on file.</p>
            )}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Current Balance
                </label>
                <p className="text-lg font-semibold text-foreground">
                  ${consignor.currentBalance.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Outstanding Payments
                </label>
                <p className="text-lg font-semibold text-red-600">
                  ${consignor.outstandingPayments.toLocaleString()}
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification" className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  KYC Status
                </label>
                <p className="text-foreground capitalize mt-1">
                  {consignor.kycStatus.replace("-", " ")}
                </p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>
                KYC verification documents are required for all consignors. Status
                updates will be reflected here.
              </p>
            </div>
          </TabsContent>

          {/* Items Tab */}
          <TabsContent value="items" className="space-y-4">
            {consignor.items.length > 0 ? (
              <div className="space-y-2">
                {consignor.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          ${item.value.toLocaleString()}
                        </p>
                        <p className="text-xs capitalize text-muted-foreground">
                          {item.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No items consigned yet.</p>
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            {consignor.payments.length > 0 ? (
              <div className="space-y-2">
                {consignor.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-3 border border-border rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-foreground">
                          {payment.method}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payment.date.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          ${payment.amount.toLocaleString()}
                        </p>
                        <p className="text-xs capitalize text-muted-foreground">
                          {payment.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No payment history.</p>
            )}
          </TabsContent>

          {/* Activity Tab - Notes */}
          <TabsContent value="activity" className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Add Note
                </label>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a private note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="min-h-20"
                  />
                  <Button
                    onClick={handleAddNote}
                    size="sm"
                    className="self-end"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {notes.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-border">
                  <p className="text-sm font-medium text-foreground">Notes</p>
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 bg-muted/30 rounded-lg text-sm"
                    >
                      <p className="text-foreground">{note.text}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {note.createdBy} •{" "}
                        {note.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
