import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/navbar";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Activity, Booking } from "@shared/schema";
import { CalendarCheck, BookCheck, ClipboardList, Eye, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isAuthenticated, navigate]);

  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const { data: bookings } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    enabled: isAuthenticated,
  });

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate("/admin/login");
  };

  // Quick stats
  const totalActivities = activities?.length || 0;
  const totalBookings = bookings?.length || 0;
  const pendingBookings = bookings?.filter(b => b.status === "pending").length || 0;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - MarrakechDeserts</title>
      </Helmet>
      
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, <strong>{user?.username}</strong> ({user?.role})</span>
            <Button onClick={handleLogout} variant="destructive">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Total Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalActivities}</p>
              <Button 
                onClick={() => navigate("/admin/activities")} 
                variant="link" 
                className="p-0 h-auto mt-2 text-moroccan-brown"
              >
                Manage Activities
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalBookings}</p>
              <Button 
                onClick={() => navigate("/admin/bookings")} 
                variant="link" 
                className="p-0 h-auto mt-2 text-moroccan-brown"
              >
                View All Bookings
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Pending Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{pendingBookings}</p>
              <Button 
                onClick={() => navigate("/admin/bookings?status=pending")} 
                variant="link" 
                className="p-0 h-auto mt-2 text-moroccan-brown"
              >
                Review Pending
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={() => navigate("/admin/activities")} className="w-full bg-moroccan-brown">
                <CalendarCheck className="mr-2 h-4 w-4" /> Manage Activities
              </Button>
              <Button onClick={() => navigate("/admin/bookings")} className="w-full bg-moroccan-brown">
                <BookCheck className="mr-2 h-4 w-4" /> Manage Bookings
              </Button>
              {user?.role === "superadmin" && (
                <Button onClick={() => navigate("/admin/audit-logs")} className="w-full bg-moroccan-gold">
                  <ClipboardList className="mr-2 h-4 w-4" /> View Audit Logs
                </Button>
              )}
              <Button onClick={() => navigate("/")} variant="outline" className="w-full">
                <Eye className="mr-2 h-4 w-4" /> View Website
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {bookings && bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{booking.name}</p>
                        <p className="text-sm text-gray-500">
                          Activity ID: {booking.activityId} • {booking.date}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        booking.status === "confirmed" ? "bg-green-100 text-green-800" :
                        booking.status === "cancelled" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No bookings available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
