import { useState } from "react";
import { Auction } from "@/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Receipt, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface FinancialsTabProps {
  auction: Auction;
}

interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
}

export default function FinancialsTab({ auction }: FinancialsTabProps) {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: "1", description: "Digital Marketing Campaign", category: "Marketing", amount: 500000, date: "2025-11-20" },
    { id: "2", description: "Venue Rental Fee", category: "Logistics", amount: 1200000, date: "2025-12-01" },
    { id: "3", description: "Catalog Printing", category: "Marketing", amount: 150000, date: "2025-11-25" },
  ]);
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    category: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
  });

  const handleAddExpense = async () => {
    if (!expenseForm.description || !expenseForm.category || !expenseForm.amount) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newExpense: Expense = {
      id: `expense-${Date.now()}`,
      description: expenseForm.description,
      category: expenseForm.category,
      amount: parseFloat(expenseForm.amount),
      date: expenseForm.date,
    };
    setExpenses([...expenses, newExpense]);
    setExpenseForm({ description: "", category: "", amount: "", date: new Date().toISOString().split('T')[0] });
    setIsAddExpenseOpen(false);
    setIsLoading(false);
    toast.success("Expense added successfully", {
      description: `${expenseForm.description} has been added.`,
    });
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight">Financial Management</h2>
      <p className="text-muted-foreground">Manage all financial aspects of the auction, including expenses, revenue, and payouts.</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue (Est.)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{auction.totalBid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Based on current highest bids
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Marketing, logistics, and operational costs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Net Profit (Est.)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{(auction.totalBid - totalExpenses).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Revenue minus expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Expenses Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Expenses Management</CardTitle>
          <Button 
            size="sm" 
            className="gap-2"
            onClick={() => setIsAddExpenseOpen(true)}
            disabled={isLoading}
          >
            <Receipt className="w-4 h-4" />
            Add Expense
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Track all operational costs associated with this auction (e.g., marketing, logistics, venue rental).</p>
          
          {/* Expenses Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length > 0 ? (
                  expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell>₦{expense.amount.toLocaleString()}</TableCell>
                      <TableCell>{expense.date}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            toast.info("Edit expense", {
                              description: `Editing ${expense.description}`,
                            });
                          }}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No expenses recorded yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Expense Dialog */}
      <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription>
              Record a new expense for this auction. This will be included in the financial calculations.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="expense-description">Description *</Label>
              <Input
                id="expense-description"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                placeholder="e.g., Digital Marketing Campaign"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expense-category">Category *</Label>
                <Select
                  value={expenseForm.category}
                  onValueChange={(value) => setExpenseForm({ ...expenseForm, category: value })}
                >
                  <SelectTrigger id="expense-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Logistics">Logistics</SelectItem>
                    <SelectItem value="Venue">Venue</SelectItem>
                    <SelectItem value="Staff">Staff</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-amount">Amount (₦) *</Label>
                <Input
                  id="expense-amount"
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expense-date">Date *</Label>
              <Input
                id="expense-date"
                type="date"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddExpenseOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleAddExpense} disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payout Workflow Structure */}
      <Card>
        <CardHeader>
          <CardTitle>Consignor Payouts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Manage the final settlement and payment to consignors after all bidder payments have been collected.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-success/10 border-success/50">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Ready for Payout</p>
                <p className="text-xl font-semibold text-success">₦{auction.totalBid.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-warning/10 border-warning/50">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Pending Consignor Info</p>
                <p className="text-xl font-semibold text-warning">2 Consignors</p>
              </CardContent>
            </Card>
            <Card className="bg-secondary/50 border-border">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Payouts Made</p>
                <p className="text-xl font-semibold text-foreground">₦0</p>
              </CardContent>
            </Card>
          </div>
          <p className="text-sm text-muted-foreground italic">
            * Payouts are calculated based on total sales minus commission and any applicable fees.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
