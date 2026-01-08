import { useState } from "react";
import { Consignor } from "@/data";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Edit2, Trash2, MoreHorizontal, Building } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ConsignorTableProps {
  consignors: Consignor[];
  onViewProfile: (consignor: Consignor) => void;
  onEdit: (consignor: Consignor) => void;
  onDelete: (consignor: Consignor) => void;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

const ITEMS_PER_PAGE = 10;

export function ConsignorTable({
  consignors,
  onViewProfile,
  onEdit,
  onDelete,
  selectedIds,
  onSelectionChange,
}: ConsignorTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(consignors.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedConsignors = consignors.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(new Set(paginatedConsignors.map((c) => c.id)));
    } else {
      onSelectionChange(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelection = new Set(selectedIds);
    if (checked) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    onSelectionChange(newSelection);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-50 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "suspended":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      verified: "bg-blue-50 text-blue-700",
      "high-value": "bg-purple-50 text-purple-700",
      new: "bg-green-50 text-green-700",
      "top-seller": "bg-amber-50 text-amber-700",
    };
    return colors[tag] || "bg-gray-50 text-gray-700";
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b border-border sticky top-0">
              <th className="w-12 px-4 py-3">
                <Checkbox
                  checked={
                    paginatedConsignors.length > 0 &&
                    paginatedConsignors.every((c) => selectedIds.has(c.id))
                  }
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                Consignor
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                Contact
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                Items
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                Total Value
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                Commission
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedConsignors.map((consignor, idx) => (
              <tr
                key={consignor.id}
                className={`border-b border-border hover:bg-muted/30 transition-colors ${
                  idx % 2 === 0 ? "bg-white" : "bg-muted/10"
                }`}
              >
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selectedIds.has(consignor.id)}
                    onCheckedChange={(checked) =>
                      handleSelectOne(consignor.id, checked as boolean)
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={consignor.avatar} />
                      <AvatarFallback><Building size={24} className="text-gray-500"/></AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {consignor.companyName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {consignor.contactName}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm">
                    <p className="text-foreground">{consignor.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {consignor.phone}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-foreground">
                  {consignor.itemsCount}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">
                  ${(consignor.totalValue / 1000000).toFixed(2)}M
                </td>
                <td className="px-4 py-3 text-sm text-foreground">
                  {consignor.commission}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        consignor.status
                      )}`}
                    >
                      {consignor.status.charAt(0).toUpperCase() +
                        consignor.status.slice(1)}
                    </span>
                    {consignor.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${getTagColor(
                          tag
                        )}`}
                      >
                        {tag === "high-value"
                          ? "High Value"
                          : tag.charAt(0).toUpperCase() + tag.slice(1)}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewProfile(consignor)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(consignor)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(consignor)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to{" "}
          {Math.min(startIndex + ITEMS_PER_PAGE, consignors.length)} of{" "}
          {consignors.length} consignors
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Select
            value={currentPage.toString()}
            onValueChange={(val) => setCurrentPage(parseInt(val))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <SelectItem key={page} value={page.toString()}>
                    {page}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages, p + 1))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
