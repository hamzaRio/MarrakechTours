import React, { useState, useEffect } from "react";
import { useForm, type Resolver, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { constructWhatsAppUrl, whatsAppContacts, getActivityIdByName, getActivityPriceById, formatPrice } from "@/lib/utils";
import { CalendarIcon, Users, ArrowRight, Banknote, AlertTriangle } from "lucide-react";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import AvailabilityCalendar from "@/components/availability-calendar";
import { CapacityBadge, CapacityDisplay } from "@/components/capacity-display";
import { format } from "date-fns";

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
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [capacityError, setCapacityError] = useState<string | null>(null);

  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  // @ts-ignore - zodResolver type is complex
  const form = useForm({
    resolver: zodResolver(bookingFormSchema) as any,
    defaultValues: {
      name: "",
      phone: "+212",
      activityId: selectedActivityId || 0,
      activity: selectedActivityId ? String(selectedActivityId) : "",
      date: "",
      people: 1,
      notes: "",
    },
  }) as UseFormReturn<BookingFormData>;

  // Query capacity data for selected activity and date
  const formActivityId = parseInt(form.watch("activity") || "0");
  const activityId = formActivityId || selectedActivityId || 0;
  const formDate = form.watch("date");
  
  const { data: capacityData } = useQuery({
    queryKey: ["/api/capacity/activity", activityId, formDate],
    queryFn: () => {
      if (!activityId || !formDate) return null;
      return apiRequest("GET", `/api/capacity/activity/${activityId}/${formDate}`).then(res => res.json());
    },
    enabled: !!activityId && !!formDate,
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
    
    // Reset capacity error when activity or date changes
    setCapacityError(null);
  }, [selectedActivityId, form.watch("activity"), form.watch("people"), form.watch("date"), activities, form]);
  
  // Check capacity constraints
  useEffect(() => {
    if (!capacityData || !form.watch("people")) return;
    
    const people = form.watch("people");
    if (capacityData.remainingSpots !== undefined && people > capacityData.remainingSpots) {
      setCapacityError(t('booking.onlyNSpotsLeft', { count: capacityData.remainingSpots }));
    } else {
      setCapacityError(null);
    }
  }, [capacityData, form.watch("people")]);

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

      // First save to in-memory storage
      await apiRequest("POST", "/api/bookings", bookingData);
      
      // Try to save to MongoDB as well (this won't block the booking process if it fails)
      try {
        const response = await fetch('/api/mongo/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: data.name,
            phoneNumber: data.phone,
            selectedActivity: t('activities.' + (parseInt(data.activity) || 1) + '.title', {
              defaultValue: activities?.find(a => a.id === parseInt(data.activity))?.title || data.activity
            }),
            preferredDate: data.date,
            numberOfPeople: data.people,
            notes: data.notes || "",
          }),
        });
        
        if (response.ok) {
          console.log('Booking saved to MongoDB database');
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          console.warn('MongoDB save failed:', errorData.message);
        }
      } catch (error) {
        console.warn('MongoDB connection failed, but booking is still processed in memory storage');
      }
      
      return bookingData;
    },
    onSuccess: async () => {
      const formData = form.getValues();
      
      // The server will send WhatsApp notifications to the team members
      // No need to open WhatsApp directly from the browser anymore
      
      onSuccess(formData);
      
      toast({
        title: t('booking.confirmed'),
        description: t('booking.teamNotified'),
      });
      
      form.reset();
    },
    onError: () => {
      toast({
        title: t('booking.failed'),
        description: t('booking.tryAgain'),
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const handleDateSelect = (date: Date) => {
    // Format date to YYYY-MM-DD for the form value
    const formattedDate = format(date, 'yyyy-MM-dd');
    form.setValue('date', formattedDate);
    setSelectedDate(formattedDate);
  };

  const onSubmit = async (data: BookingFormData) => {
    // Check capacity before submission
    if (capacityError) {
      toast({
        title: t('booking.failed'),
        description: capacityError,
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await bookingMutation.mutateAsync(data);
    } catch (error) {
      console.error("Booking error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
<form
  onSubmit={form.handleSubmit(onSubmit)}
  className="space-y-6 booking-form"
>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="mb-6 w-full">
                <FormLabel className="text-gray-800 font-medium mb-2 block">{t('booking.fullName')}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t('booking.yourFullName')} 
                    {...field} 
                    className="rounded-md border border-gray-300 px-4 py-2 w-full text-gray-900 placeholder:text-gray-500 focus:ring-terracotta focus:border-terracotta"
                  />
                </FormControl>
                <FormMessage className="mt-2 text-gray-700" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="mb-6 w-full">
                <FormLabel className="text-gray-800 font-medium mb-2 block">{t('booking.phoneNumber')}</FormLabel>
                <FormControl>
                  <div className="w-full phone-container">
                    <PhoneInput
                      international
                      defaultCountry="MA"
                      value={field.value}
                      onChange={(phone) => field.onChange(phone || "")}
                      className="phone-input"
                      countrySelectProps={{ 
                        unicodeFlags: true,
                        className: 'country-dropdown'
                      }}
                      countryCallingCodeEditable={false}
                    />
                  </div>
                </FormControl>
                <FormMessage className="mt-2 text-gray-700" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="activity"
            render={({ field }) => (
              <FormItem className="mb-6 w-full">
                <FormLabel className="text-gray-800 font-medium mb-2 block">
                  {selectedActivityId ? t('booking.selectedActivity') : t('booking.activity') + ' *'}
                </FormLabel>
                <Select 
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  disabled={!!selectedActivityId}
                >
                  <FormControl>
                    <SelectTrigger 
                      className={`bg-white border border-gray-300 text-gray-900 font-medium focus:ring-terracotta focus:border-terracotta h-12 p-3 w-full ${selectedActivityId ? 'cursor-not-allowed opacity-80' : ''}`}
                    >
                      <SelectValue placeholder={selectedActivityId ? selectedActivity?.title : t('booking.chooseActivity')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[300px]">
                    {activities?.map((activity) => (
                      <SelectItem key={activity.id} value={String(activity.id)}>
                        {activity.title} - {activity.price} MAD
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="mt-2 text-gray-700" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="mb-6 w-full">
                <FormLabel className="text-gray-800 font-medium mb-2 block">{t('booking.preferredDate')}</FormLabel>
                <FormControl>
                  <input 
                    type="hidden" 
                    {...field}
                  />
                </FormControl>
                <AvailabilityCalendar 
                  activityId={parseInt(form.getValues("activity")) || undefined}
                  onDateSelect={handleDateSelect}
                  buttonVariant="outline"
                  className="w-full"
                />
                <FormMessage className="mt-2 text-gray-700" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="people"
            render={({ field }) => (
              <FormItem className="mb-6 w-full">
                <FormLabel className="text-gray-800 font-medium mb-2 block">{t('booking.numberOfPeople')}</FormLabel>
                <Select 
                  value={String(field.value)}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                >
                  <FormControl>
                    <SelectTrigger className="rounded-md border border-gray-300 px-4 py-2 w-full text-gray-900 focus:ring-terracotta focus:border-terracotta">
                      <SelectValue placeholder={t('booking.selectPeople')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[...Array(20)].map((_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        {i + 1} {i === 0 ? t('booking.person') : t('booking.people')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="mt-2 text-gray-700" />
              </FormItem>
            )}
          />
          
          <div className="mb-6 w-full md:col-span-2">
            <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
                <h3 className="text-gray-800 font-semibold">{t('booking.summary')}</h3>
              </div>
              
              <div className="p-5">
                {form.getValues("date") && parseInt(form.getValues("activity")) > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">{t('booking.availabilityFor')} {new Date(form.getValues("date")).toLocaleDateString()}</h4>
                    <CapacityDisplay 
                      activityId={parseInt(form.getValues("activity"))} 
                      date={form.getValues("date")}
                      className="mb-3" 
                    />
                  </div>
                )}
                
                {capacityError && (
                  <div className="mb-4 p-3 border border-red-200 bg-red-50 rounded-md">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                      <p className="text-red-700 text-sm">{capacityError}</p>
                    </div>
                  </div>
                )}
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="flex items-center text-gray-800 font-medium">
                      <Banknote className="h-4 w-4 mr-2 text-gray-600" />
                      {t('booking.paymentMethod')}
                    </span>
                    <span className="bg-gray-100 px-3 py-1 rounded text-gray-900 font-medium text-sm">
                      {t('booking.cashOnArrival')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{t('booking.cashPaymentOnly')}</p>
                </div>
                
                {totalPrice && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex flex-wrap justify-between items-center">
                      <span className="text-gray-800 font-medium">{t('booking.totalPrice')}:</span>
                      <span className="text-2xl font-bold text-terracotta">
                        {formatPrice(totalPrice)} MAD
                      </span>
                    </div>
                    
                    {selectedActivity && (
                      <div className="text-sm text-gray-600 text-right mt-1">
                        ({formatPrice(selectedActivity.price)} MAD {t('booking.perPerson')} × {form.watch("people")} {form.watch("people") === 1 ? t('booking.person') : t('booking.people')})
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="mb-6 w-full md:col-span-2">
              <FormLabel className="text-gray-800 font-medium mb-2 block">{t('booking.additionalNotes')}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={t('booking.anyRequirements')} 
                  {...field} 
                  value={field.value || ''}
                  className="rounded-md border border-gray-300 px-4 py-2 w-full text-gray-900 placeholder:text-gray-500 focus:ring-terracotta focus:border-terracotta min-h-[100px]"
                  rows={3}
                />
              </FormControl>
              <FormMessage className="mt-2 text-gray-700" />
              </FormItem>
            )}
          />

        </div>

        <div className="pt-4 w-full md:col-span-2">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-terracotta hover:bg-terracotta/90 text-white font-bold text-lg py-6 shadow-md border border-gray-300 transition-all duration-300 hover:shadow-lg"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('booking.processing')}
              </span>
            ) : (
              <span className="flex items-center justify-center">
                {t('booking.confirmBooking')} <ArrowRight className="ml-2 h-5 w-5" />
              </span>
            )}
          </Button>
          <div className="flex items-center justify-center mt-4 text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <p className="text-center text-sm">{t('booking.whatsAppConfirmation')}</p>
          </div>
        </div>
      </form>
    </Form>
  );
}
