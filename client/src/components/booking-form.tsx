import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { constructWhatsAppUrl, whatsAppContacts, getActivityIdByName, formatPrice } from "@/lib/utils";
import { CalendarIcon, Users, ArrowRight, Banknote } from "lucide-react";

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
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

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

  // Calculate total price when activity or number of people changes
  useEffect(() => {
    if (!activities) return;
    
    // Update form value when selectedActivityId prop changes
    if (selectedActivityId && selectedActivityId !== parseInt(form.getValues("activity"))) {
      form.setValue("activity", String(selectedActivityId));
      form.setValue("activityId", selectedActivityId);
    }
    
    const activityId = parseInt(form.watch("activity"));
    const people = form.watch("people");
    
    if (activityId && people) {
      const activity = activities.find(a => a.id === activityId);
      if (activity) {
        setSelectedActivity(activity);
        setTotalPrice(activity.price * people);
      }
    } else {
      setTotalPrice(null);
    }
  }, [selectedActivityId, form.watch("activity"), form.watch("people"), activities, form]);

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white font-medium">Full Name *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Your full name" 
                    {...field} 
                    className="bg-white/70 border-white text-gray-900 font-medium placeholder:text-gray-500 focus:ring-terracotta focus:border-terracotta" 
                  />
                </FormControl>
                <FormMessage className="text-white/90" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white font-medium">Phone Number *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g. +212600000000" 
                    {...field} 
                    className="bg-white/70 border-white text-gray-900 font-medium placeholder:text-gray-500 focus:ring-terracotta focus:border-terracotta" 
                  />
                </FormControl>
                <FormMessage className="text-white/90" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="activity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white font-medium">Select Activity *</FormLabel>
                <Select 
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger className="bg-white/70 border-white text-gray-900 font-medium focus:ring-terracotta focus:border-terracotta">
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
                <FormMessage className="text-white/90" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white font-medium">Preferred Date *</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      className="bg-white/70 border-white text-gray-900 font-medium focus:ring-terracotta focus:border-terracotta" 
                    />
                  </FormControl>
                  <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
                </div>
                <FormMessage className="text-white/90" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="people"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white font-medium">Number of People *</FormLabel>
                <Select 
                  value={String(field.value)}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                >
                  <FormControl>
                    <SelectTrigger className="bg-white/70 border-white text-gray-900 font-medium focus:ring-terracotta focus:border-terracotta">
                      <SelectValue placeholder="Select number of people" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[...Array(20)].map((_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        {i + 1} {i === 0 ? 'person' : 'people'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-white/90" />
              </FormItem>
            )}
          />
          
          <div>
            <FormLabel className="block text-white font-medium mb-2">
              Payment Method
            </FormLabel>
            <div className="bg-white/70 border border-white rounded-md p-3 text-gray-900 font-medium">
              Cash on Arrival
              {totalPrice && (
                <div className="mt-1 flex items-center text-gray-900 font-medium">
                  <Banknote className="h-4 w-4 mr-1.5 text-gray-500" />
                  Total: <span className="text-xl ml-1 font-bold text-terracotta">{formatPrice(totalPrice)}</span>
                  {selectedActivity && (
                    <span className="text-xs ml-1.5 text-gray-500">
                      ({formatPrice(selectedActivity.price)} per person × {form.watch("people")})
                    </span>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs mt-1 text-white/70">We currently accept cash payment only</p>
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white font-medium">Additional Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any special requirements or questions?" 
                  {...field} 
                  value={field.value || ''}
                  className="bg-white/70 border-white text-gray-900 font-medium placeholder:text-gray-500 focus:ring-terracotta focus:border-terracotta" 
                  rows={3}
                />
              </FormControl>
              <FormMessage className="text-white/90" />
            </FormItem>
          )}
        />
        
        <div className="pt-2">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-terracotta hover:bg-terracotta/90 text-white font-bold text-lg py-6 shadow-md border-2 border-white"
          >
            {isSubmitting ? "Processing..." : "Confirm Booking"} {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
          </Button>
          <p className="text-center text-sm mt-3 text-white/80">You will receive confirmation via WhatsApp</p>
        </div>
      </form>
    </Form>
  );
}
