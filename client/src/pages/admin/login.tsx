import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { user, isLoading, loginMutation } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  // Redirect to dashboard if user is already logged in
  if (user) {
    return <Redirect to="/admin/dashboard" />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Form section */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>
              Sign in to access the administration panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Remember me for 30 days</FormLabel>
                        <FormDescription>
                          Stay signed in on this device
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="link" className="px-0" onClick={() => window.history.back()}>
              Return to website
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Hero section */}
      <div className="flex-1 bg-primary p-8 flex flex-col justify-center items-center text-primary-foreground">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-6">MarrakechDeserts Admin</h1>
          <p className="text-xl mb-8">
            Welcome to the administration panel for MarrakechDeserts tour booking system. Manage activities, bookings, and site content from this central dashboard.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-primary-foreground/10 p-2 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                  <path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Booking Management</h3>
                <p className="text-primary-foreground/70">View and manage customer bookings</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-primary-foreground/10 p-2 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                  <path d="M2 9V5c0-1.1.9-2 2-2h4"></path><path d="M9 2h6c1.1 0 2 .9 2 2v4"></path><path d="M13 15v5c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-6c0-1.1.9-2 2-2h6"></path><path d="M22 15v5c0 1.1-.9 2-2 2h-6"></path><path d="M19 2v10c0 1.1-.9 2-2 2H2"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Activity Management</h3>
                <p className="text-primary-foreground/70">Add, edit, and remove tour activities</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-primary-foreground/10 p-2 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                  <path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Analytics Dashboard</h3>
                <p className="text-primary-foreground/70">Monitor performance and trends</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}