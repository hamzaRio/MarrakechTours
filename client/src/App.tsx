import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/protected-route";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import ActivityDetailsPage from "@/pages/activity-details";
import PhotoGalleryPage from "@/pages/photo-gallery";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminActivities from "@/pages/admin/activities";
import AdminBookings from "@/pages/admin/bookings";
import AdminAuditLogs from "@/pages/admin/audit-logs";
import AdminIndex from "@/pages/admin/index";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={HomePage} />
      <Route path="/activity/:id" component={ActivityDetailsPage} />
      <Route path="/photos" component={PhotoGalleryPage} />
      <Route path="/admin/login" component={AdminLogin} />
      
      {/* Protected admin routes */}
      <ProtectedRoute 
        path="/admin" 
        component={AdminIndex} 
      />
      <ProtectedRoute 
        path="/admin/dashboard" 
        component={AdminDashboard} 
      />
      <ProtectedRoute 
        path="/admin/activities" 
        component={AdminActivities} 
      />
      <ProtectedRoute 
        path="/admin/bookings" 
        component={AdminBookings} 
      />
      <ProtectedRoute 
        path="/admin/audit-logs" 
        component={AdminAuditLogs} 
        allowedRoles={["superadmin"]} 
      />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
