import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import { Helmet } from "react-helmet";
import { Booking, Activity } from "@shared/schema";
import { Trash2, Edit, Search, RefreshCw } from "lucide-react";
import { formatDate, getActivityNameById } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function AdminBookings() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [formData, setFormData] = useState({
    status: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isAuthenticated, navigate]);

  // Get URL search params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    if (status) {
      setStatusFilter(status);
    }
  }, []);

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    enabled: isAuthenticated,
  });

  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
    enabled: isAuthenticated,
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; booking: Partial<Booking> }) => {
      return apiRequest("PATCH", `/api/bookings/${data.id}`, data.booking);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setIsEditModalOpen(false);
      toast({
        title: "Success",
        description: "Booking has been updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update booking",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest("DELETE", `/api/bookings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setIsDeleteModalOpen(false);
      toast({
        title: "Success",
        description: "Booking has been deleted",
      });
      setCurrentBooking(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete booking",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleStatusChange = (value: string) => {
    setFormData({
      ...formData,
      status: value,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentBooking) {
      updateMutation.mutate({
        id: currentBooking.id,
        booking: formData,
      });
    }
  };

  const handleDelete = () => {
    if (currentBooking) {
      deleteMutation.mutate(currentBooking.id);
    }
  };

  const openEditModal = (booking: Booking) => {
    setCurrentBooking(booking);
    setFormData({
      status: booking.status || "",
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (booking: Booking) => {
    setCurrentBooking(booking);
    setIsDeleteModalOpen(true);
  };

  const getActivityName = (activityId: number): string => {
    const activity = activities?.find(a => a.id === activityId);
    return activity ? activity.title : getActivityNameById(activityId);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  // Filter bookings based on search term and status filter
  const filteredBookings = bookings?.filter(booking => {
    const searchMatch = searchTerm === "" || 
      booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone.includes(searchTerm);
    
    const statusMatch = statusFilter === null || booking.status === statusFilter;
    
    return searchMatch && statusMatch;
  });

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Manage Bookings - MarrakechDeserts Admin</title>
      </Helmet>
      
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Manage Bookings</h1>
          <Button onClick={() => navigate("/admin/dashboard")} variant="outline">
            Back to Dashboard
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex items-center relative flex-1">
            <Search className="absolute left-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or phone"
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select 
            value={statusFilter || ""} 
            onValueChange={(value) => setStatusFilter(value || null)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm("");
              setStatusFilter(null);
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Reset
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading bookings...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>People</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings && filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{booking.id}</TableCell>
                        <TableCell>{booking.name}</TableCell>
                        <TableCell>{booking.phone}</TableCell>
                        <TableCell>{getActivityName(booking.activityId)}</TableCell>
                        <TableCell>{booking.date}</TableCell>
                        <TableCell>{booking.people}</TableCell>
                        <TableCell>{getStatusBadge(booking.status ?? "pending")}</TableCell>
                        <TableCell>
                          <Button 
                            onClick={() => openEditModal(booking)} 
                            size="sm" 
                            variant="outline" 
                            className="mr-2"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            onClick={() => openDeleteModal(booking)} 
                            size="sm" 
                            variant="destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">No bookings found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        {/* Edit Booking Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Booking Status</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit}>
              <div className="grid gap-4 py-4">
                {currentBooking && (
                  <>
                    <div className="grid gap-2">
                      <p><strong>Name:</strong> {currentBooking.name}</p>
                      <p><strong>Phone:</strong> {currentBooking.phone}</p>
                      <p><strong>Activity:</strong> {getActivityName(currentBooking.activityId)}</p>
                      <p><strong>Date:</strong> {currentBooking.date}</p>
                      <p><strong>People:</strong> {currentBooking.people}</p>
                      <p><strong>Notes:</strong> {currentBooking.notes || "None"}</p>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4 mt-4">
                      <Label htmlFor="status" className="text-right">Status</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={handleStatusChange}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-moroccan-brown">Update</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete the booking for "{currentBooking?.name}"?</p>
            <p className="text-sm text-gray-500">This action cannot be undone.</p>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
