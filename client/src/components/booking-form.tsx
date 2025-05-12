import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { constructWhatsAppUrl, whatsAppContacts, getActivityIdByName } from "@/lib/utils";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookingFormData, bookingFormSchema, Activity } from "@shared/schema";

interface BookingFormProps {
  selectedActivityId?: number;
  onSuccess: (data: BookingFormData) => void;
}

export default function BookingForm({ selectedActivityId, onSuccess }: BookingFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      activityId: selectedActivityId || 0,
      activity: selectedActivityId ? String(selectedActivityId) : "",
      date: "",
      people: 1,
      notes: "",
    },
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      // Map activity name to ID if needed
      const activityId = parseInt(data.activity) || getActivityIdByName(data.activity);
      
      const bookingData = {
        name: data.name,
        phone: data.phone,
        activityId,
        date: data.date,
        people: data.people,
        notes: data.notes || "",
      };

      return apiRequest("POST", "/api/bookings", bookingData);
    },
    onSuccess: async () => {
      const formData = form.getValues();
      
      // Send to WhatsApp contacts
      const activityName = activities?.find(a => a.id === parseInt(formData.activity))?.title || formData.activity;
      
      const bookingInfo = {
        name: formData.name,
        phone: formData.phone,
        activity: activityName,
        date: formData.date,
        people: formData.people,
      };

      // Open WhatsApp links in new tabs
      window.open(constructWhatsAppUrl(whatsAppContacts.ahmed, bookingInfo), "_blank");
      window.open(constructWhatsAppUrl(whatsAppContacts.yahia, bookingInfo), "_blank");
      window.open(constructWhatsAppUrl(whatsAppContacts.nadia, bookingInfo), "_blank");
      
      onSuccess(formData);
      
      toast({
        title: "Booking Confirmed!",
        description: "Your booking has been sent to our team via WhatsApp.",
      });
      
      form.reset();
    },
    onError: () => {
      toast({
        title: "Booking Failed",
        description: "There was a problem processing your booking. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    await bookingMutation.mutateAsync(data);
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Full Name *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Your full name" 
                    {...field} 
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-moroccan-gold text-white" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Phone Number *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g. +212600000000" 
                    {...field} 
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-moroccan-gold text-white" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="activity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Select Activity *</FormLabel>
                <Select 
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-moroccan-gold text-white">
                      <SelectValue placeholder="Choose an activity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {activities?.map((activity) => (
                      <SelectItem key={activity.id} value={String(activity.id)}>
                        {activity.title} - {activity.price} MAD
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Preferred Date *</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    {...field} 
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-moroccan-gold text-white" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="people"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Number of People *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1" 
                    max="20" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} 
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-moroccan-gold text-white" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div>
            <FormLabel className="block text-white text-sm font-medium mb-1">Payment Method</FormLabel>
            <Select disabled defaultValue="cash">
              <FormControl>
                <SelectTrigger className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-moroccan-gold text-white">
                  <SelectValue placeholder="Payment method" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="cash">Cash on Arrival</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs mt-1 text-white/70">We currently accept cash payment only upon arrival</p>
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Additional Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any special requirements or questions?" 
                  {...field} 
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-moroccan-gold text-white" 
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="pt-4">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-moroccan-gold hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition"
          >
            {isSubmitting ? "Processing..." : "Confirm Booking"}
          </Button>
          <p className="text-center text-sm mt-3 text-white/70">You will receive confirmation via WhatsApp</p>
        </div>
      </form>
    </Form>
  );
}
