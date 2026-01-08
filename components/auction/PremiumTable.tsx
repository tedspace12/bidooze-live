import { cn } from "@/lib/utils";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface PremiumTableProps<T> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  onRowClick?: (item: T) => void;
}

export function PremiumTable<T extends { id?: string | number }>({ 
  columns, 
  data, 
  className,
  onRowClick 
}: PremiumTableProps<T>) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border border-border", className)}>
      <table className="premium-table">
        <thead>
          <tr className="bg-accent/30">
            {columns.map((column) => (
              <th key={String(column.key)} className={column.className}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr 
              key={item.id ?? index}
              onClick={() => onRowClick?.(item)}
              className={cn(onRowClick && "cursor-pointer")}
            >
              {columns.map((column) => (
                <td key={String(column.key)} className={column.className}>
                  {column.render 
                    ? column.render(item) 
                    : String(item[column.key as keyof T] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          No data available
        </div>
      )}
    </div>
  );
}
