import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { MessagesSquare, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationStats {
  totalMessagesSent: number;
  totalMessagesFailed: number;
  totalBookings: number;
  lastSentAt: string | null;
  messagesPerAdmin: {
    [adminName: string]: {
      sent: number;
      failed: number;
    };
  };
}

export default function NotificationStats() {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: stats, isLoading, error, refetch } = useQuery<NotificationStats>({
    queryKey: ['/api/admin/notification-stats'],
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: 'Stats Refreshed',
        description: 'Notification statistics have been updated',
      });
    } catch (error) {
      toast({
        title: 'Refresh Failed',
        description: 'Could not refresh notification statistics',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatLastSent = (dateString: string | null) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      return `${formatDistanceToNow(date)} ago`;
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessagesSquare className="h-5 w-5" />
            <span>WhatsApp Notification Stats</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-6">
            <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-gray-900 rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessagesSquare className="h-5 w-5" />
            <span>WhatsApp Notification Stats</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4 text-red-600">
            <p>Failed to load notification statistics</p>
            <Button onClick={handleRefresh} variant="outline" className="mt-2">Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MessagesSquare className="h-5 w-5" />
          <span>WhatsApp Notification Stats</span>
        </CardTitle>
        <Button 
          onClick={handleRefresh} 
          size="sm" 
          variant="ghost" 
          disabled={isRefreshing}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh</span>
        </Button>
      </CardHeader>
      
      <CardContent>
        {!stats ? (
          <p className="text-center text-muted-foreground">No data available</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Total Bookings</div>
                <div className="mt-1 text-3xl font-semibold">{stats.totalBookings}</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Messages Sent</div>
                <div className="mt-1 text-3xl font-semibold text-green-600">{stats.totalMessagesSent}</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Messages Failed</div>
                <div className="mt-1 text-3xl font-semibold text-red-600">{stats.totalMessagesFailed}</div>
              </div>
            </div>
            
            <div className="pt-4">
              <h3 className="text-sm font-medium mb-2">Admin Stats</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(stats.messagesPerAdmin).map(([admin, data]) => (
                  <div key={admin} className="border rounded-lg p-3">
                    <div className="font-medium capitalize mb-1">{admin}</div>
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-1" /> 
                      <span className="mr-2">{data.sent} sent</span>
                      <XCircle className="h-4 w-4 text-red-600 mr-1" /> 
                      <span>{data.failed} failed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-2 text-sm text-gray-500">
              <p>Last message sent: {formatLastSent(stats.lastSentAt)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}