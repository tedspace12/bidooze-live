import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal, Building, Loader2 } from "lucide-react";
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
import type {
  ConsignorListItem,
  ConsignorStatus,
} from "@/features/customers/services/customerService";

interface ConsignorTableProps {
  consignors: ConsignorListItem[];
  onViewProfile: (consignor: ConsignorListItem) => void;
  onStatusChange: (consignor: ConsignorListItem, status: ConsignorStatus) => void;
  statusUpdatingId?: string | number | null;
}

const ITEMS_PER_PAGE = 10;

export function ConsignorTable({
  consignors,
  onViewProfile,
  onStatusChange,
  statusUpdatingId,
}: ConsignorTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(consignors.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedConsignors = consignors.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const getStatusColor = (status: ConsignorStatus) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200";
      case "inactive":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "suspended":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full table-fixed sm:table-auto">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="px-3 py-3 text-left text-sm font-semibold text-foreground whitespace-nowrap sm:px-4">
                Consignor
              </th>
              <th className="hidden px-4 py-3 text-left text-sm font-semibold text-foreground whitespace-nowrap md:table-cell">
                Contact
              </th>
              <th className="hidden px-4 py-3 text-left text-sm font-semibold text-foreground whitespace-nowrap lg:table-cell">
                Lots
              </th>
              <th className="hidden px-4 py-3 text-left text-sm font-semibold text-foreground whitespace-nowrap xl:table-cell">
                Total Value
              </th>
              <th className="hidden px-4 py-3 text-left text-sm font-semibold text-foreground whitespace-nowrap xl:table-cell">
                Commission
              </th>
              <th className="hidden px-3 py-3 text-left text-sm font-semibold text-foreground whitespace-nowrap sm:table-cell sm:px-4 md:px-4">
                Status
              </th>
              <th className="hidden px-4 py-3 text-left text-sm font-semibold text-foreground whitespace-nowrap lg:table-cell">
                Notes
              </th>
              <th className="w-14 pl-1 pr-3 py-3 text-left text-sm font-semibold text-foreground whitespace-nowrap sm:w-24 sm:px-4">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedConsignors.length === 0 && (
              <tr>
                <td
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                  colSpan={8}
                >
                  No consignors found.
                </td>
              </tr>
            )}
            {paginatedConsignors.map((consignor, idx) => (
              <tr
                key={consignor.id}
                className={`border-b border-border hover:bg-muted/30 transition-colors ${
                  idx % 2 === 0 ? "bg-white" : "bg-muted/10"
                }`}
              >
                <td className="px-3 py-3 sm:px-4">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={undefined} />
                      <AvatarFallback><Building size={20} className="text-gray-500"/></AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground text-sm">
                        {consignor.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground md:hidden">
                        {consignor.email}
                      </p>
                      <p className="truncate text-xs text-muted-foreground md:hidden">
                        {consignor.phone}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1 sm:hidden">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium border ${getStatusColor(
                            consignor.status
                          )}`}
                        >
                          {consignor.status.charAt(0).toUpperCase() + consignor.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <div className="text-sm">
                    <p className="text-foreground">{consignor.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {consignor.phone}
                    </p>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-sm text-foreground lg:table-cell">
                  {consignor.total_lots}
                </td>
                <td className="hidden px-4 py-3 text-sm font-medium text-foreground xl:table-cell">
                  ${Number(consignor.total_value || 0).toLocaleString()}
                </td>
                <td className="hidden px-4 py-3 text-sm text-foreground xl:table-cell">
                  {(Number(consignor.commission_rate || 0) * 100).toFixed(2).replace(/\.00$/, "")}%
                </td>
                <td className="hidden px-3 py-3 sm:table-cell sm:px-4 md:px-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      consignor.status
                    )}`}
                  >
                    {consignor.status.charAt(0).toUpperCase() + consignor.status.slice(1)}
                  </span>
                </td>
                <td className="hidden px-4 py-3 text-sm text-foreground lg:table-cell">
                  {consignor.notes_count}
                </td>
                <td className="pl-1 pr-3 py-3 sm:px-4">
                  <div className="flex items-center justify-end gap-1 sm:justify-start sm:gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewProfile(consignor)}
                      className="hidden h-8 w-8 p-0 sm:inline-flex"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          disabled={statusUpdatingId === consignor.id}
                        >
                          {statusUpdatingId === consignor.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="w-4 h-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewProfile(consignor)} className="sm:hidden">
                          View Profile
                        </DropdownMenuItem>
                        {consignor.status !== "active" && (
                          <DropdownMenuItem onClick={() => onStatusChange(consignor, "active")}>
                            Mark Active
                          </DropdownMenuItem>
                        )}
                        {consignor.status !== "inactive" && (
                          <DropdownMenuItem onClick={() => onStatusChange(consignor, "inactive")}>
                            Mark Inactive
                          </DropdownMenuItem>
                        )}
                        {consignor.status !== "suspended" && (
                          <DropdownMenuItem
                            onClick={() => onStatusChange(consignor, "suspended")}
                            className="text-red-600"
                          >
                            Suspend
                          </DropdownMenuItem>
                        )}
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {consignors.length === 0 ? 0 : startIndex + 1} to{" "}
          {Math.min(startIndex + ITEMS_PER_PAGE, consignors.length)} of{" "}
          {consignors.length} consignors
        </p>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safeCurrentPage === 1}
          >
            Previous
          </Button>
          <Select
            value={safeCurrentPage.toString()}
            onValueChange={(val) => setCurrentPage(parseInt(val))}
          >
            <SelectTrigger className="w-16 sm:w-20">
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
            disabled={safeCurrentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
