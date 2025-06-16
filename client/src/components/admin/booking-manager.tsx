import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Activity } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  FileDown, 
  Filter, 
  MessageSquare, 
  Search, 
  Calendar as CalendarIcon, 
  RefreshCw, 
  X,
  Building2
} from 'lucide-react';

// Extended booking type to handle both memory storage and MongoDB formats
interface ExtendedBooking {
  id: number;
  name?: string;
  fullName?: string;
  date?: string;
  preferredDate?: string;
  phone?: string;
  phoneNumber?: string;
  activityId?: number;
  selectedActivity?: string;
  people?: number;
  numberOfPeople?: number;
  notes?: string | null;
  status?: string | null;
  createdAt?: Date | null;
  crmReference?: string | null;
}

interface BookingManagerProps {
  className?: string;
}

export default function BookingManager({ className }: BookingManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [nameFilter, setNameFilter] = useState('');
  const [activityFilter, setActivityFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  
  // Get all bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery<ExtendedBooking[]>({
    queryKey: ['/api/bookings'],
  });
  
  // Get all activities (for filter dropdown)
  const { data: activities } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
  });
  
  // Mutation for resending WhatsApp notifications
  const resendMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      return apiRequest(`/api/bookings/${bookingId}/resend-whatsapp`, 'POST');
    },
    onSuccess: () => {
      toast({
        title: 'Notification Sent',
        description: 'WhatsApp notification was successfully resent',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to Resend',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    },
  });
  
  // Mutation for updating booking status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: number, status: string }) => {
      return apiRequest(`/api/bookings/${bookingId}/status`, 'PATCH', { status });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: 'Status Updated',
        description: data && data.message ? data.message : 'Booking status has been updated',
      });
    },
    onError: (error) => {
      toast({
        title: 'Status Update Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    },
  });
  
  // Mutation for syncing booking with CRM
  const crmSyncMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      return apiRequest(`/api/bookings/${bookingId}/sync-crm`, 'POST');
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: 'CRM Sync Successful',
        description: data && data.message ? data.message : 'Booking has been synced with CRM',
      });
    },
    onError: (error) => {
      toast({
        title: 'CRM Sync Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    },
  });
  
  // Export bookings to CSV
  const exportToCSV = () => {
    if (!filteredBookings || filteredBookings.length === 0) {
      toast({
        title: 'No Data to Export',
        description: 'There are no bookings matching your filters to export',
        variant: 'destructive',
      });
      return;
    }
    
    const headers = ['ID', 'Name', 'Phone', 'Activity', 'Date', 'People', 'Status', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...filteredBookings.map(b => [
        b.id,
        `"${b.fullName || b.name}"`, // Handle both fullName and name properties
        `"${b.phoneNumber || b.phone}"`, // Handle both properties
        `"${b.selectedActivity || activities?.find(a => a.id === b.activityId)?.title || 'Unknown'}"`,
        `"${typeof b.preferredDate === 'string' ? b.preferredDate : 
           typeof b.date === 'string' ? b.date : 
           'Unknown'}"`,
        b.numberOfPeople || 1,
        `"${b.status || 'pending'}"`,
        `"${(b.notes || '').replace(/"/g, '""')}"` // Escape quotes in CSV
      ].join(','))
    ].join('\\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bookings-export-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Export Complete',
      description: `${filteredBookings.length} bookings exported to CSV`,
    });
  };
  
  // Handle resending WhatsApp notification
  const handleResendWhatsApp = (bookingId: number) => {
    resendMutation.mutate(bookingId);
  };
  
  // Handle syncing booking with CRM
  const handleCrmSync = (bookingId: number) => {
    crmSyncMutation.mutate(bookingId);
  };
  
  // Handle updating booking status
  const handleStatusUpdate = (bookingId: number, newStatus: string) => {
    updateStatusMutation.mutate({ bookingId, status: newStatus });
  };
  
  // Reset all filters
  const resetFilters = () => {
    setNameFilter('');
    setActivityFilter('');
    setDateFilter(undefined);
  };
  
  // Apply filters to bookings
  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    
    return bookings.filter(booking => {
      const nameMatch = nameFilter 
        ? (booking.fullName || booking.name || '').toLowerCase().includes(nameFilter.toLowerCase())
        : true;
      
      const activityMatch = activityFilter 
        ? (booking.selectedActivity === activityFilter || 
           (booking.activityId !== undefined && booking.activityId.toString() === activityFilter))
        : true;
      
      const bookingDate = booking.preferredDate 
        ? new Date(booking.preferredDate) 
        : booking.date 
        ? new Date(booking.date)
        : null;
      
      const dateMatch = dateFilter && bookingDate
        ? bookingDate.toDateString() === dateFilter.toDateString()
        : !dateFilter;
      
      return nameMatch && activityMatch && dateMatch;
    });
  }, [bookings, nameFilter, activityFilter, dateFilter]);
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <CardTitle>Booking Management</CardTitle>
            <CardDescription>
              View and manage all tour bookings
            </CardDescription>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              variant={showFilters ? "secondary" : "outline"} 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-1" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
            
            <Button 
              size="sm" 
              variant="outline" 
              onClick={exportToCSV}
            >
              <FileDown className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Filters */}
        {showFilters && (
          <div className="bg-muted/50 p-3 rounded-md mb-4">
            <div className="flex flex-col sm:flex-row gap-3 mb-2">
              <div className="flex-1">
                <div className="text-sm font-medium mb-1">Customer Name</div>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name..."
                    className="pl-8"
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="text-sm font-medium mb-1">Activity</div>
                <Select 
                  value={activityFilter} 
                  onValueChange={setActivityFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Activities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Activities</SelectItem>
                    {activities?.map((activity) => (
                      <SelectItem key={activity.id} value={activity.id.toString()}>
                        {activity.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <div className="text-sm font-medium mb-1">Booking Date</div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFilter ? format(dateFilter, 'PPP') : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFilter}
                      onSelect={setDateFilter}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button size="sm" variant="ghost" onClick={resetFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear Filters
              </Button>
            </div>
          </div>
        )}
        
        {/* Bookings Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">People</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookingsLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex justify-center">
                      <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredBookings && filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="font-medium">{booking.fullName || booking.name}</div>
                      <div className="text-sm text-muted-foreground">{booking.phoneNumber || booking.phone}</div>
                    </TableCell>
                    <TableCell>
                      {booking.selectedActivity || 
                        activities?.find(a => a.id === booking.activityId)?.title || 
                        'Unknown'}
                    </TableCell>
                    <TableCell>
                      {typeof booking.preferredDate === 'string' 
                        ? format(new Date(booking.preferredDate), 'MMM d, yyyy')
                        : typeof booking.date === 'string'
                        ? format(new Date(booking.date), 'MMM d, yyyy')
                        : 'Unknown date'}
                    </TableCell>
                    <TableCell className="text-center">
                      {booking.numberOfPeople || 1}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-wrap justify-center items-center gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Badge 
                              className={`cursor-pointer ${
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                                booking.status === 'cancelled' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                                'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              }`} 
                              variant={
                                booking.status === 'confirmed' ? 'outline' :
                                booking.status === 'cancelled' ? 'destructive' :
                                'outline'
                              }
                            >
                              {updateStatusMutation.isPending && 
                               updateStatusMutation.variables?.bookingId === booking.id ? (
                                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                              ) : null}
                              {booking.status || 'pending'}
                            </Badge>
                          </PopoverTrigger>
                          <PopoverContent className="w-40 p-1">
                            <div className="flex flex-col gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className={`justify-start text-xs ${booking.status === 'pending' ? 'bg-muted' : ''}`}
                                disabled={booking.status === 'pending' || updateStatusMutation.isPending}
                                onClick={() => handleStatusUpdate(booking.id, 'pending')}
                              >
                                ⏳ Pending
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className={`justify-start text-xs ${booking.status === 'confirmed' ? 'bg-muted' : ''}`}
                                disabled={booking.status === 'confirmed' || updateStatusMutation.isPending}
                                onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                              >
                                ✅ Confirmed
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className={`justify-start text-xs ${booking.status === 'cancelled' ? 'bg-muted' : ''}`}
                                disabled={booking.status === 'cancelled' || updateStatusMutation.isPending}
                                onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                              >
                                ❌ Cancelled
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                        
                        {booking.crmReference && (
                          <Badge variant="outline" className="bg-slate-100 border-slate-200">
                            <Building2 className="h-3 w-3 mr-1" />
                            <span className="text-xs">CRM</span>
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResendWhatsApp(booking.id)}
                          disabled={resendMutation.isPending && resendMutation.variables === booking.id}
                        >
                          {resendMutation.isPending && resendMutation.variables === booking.id ? (
                            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <MessageSquare className="h-4 w-4 mr-1" />
                          )}
                          <span className="hidden sm:inline">Resend WhatsApp</span>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCrmSync(booking.id)}
                          disabled={crmSyncMutation.isPending && crmSyncMutation.variables === booking.id}
                        >
                          {crmSyncMutation.isPending && crmSyncMutation.variables === booking.id ? (
                            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Building2 className="h-4 w-4 mr-1" />
                          )}
                          <span className="hidden sm:inline">Sync CRM</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No bookings found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Results Summary */}
        <div className="text-sm text-muted-foreground mt-4">
          {filteredBookings && filteredBookings.length > 0
            ? `Showing ${filteredBookings.length} of ${bookings?.length || 0} bookings`
            : bookings && bookings.length > 0
            ? 'No bookings match your filters'
            : 'No bookings available'}
        </div>
      </CardContent>
    </Card>
  );
}