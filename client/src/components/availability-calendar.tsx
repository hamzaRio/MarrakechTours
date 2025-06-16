import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays, addMonths, isBefore, isToday, startOfMonth } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { AvailabilityStatus, ActivityAvailability } from "@shared/schema";

interface AvailabilityCalendarProps {
  onDateSelect?: (date: Date) => void;
  className?: string;
  buttonVariant?: "outline" | "default" | "ghost";
  buttonSize?: "sm" | "default" | "lg";
  activityId?: number;
}

export default function AvailabilityCalendar({
  onDateSelect,
  className,
  buttonVariant = "outline",
  buttonSize = "sm",
  activityId
}: AvailabilityCalendarProps) {
  const today = new Date();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(format(today, 'yyyy-MM'));
  
  // Get the availability for the current month for a specific activity
  const { data: activityAvailability, isLoading } = useQuery<ActivityAvailability[]>({
    queryKey: ['/api/availability/activity', activityId, currentMonth],
    queryFn: () => activityId ? 
      fetch(`/api/availability/activity/${activityId}/${currentMonth}`).then(res => res.json()) : 
      Promise.resolve([]),
    enabled: !!activityId,
  });
  
  // If no specific activity is provided, get general availability for today
  const todayFormatted = format(today, 'yyyy-MM-dd');
  const { data: generalAvailability } = useQuery<ActivityAvailability[]>({
    queryKey: ['/api/availability/date', todayFormatted],
    queryFn: () => fetch(`/api/availability/date/${todayFormatted}`).then(res => res.json()),
    enabled: !activityId,
  });
  
  // When the calendar month changes, update the query
  const handleMonthChange = (date: Date) => {
    setCurrentMonth(format(date, 'yyyy-MM'));
  };

  // Helper to check if a date has limited availability
  const hasLimitedAvailability = (date: Date) => {
    if (!activityId || !activityAvailability) {
      // Fallback to some demo data if we don't have real data yet
      return [2, 4, 10, 16, 22, 28].includes(date.getDate());
    }
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayAvailability = activityAvailability.find(a => a.date === dateStr);
    
    return dayAvailability?.status === AvailabilityStatus.LIMITED;
  };

  // Helper to check if a date is unavailable
  const isUnavailable = (date: Date) => {
    if (!activityId || !activityAvailability) {
      // Fallback to some demo data if we don't have real data yet
      return [1, 5, 7, 13, 19, 25].includes(date.getDate());
    }
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayAvailability = activityAvailability.find(a => a.date === dateStr);
    
    return dayAvailability?.status === AvailabilityStatus.UNAVAILABLE;
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
          {isLoading ? (
            <div className="p-8 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-moroccan-gold animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-3 w-3 rounded-full bg-moroccan-red animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-3 w-3 rounded-full bg-moroccan-brown animate-bounce"></div>
              </div>
            </div>
          ) : (
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelect}
              onMonthChange={handleMonthChange}
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
          )}
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