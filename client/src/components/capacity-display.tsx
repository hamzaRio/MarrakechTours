import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface CapacityDisplayProps {
  activityId: number;
  date: Date | string;
  className?: string;
}

export function CapacityDisplay({ activityId, date, className = '' }: CapacityDisplayProps) {
  // Convert date to the right format if it's a Date object
  const formattedDate = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
  
  // Fetch capacity information
  const { data: capacityInfo, isLoading, error } = useQuery({
    queryKey: [`/api/capacity/activity/${activityId}/${formattedDate}`],
    enabled: !!activityId && !!formattedDate
  });
  
  // If we're still loading or there's an error, don't show anything
  if (isLoading) {
    return (
      <div className={`flex items-center text-sm ${className}`}>
        <Users className="mr-2 h-4 w-4 text-gray-400" />
        <span className="text-gray-500">Checking availability...</span>
      </div>
    );
  }
  
  if (error || !capacityInfo) {
    return null;
  }
  
  // If there's no capacity limit
  if (!capacityInfo.maxGroupSize) {
    return (
      <div className={`flex items-center text-sm ${className}`}>
        <Users className="mr-2 h-4 w-4 text-green-500" />
        <span className="text-green-600">Spots available</span>
      </div>
    );
  }
  
  // If there are no spots left
  if (capacityInfo.remainingSpots <= 0) {
    return (
      <div className={`flex items-center text-sm ${className}`}>
        <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
        <span className="text-red-600 font-medium">Fully booked</span>
      </div>
    );
  }
  
  // If there are few spots left (less than 20% of capacity)
  const isLimitedAvailability = capacityInfo.remainingSpots <= (capacityInfo.maxGroupSize * 0.2);
  
  if (isLimitedAvailability) {
    return (
      <div className={`flex items-center text-sm ${className}`}>
        <Users className="mr-2 h-4 w-4 text-amber-500" />
        <Badge variant="warning" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
          Only {capacityInfo.remainingSpots} {capacityInfo.remainingSpots === 1 ? 'spot' : 'spots'} left!
        </Badge>
      </div>
    );
  }
  
  // Normal availability
  return (
    <div className={`flex items-center text-sm ${className}`}>
      <Users className="mr-2 h-4 w-4 text-green-500" />
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
        {capacityInfo.remainingSpots} {capacityInfo.remainingSpots === 1 ? 'spot' : 'spots'} available
      </Badge>
    </div>
  );
}

interface CapacityBadgeProps {
  activityId: number;
  date: Date | string;
  compact?: boolean;
}

export function CapacityBadge({ activityId, date, compact = false }: CapacityBadgeProps) {
  // Convert date to the right format if it's a Date object
  const formattedDate = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
  
  // Fetch capacity information
  const { data: capacityInfo, isLoading, error } = useQuery({
    queryKey: [`/api/capacity/activity/${activityId}/${formattedDate}`],
    enabled: !!activityId && !!formattedDate
  });
  
  if (isLoading || error || !capacityInfo) {
    return null;
  }
  
  // If there's no capacity limit
  if (!capacityInfo.maxGroupSize) {
    return null;
  }
  
  // If there are no spots left
  if (capacityInfo.remainingSpots <= 0) {
    return (
      <Badge variant="destructive" className="ml-2">
        {compact ? 'Full' : 'Fully booked'}
      </Badge>
    );
  }
  
  // If there are few spots left (less than 20% of capacity)
  const isLimitedAvailability = capacityInfo.remainingSpots <= (capacityInfo.maxGroupSize * 0.2);
  
  if (isLimitedAvailability) {
    return (
      <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 ml-2">
        {compact ? `${capacityInfo.remainingSpots} left` : `Only ${capacityInfo.remainingSpots} spots left!`}
      </Badge>
    );
  }
  
  return compact ? null : (
    <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100 ml-2">
      {capacityInfo.remainingSpots} available
    </Badge>
  );
}