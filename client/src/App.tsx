import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminActivities from "@/pages/admin/activities";
import AdminBookings from "@/pages/admin/bookings";
import AdminIndex from "@/pages/admin/index";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      
      {/* Admin routes */}
      <Route path="/admin" component={AdminIndex} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/activities" component={AdminActivities} />
      <Route path="/admin/bookings" component={AdminBookings} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
