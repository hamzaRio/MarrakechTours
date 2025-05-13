import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays, isAfter, parseISO } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Activity } from '@shared/schema';
import { Users, CalendarDays, DollarSign, TrendingUp } from 'lucide-react';

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
  price?: number;
  notes?: string | null;
  status?: string | null;
  createdAt?: Date | null;
}

interface BookingAnalyticsProps {
  className?: string;
}

// Chart colors
const COLORS = [
  '#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d',
  '#a4de6c', '#d0ed57', '#ffc658', '#ff8042',
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042'
];

export default function BookingAnalytics({ className }: BookingAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days'>('30days');

  // Fetch all bookings
  const { data: bookings, isLoading: isLoadingBookings } = useQuery<ExtendedBooking[]>({
    queryKey: ['/api/bookings'],
  });

  // Fetch all activities
  const { data: activities, isLoading: isLoadingActivities } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
  });

  // Calculate date range for the selected time period
  const dateFrom = useMemo(() => {
    const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
    return subDays(new Date(), days);
  }, [timeRange]);

  // Filter bookings by date range
  const filteredBookings = useMemo(() => {
    if (!bookings) return [];

    return bookings.filter(booking => {
      const bookingDate = parseISO(booking.date || booking.preferredDate || new Date().toISOString());
      return isAfter(bookingDate, dateFrom);
    });
  }, [bookings, dateFrom]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!filteredBookings || !activities) {
      return {
        totalBookings: 0,
        totalRevenue: 0,
        uniqueCustomers: 0,
        averageGroupSize: 0
      };
    }

    // Get unique customer count based on phone numbers
    const phoneSet = new Set<string>();
    filteredBookings.forEach(booking => {
      const phone = booking.phone || booking.phoneNumber;
      if (phone) phoneSet.add(phone);
    });

    // Calculate total revenue
    let totalRevenue = 0;
    let totalPeople = 0;

    filteredBookings.forEach(booking => {
      const people = booking.people || booking.numberOfPeople || 1;
      totalPeople += people;
      
      // Get activity price if available
      const activityId = booking.activityId;
      if (activityId !== undefined && activities) {
        const activity = activities.find(a => a.id === activityId);
        if (activity && activity.price) {
          totalRevenue += activity.price * people;
        }
      }
    });

    return {
      totalBookings: filteredBookings.length,
      totalRevenue,
      uniqueCustomers: phoneSet.size,
      averageGroupSize: filteredBookings.length > 0 ? totalPeople / filteredBookings.length : 0
    };
  }, [filteredBookings, activities]);

  // Prepare data for bookings per day chart
  const bookingsPerDayData = useMemo(() => {
    if (!filteredBookings || filteredBookings.length === 0) return [];

    // Create a map for each day
    const daysMap = new Map<string, number>();
    
    // Initialize days within range
    const today = new Date();
    for (let i = 0; i < (timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90); i++) {
      const day = subDays(today, i);
      const dayStr = format(day, 'yyyy-MM-dd');
      daysMap.set(dayStr, 0);
    }

    // Increment counts for each booking
    filteredBookings.forEach(booking => {
      const date = booking.date || booking.preferredDate;
      if (date) {
        const dayStr = date.split('T')[0]; // Extract YYYY-MM-DD
        if (daysMap.has(dayStr)) {
          daysMap.set(dayStr, (daysMap.get(dayStr) || 0) + 1);
        }
      }
    });

    // Convert map to array and sort by date
    return Array.from(daysMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredBookings, timeRange]);

  // Prepare data for activities pie chart
  const activitiesChartData = useMemo(() => {
    if (!filteredBookings || !activities || filteredBookings.length === 0) {
      return [];
    }

    // Create a map for each activity
    const activityMap = new Map<number, { name: string, count: number }>();
    
    // Initialize activities
    activities.forEach(activity => {
      activityMap.set(activity.id, { name: activity.title, count: 0 });
    });

    // Count bookings per activity
    filteredBookings.forEach(booking => {
      const activityId = booking.activityId;
      if (activityId !== undefined && activityMap.has(activityId)) {
        const current = activityMap.get(activityId);
        if (current) {
          activityMap.set(activityId, { ...current, count: current.count + 1 });
        }
      }
    });

    // Convert map to array, filter out zero counts, and sort by count
    return Array.from(activityMap.values())
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [filteredBookings, activities]);

  // Loading state
  if (isLoadingBookings || isLoadingActivities) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Booking Analytics</CardTitle>
          <CardDescription>Loading analytics data...</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[400px] flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-gray-900 rounded-full"></div>
            <span>Loading statistics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!bookings || bookings.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Booking Analytics</CardTitle>
          <CardDescription>No bookings available to analyze</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">
              There are no bookings in the system yet. Analytics will be available once bookings are made.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Booking Analytics</CardTitle>
            <CardDescription>
              Insights from your booking data
            </CardDescription>
          </div>
          <Tabs 
            defaultValue="30days" 
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as '7days' | '30days' | '90days')}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="7days">7 Days</TabsTrigger>
              <TabsTrigger value="30days">30 Days</TabsTrigger>
              <TabsTrigger value="90days">90 Days</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex flex-row items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <h3 className="text-2xl font-bold">{summaryStats.totalBookings}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-row items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estimated Revenue</p>
                <h3 className="text-2xl font-bold">{summaryStats.totalRevenue.toLocaleString()} MAD</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-row items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unique Customers</p>
                <h3 className="text-2xl font-bold">{summaryStats.uniqueCustomers}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-row items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Group Size</p>
                <h3 className="text-2xl font-bold">{summaryStats.averageGroupSize.toFixed(1)} people</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Line Chart - Bookings Per Day */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-0">
              <CardTitle className="text-base font-medium">Bookings Over Time</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={bookingsPerDayData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(new Date(date), 'MMM d')}
                      tick={{fontSize: 12}} 
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip 
                      formatter={(value) => [Number(value), 'Bookings']}
                      labelFormatter={(date) => format(new Date(date), 'MMMM d, yyyy')}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Bookings"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pie Chart - Activity Distribution */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-0">
              <CardTitle className="text-base font-medium">Popular Activities</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[300px] flex flex-col items-center justify-center">
                {activitiesChartData.length > 0 ? (
                  <div className="w-full h-full flex flex-col md:flex-row items-center">
                    <div className="flex-1 h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={activitiesChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="name"
                            label={({ name, percent }) => 
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {activitiesChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [Number(value), 'Bookings']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="md:w-1/3 p-4">
                      <h4 className="text-sm font-medium mb-2">Top Activities</h4>
                      <div className="space-y-2">
                        {activitiesChartData.slice(0, 5).map((activity, i) => (
                          <div key={i} className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div 
                                className="h-3 w-3 rounded-full mr-2" 
                                style={{ backgroundColor: COLORS[i % COLORS.length] }}
                              />
                              <span className="truncate text-sm">{activity.name}</span>
                            </div>
                            <Badge variant="outline">{activity.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    No activity data available for this period
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}