import { useState } from "react";
import { Plus, Receipt, DollarSign, Calendar, MoreVertical, Trash2 } from "lucide-react";
import { FormSection } from "../FormSection";
import { FormInput } from "../FormInput";
import { FormSelect } from "../FormSelect";
import { FormTextarea } from "../FormTextarea";
import { PremiumButton } from "../PremiumButton";
import { PremiumTable } from "../PremiumTable";
import { cn } from "@/lib/utils";

interface Expense {
  id: number;
  date: string;
  category: string;
  description: string;
  amount: number;
  vendor: string;
}

const mockExpenses: Expense[] = [
  { id: 1, date: "2024-12-01", category: "Marketing", description: "Online advertising campaign", amount: 1500, vendor: "Google Ads" },
  { id: 2, date: "2024-12-03", category: "Photography", description: "Lot photography services", amount: 800, vendor: "Pro Photo Studio" },
  { id: 3, date: "2024-12-05", category: "Insurance", description: "Auction liability insurance", amount: 2500, vendor: "AuctionSafe Insurance" },
  { id: 4, date: "2024-12-07", category: "Venue", description: "Preview venue rental", amount: 1200, vendor: "Grand Hall Events" },
];

export function ExpensesTab() {
  const [showNewExpense, setShowNewExpense] = useState(false);

  const totalExpenses = mockExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const columns = [
    { 
      key: "date", 
      header: "Date",
      className: "w-28",
      render: (item: Expense) => (
        <span className="text-muted-foreground">{new Date(item.date).toLocaleDateString()}</span>
      )
    },
    { 
      key: "category", 
      header: "Category",
      className: "w-32",
      render: (item: Expense) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
          {item.category}
        </span>
      )
    },
    { 
      key: "description", 
      header: "Description",
      render: (item: Expense) => (
        <span className="font-medium text-foreground">{item.description}</span>
      )
    },
    { 
      key: "vendor", 
      header: "Vendor",
      className: "w-40"
    },
    { 
      key: "amount", 
      header: "Amount",
      className: "w-28 text-right",
      render: (item: Expense) => (
        <span className="font-semibold text-foreground">${item.amount.toLocaleString()}</span>
      )
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: () => (
        <button className="p-1 hover:bg-accent rounded-md transition-colors">
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary-muted flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-700" strokeWidth={1.5} />
            </div>
            <div>
              <p className="micro-label">Total Expenses</p>
              <p className="text-xl font-semibold text-foreground">${totalExpenses.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary-muted flex items-center justify-center">
              <Receipt className="h-5 w-5 text-green-700" strokeWidth={1.5} />
            </div>
            <div>
              <p className="micro-label">Number of Entries</p>
              <p className="text-xl font-semibold text-foreground">{mockExpenses.length}</p>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary-muted flex items-center justify-center">
              <Calendar className="h-5 w-5 text-green-700" strokeWidth={1.5} />
            </div>
            <div>
              <p className="micro-label">Latest Entry</p>
              <p className="text-xl font-semibold text-foreground">Dec 7, 2024</p>
            </div>
          </div>
        </div>
      </div>

      {/* New Expense Form */}
      <div className={cn(
        "transition-all duration-300 overflow-hidden",
        showNewExpense ? "opacity-100" : "opacity-0 h-0"
      )}>
        <FormSection 
          title="New Expense" 
          description="Add a new expense to this auction"
          className={showNewExpense ? "animate-in fade-in slide-in-from-bottom-2 duration-300" : ""}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormInput label="Date" type="date" />
            <FormSelect 
              label="Category" 
              options={[
                { value: "marketing", label: "Marketing" },
                { value: "photography", label: "Photography" },
                { value: "insurance", label: "Insurance" },
                { value: "venue", label: "Venue" },
                { value: "shipping", label: "Shipping" },
                { value: "labor", label: "Labor" },
                { value: "other", label: "Other" },
              ]}
            />
            <FormInput label="Amount" type="number" placeholder="0.00" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <FormInput label="Vendor" placeholder="Vendor name" />
            <FormInput label="Invoice/Reference #" placeholder="Optional" />
          </div>
          
          <div className="mt-6">
            <FormTextarea label="Description" placeholder="Describe this expense..." rows={3} />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border">
            <PremiumButton variant="ghost" onClick={() => setShowNewExpense(false)}>
              Cancel
            </PremiumButton>
            <PremiumButton>
              Save Expense
            </PremiumButton>
          </div>
        </FormSection>
      </div>

      {/* Expenses Table */}
      <div className="premium-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Expense Records</h3>
            <p className="text-sm text-muted-foreground">Track all auction-related expenses</p>
          </div>
          <PremiumButton size="sm" onClick={() => setShowNewExpense(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </PremiumButton>
        </div>

        <PremiumTable columns={columns} data={mockExpenses} />
      </div>
    </div>
  );
}
