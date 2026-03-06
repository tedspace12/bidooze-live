"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Clock3 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DateTimePickerProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  placeholder?: string;
  clearable?: boolean;
  className?: string;
}

const pad = (value: number) => String(value).padStart(2, "0");

const toLocalDateTimeString = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

const fromLocalDateTimeString = (value?: string): Date | null => {
  if (!value) return null;
  const [datePart, timePart = "00:00"] = value.split("T");
  if (!datePart) return null;

  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);

  if (!year || !month || !day) return null;

  const parsed = new Date(year, month - 1, day, hours || 0, minutes || 0, 0, 0);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export function DateTimePicker({
  label,
  value,
  onChange,
  hint,
  error,
  placeholder = "Select date and time",
  clearable = true,
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);

  const selectedDateTime = useMemo(() => fromLocalDateTimeString(value), [value]);
  const hourValue = selectedDateTime ? pad(selectedDateTime.getHours()) : "00";
  const minuteValue = selectedDateTime ? pad(selectedDateTime.getMinutes()) : "00";

  const dateDisplay = selectedDateTime ? format(selectedDateTime, "PPP p") : placeholder;

  const handleDateChange = (nextDate: Date | undefined) => {
    if (!nextDate) return;
    const base = selectedDateTime ? new Date(selectedDateTime) : new Date();
    base.setFullYear(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());
    onChange(toLocalDateTimeString(base));
  };

  const handleHourChange = (nextHour: string) => {
    const base = selectedDateTime ? new Date(selectedDateTime) : new Date();
    base.setHours(Number(nextHour), base.getMinutes(), 0, 0);
    onChange(toLocalDateTimeString(base));
  };

  const handleMinuteChange = (nextMinute: string) => {
    const base = selectedDateTime ? new Date(selectedDateTime) : new Date();
    base.setHours(base.getHours(), Number(nextMinute), 0, 0);
    onChange(toLocalDateTimeString(base));
    setOpen(false);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-9 w-full px-3 justify-start text-left font-normal text-base md:text-sm",
              !selectedDateTime && "text-muted-foreground",
              error && "border-destructive focus-visible:border-destructive",
              className
            )}
          >
            <span className="truncate pr-2">{dateDisplay}</span>
            <CalendarDays className="ml-auto h-4 w-4 opacity-60 shrink-0" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-auto min-w-0 max-w-[calc(100vw-1rem)] p-0"
        >
          <div className="p-2.5 space-y-2.5">
            <Calendar
              mode="single"
              selected={selectedDateTime ?? undefined}
              onSelect={handleDateChange}
              numberOfMonths={1}
              className="[--cell-size:--spacing(7)]"
            />

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground uppercase tracking-wide inline-flex items-center gap-1">
                  <Clock3 className="h-3 w-3" />
                  Hour
                </label>
                <Select value={hourValue} onValueChange={handleHourChange}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="HH" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => pad(i)).map((hour) => (
                      <SelectItem key={hour} value={hour}>
                        {hour}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground uppercase tracking-wide">Minute</label>
                <Select value={minuteValue} onValueChange={handleMinuteChange}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 60 }, (_, i) => pad(i)).map((minute) => (
                      <SelectItem key={minute} value={minute}>
                        {minute}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {clearable && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                  className="text-muted-foreground"
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
