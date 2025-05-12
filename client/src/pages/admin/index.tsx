import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import { Helmet } from "react-helmet";
import { UserCheck, LogIn } from "lucide-react";

export default function AdminIndex() {
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // If authenticated, redirect to dashboard
    if (isAuthenticated && !isLoading) {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <>
      <Helmet>
        <title>Admin Portal - MarrakechDeserts</title>
      </Helmet>
      
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-moroccan-brown rounded-full flex items-center justify-center mb-4">
              <UserCheck className="h-10 w-10 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold mb-2">MarrakechDeserts Admin Portal</h1>
            <p className="text-gray-600 mb-6">
              This area is restricted to authorized personnel only. Please log in to access the admin dashboard.
            </p>
            
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="h-4 w-4 rounded-full bg-moroccan-gold animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-4 w-4 rounded-full bg-moroccan-red animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-4 w-4 rounded-full bg-moroccan-brown animate-bounce"></div>
              </div>
            ) : (
              <div className="space-y-4 w-full">
                <Button 
                  className="w-full bg-moroccan-brown hover:bg-moroccan-gold"
                  onClick={() => navigate("/admin/login")}
                >
                  <LogIn className="mr-2 h-4 w-4" /> Login to Admin
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/")}
                >
                  Return to Website
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
