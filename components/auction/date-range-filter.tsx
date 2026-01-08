"use client";

import * as React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

export function DateRangeFilter({ value, onChange }: {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-left font-normal"
        >
          {value?.from ? (
            value.to ? (
              `${format(value.from, "LLL dd, y")} → ${format(value.to, "LLL dd, y")}`
            ) : (
              format(value.from, "LLL dd, y")
            )
          ) : (
            <span className="text-slate-500">Select date range</span>
          )}

          <CalendarDays className="w-4 h-4 opacity-60" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={value}
          onSelect={onChange}
        />
      </PopoverContent>
    </Popover>
  );
}
