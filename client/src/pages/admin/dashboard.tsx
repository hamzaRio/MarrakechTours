import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/navbar";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Activity, Booking } from "@shared/schema";
import { CalendarCheck, BookCheck, ClipboardList, Eye, LogOut, Database, MessageSquare, BarChart, Pencil } from "lucide-react";
import MongoBookings from "@/components/admin/mongo-bookings";
import NotificationStats from "@/components/admin/notification-stats";
import BookingManager from "@/components/admin/booking-manager";
import BookingAnalytics from "@/components/admin/booking-analytics";
import ActivityManager from "@/components/admin/activity-manager";
import CrmStatus from "@/components/admin/crm-status";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [showMongoSection, setShowMongoSection] = useState(false);
  const [isMongoConnected, setIsMongoConnected] = useState(false);
  
  // Check if MongoDB is connected
  useEffect(() => {
    fetch('/api/mongo/status')
      .then(response => {
        setIsMongoConnected(response.ok);
      })
      .catch(() => {
        setIsMongoConnected(false);
      });
  }, []);

  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const { data: bookings } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const handleLogout = () => {
    logoutMutation.mutate();
    navigate("/admin/login");
  };

  // Quick stats
  const totalActivities = activities?.length || 0;
  const totalBookings = bookings?.length || 0;
  const pendingBookings = bookings?.filter(b => b.status === "pending").length || 0;

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
        
        {/* Booking Analytics Dashboard */}
        <div className="mt-8 mb-8">
          <BookingAnalytics />
        </div>
        
        {/* Activity Management */}
        <div className="mt-8 mb-8">
          <ActivityManager />
        </div>
        
        {/* WhatsApp Notification Stats Card */}
        <div className="mt-8 mb-8">
          <NotificationStats />
        </div>
        
        {/* Advanced Booking Manager with timeline, filters and export */}
        <div className="mt-8 mb-8">
          <BookingManager />
        </div>
        
        {/* CRM Status */}
        <div className="mt-8 mb-8">
          <CrmStatus />
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
              <Button 
                onClick={() => setShowMongoSection(!showMongoSection)} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Database className="mr-2 h-4 w-4" /> {showMongoSection ? "Hide MongoDB Data" : "Show MongoDB Data"}
              </Button>
              <Button onClick={() => navigate("/")} variant="outline" className="w-full">
                <Eye className="mr-2 h-4 w-4" /> View Website
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <div className="flex items-center">
                    <Database className="h-5 w-5 mr-2 text-blue-600" />
                    <span className="font-medium">Database Status</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full ${isMongoConnected ? 'bg-green-500' : 'bg-orange-500'} mr-2`}></div>
                    <span className="text-sm">{isMongoConnected ? 'MongoDB Connected' : 'Memory Storage'}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pb-2 border-b">
                  <div className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
                    <span className="font-medium">WhatsApp API</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-orange-500 mr-2"></div>
                    <span className="text-sm">Simulation Mode</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pb-2">
                  <div className="flex items-center">
                    <BookCheck className="h-5 w-5 mr-2 text-moroccan-brown" />
                    <span className="font-medium">Total Bookings</span>
                  </div>
                  <span className="text-lg font-bold">{bookings?.length || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {showMongoSection && isMongoConnected && (
          <div className="mt-8">
            <MongoBookings />
          </div>
        )}
        
        {showMongoSection && !isMongoConnected && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>MongoDB Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">MongoDB Not Connected</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    MongoDB connection is currently unavailable. The application is running with in-memory storage.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
