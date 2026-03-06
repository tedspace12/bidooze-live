"use client";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

export function DateRangeFilter({
  value,
  onChange,
}: {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
}) {
  const isMobile = useIsMobile();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-left font-normal text-base md:text-sm"
        >
          <span className="truncate pr-2">
            {value?.from ? (
              value.to ? (
                `${format(value.from, "LLL dd, y")} - ${format(value.to, "LLL dd, y")}`
              ) : (
                format(value.from, "LLL dd, y")
              )
            ) : (
              <span className="text-slate-500">Select date range</span>
            )}
          </span>
          <CalendarDays className="w-4 h-4 opacity-60" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto max-w-[calc(100vw-1.5rem)] p-0">
        <Calendar
          mode="range"
          numberOfMonths={isMobile ? 1 : 2}
          selected={value}
          onSelect={onChange}
        />
      </PopoverContent>
    </Popover>
  );
}
