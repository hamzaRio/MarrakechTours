import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Resolver } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { apiRequest } from '@/lib/queryClient';
import {
  Activity,
  activitySchema,
  ActivityFormData,
  ExtendedActivity,
} from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Pencil, Plus, Trash2, Image, Calendar, DollarSign } from 'lucide-react';

interface ActivityManagerProps {
  className?: string;
}

export default function ActivityManager({ className }: ActivityManagerProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ExtendedActivity | null>(null);

  // Fetch activities
  const { data: activities, isLoading } = useQuery<ExtendedActivity[]>({
    queryKey: ['/api/activities'],
  });

  // Form setup
  const form = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      image: '',
      durationHours: undefined,
      includesFood: false,
      includesTransportation: false,
      maxGroupSize: undefined,
    },
  });

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (isAddDialogOpen && !editingActivity) {
      form.reset({
        title: '',
        description: '',
        price: 0,
        image: '',
        durationHours: undefined,
        includesFood: false,
        includesTransportation: false,
        maxGroupSize: undefined,
      });
    } else if (editingActivity) {
      form.reset({
        title: editingActivity.title,
        description: editingActivity.description,
        price: editingActivity.price,
        image: editingActivity.image || '',
        durationHours: editingActivity.durationHours ?? undefined,
        includesFood: editingActivity.includesFood ?? undefined,
        includesTransportation: editingActivity.includesTransportation ?? undefined,
        maxGroupSize: editingActivity.maxGroupSize ?? undefined,
      });
    }
  }, [isAddDialogOpen, editingActivity, form]);

  // Create activity mutation
  const createMutation = useMutation({
    mutationFn: async (data: ActivityFormData) => {
      const response = await apiRequest('/api/activities', 'POST', data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Activity Created',
        description: 'The activity has been created successfully.',
      });
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create activity',
        variant: 'destructive',
      });
    },
  });

  // Update activity mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ActivityFormData }) => {
      const response = await apiRequest(`/api/activities/${id}`, 'PATCH', data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Activity Updated',
        description: 'The activity has been updated successfully.',
      });
      setIsAddDialogOpen(false);
      setEditingActivity(null);
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update activity',
        variant: 'destructive',
      });
    },
  });

  // Delete activity mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/activities/${id}`, 'DELETE');
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Activity Deleted',
        description: 'The activity has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete activity',
        variant: 'destructive',
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: ActivityFormData) => {
    if (editingActivity) {
      updateMutation.mutate({ id: editingActivity.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Prepare to edit an activity
  const handleEdit = (activity: ExtendedActivity) => {
    setEditingActivity(activity);
    setIsAddDialogOpen(true);
  };

  // Handle deleting an activity
  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this activity? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  // Format price for display
  const formatPrice = (price: number, priceType?: string) => {
    return `${price.toLocaleString()} MAD${priceType === 'per_person' ? ' / person' : ''}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Activity Management</CardTitle>
          <CardDescription>Loading activities...</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[200px] flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-gray-900 rounded-full"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <CardTitle>Activity Management</CardTitle>
            <CardDescription>
              Manage tour activities
            </CardDescription>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-2 sm:mt-0">
                <Plus className="h-4 w-4 mr-2" />
                Add Activity
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingActivity ? 'Edit Activity' : 'Add New Activity'}</DialogTitle>
                <DialogDescription>
                  {editingActivity 
                    ? 'Edit the activity details below.'
                    : 'Enter the details for the new activity.'}
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Activity Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Hot Air Balloon Ride" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (MAD)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="number"
                                placeholder="1200"
                                className="pl-8"
                                step="0.01"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detailed description of the activity..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Image className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="https://example.com/image.jpg"
                              className="pl-8"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Provide a URL to an image that represents this activity.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="durationHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (hours)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="number"
                                placeholder="4"
                                className="pl-8"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="maxGroupSize"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Max Group Size</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="number"
                                placeholder="10"
                                className="pl-8 border-amber-300 focus:border-amber-500"
                                {...field}
                              />
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                className="absolute left-2 top-2.5 h-4 w-4 text-amber-600"
                              >
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                              </svg>
                            </div>
                          </FormControl>
                          <FormDescription className="text-amber-700">
                            This field is required for capacity management. It determines the maximum number 
                            of people that can book this activity on a single day.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {(createMutation.isPending || updateMutation.isPending) && (
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                      )}
                      {editingActivity ? 'Update' : 'Create'} Activity
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {!activities || activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No activities found</p>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Your First Activity
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Activity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{activity.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[250px]">
                          {activity.description.substring(0, 100)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                        {formatPrice(activity.price, activity.priceType ?? undefined)}
                    </TableCell>
                    <TableCell>
                      {activity.maxGroupSize ? (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{activity.maxGroupSize}</span>
                          <span className="text-xs text-gray-500">people max</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">Not set</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(activity)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(activity.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}