import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays, isBefore, isToday } from "date-fns";

interface AvailabilityCalendarProps {
  onDateSelect?: (date: Date) => void;
  className?: string;
  buttonVariant?: "outline" | "default" | "ghost";
  buttonSize?: "sm" | "default" | "lg";
}

export default function AvailabilityCalendar({
  onDateSelect,
  className,
  buttonVariant = "outline",
  buttonSize = "sm"
}: AvailabilityCalendarProps) {
  const today = new Date();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [open, setOpen] = useState(false);

  // Simulate dates with limited availability
  const limitedAvailabilityDates = [
    addDays(today, 2),
    addDays(today, 4),
    addDays(today, 10),
  ];

  // Simulate dates with no availability
  const unavailableDates = [
    addDays(today, 1),
    addDays(today, 5),
    addDays(today, 7),
  ];

  // Helper to check if a date has limited availability
  const hasLimitedAvailability = (date: Date) => {
    return limitedAvailabilityDates.some(
      (d) => format(d, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
  };

  // Helper to check if a date is unavailable
  const isUnavailable = (date: Date) => {
    return unavailableDates.some(
      (d) => format(d, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );
  };

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      setDate(date);
      setOpen(false);
      if (onDateSelect) {
        onDateSelect(date);
      }
    }
  };

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={buttonVariant}
            size={buttonSize}
            className={cn(
              "w-full justify-between text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <span className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {date ? format(date, "MMMM d, yyyy") : "Check tour availability"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
            disabled={(date) => 
              isBefore(date, today) && !isToday(date) || isUnavailable(date)
            }
            modifiers={{
              limited: (date) => hasLimitedAvailability(date),
            }}
            modifiersClassNames={{
              limited: "limited-availability",
            }}
            className="availability-calendar"
          />
          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center gap-6 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <span>Limited</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-gray-300"></div>
                <span>Unavailable</span>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}