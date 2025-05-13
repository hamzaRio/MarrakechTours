import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { constructWhatsAppUrl, whatsAppContacts, getActivityIdByName, getActivityPriceById, formatPrice } from "@/lib/utils";
import { CalendarIcon, Users, ArrowRight, Banknote } from "lucide-react";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import AvailabilityCalendar from "@/components/availability-calendar";
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
      phone: "+212",
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
      const activityId = parseInt(formData.activity);
      const activityPrice = getActivityPriceById(activityId);
      const totalPrice = activityPrice * formData.people;
      
      const bookingInfo = {
        name: formData.name,
        phone: formData.phone,
        activity: formData.activity, // Pass the ID so we can get the proper name in the utility function
        date: formData.date,
        people: formData.people,
      };

      // Construct a single WhatsApp message to be sent to all three team members
      // The message will include pricing information and mention all three team members
      window.open(constructWhatsAppUrl(whatsAppContacts.ahmed, bookingInfo, activityPrice), "_blank");
      window.open(constructWhatsAppUrl(whatsAppContacts.yahia, bookingInfo, activityPrice), "_blank");
      window.open(constructWhatsAppUrl(whatsAppContacts.nadia, bookingInfo, activityPrice), "_blank");
      
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

  const handleDateSelect = (date: Date) => {
    // Format date to YYYY-MM-DD for the form value
    const formattedDate = format(date, 'yyyy-MM-dd');
    form.setValue('date', formattedDate);
  };

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    await bookingMutation.mutateAsync(data);
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 w-full">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="mb-6 w-full">
                <FormLabel className="text-gray-800 font-medium mb-2 block">Full Name *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Your full name" 
                    {...field} 
                    className="bg-white border border-gray-300 text-gray-900 font-medium placeholder:text-gray-500 focus:ring-terracotta focus:border-terracotta h-12 px-4 w-full p-3" 
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
                <FormLabel className="text-gray-800 font-medium mb-2 block">Phone Number *</FormLabel>
                <FormControl>
                  <div className="w-full phone-container">
                    <PhoneInput
                      country={'ma'}
                      value={field.value}
                      onChange={(phone) => field.onChange("+" + phone)}
                      inputProps={{
                        name: 'phone',
                        required: true,
                        style: { fontSize: '18px' }
                      }}
                      containerStyle={{ width: '100%' }}
                      inputStyle={{ 
                        width: '100%', 
                        height: '42px',
                        paddingLeft: '75px',
                        fontSize: '16px',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        color: '#333'
                      }}
                      buttonStyle={{
                        border: '1px solid #d1d5db',
                        borderRight: 'none',
                        borderRadius: '0.375rem 0 0 0.375rem',
                        backgroundColor: 'white',
                        width: '65px',
                        paddingLeft: '8px',
                        height: '42px'
                      }}
                      onFocus={() => console.log("Focus changed")}
                      autoFormat={true}
                      countryCodeEditable={false}
                      dropdownClass="country-dropdown"
                      dropdownStyle={{
                        width: '280px',
                      }}
                      enableSearch={true}
                      disableSearchIcon={false}
                      searchPlaceholder="Search countries..."
                      preferredCountries={['ma', 'fr', 'es', 'gb', 'de']}
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
                  {selectedActivityId ? "Selected Activity" : "Select Activity *"}
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
                      <SelectValue placeholder={selectedActivityId ? selectedActivity?.title : "Choose an activity"} />
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
                <FormLabel className="text-gray-800 font-medium mb-2 block">Preferred Date *</FormLabel>
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
                <FormLabel className="text-gray-800 font-medium mb-2 block">Number of People *</FormLabel>
                <Select 
                  value={String(field.value)}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                >
                  <FormControl>
                    <SelectTrigger className="bg-white border border-gray-300 text-gray-900 font-medium focus:ring-terracotta focus:border-terracotta h-12 p-3 w-full">
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
                <FormMessage className="mt-2 text-gray-700" />
              </FormItem>
            )}
          />
          
          <div className="mb-6 w-full">
            <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
                <h3 className="text-gray-800 font-semibold">Booking Summary</h3>
              </div>
              
              <div className="p-5">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="flex items-center text-gray-800 font-medium">
                      <Banknote className="h-4 w-4 mr-2 text-gray-600" />
                      Payment Method:
                    </span>
                    <span className="bg-gray-100 px-3 py-1 rounded text-gray-900 font-medium text-sm">
                      Cash on Arrival
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">We currently accept cash payment only</p>
                </div>
                
                {totalPrice && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex flex-wrap justify-between items-center">
                      <span className="text-gray-800 font-medium">Total Price:</span>
                      <span className="text-2xl font-bold text-terracotta">
                        {formatPrice(totalPrice)} MAD
                      </span>
                    </div>
                    
                    {selectedActivity && (
                      <div className="text-sm text-gray-600 text-right mt-1">
                        ({formatPrice(selectedActivity.price)} MAD per person × {form.watch("people")} {form.watch("people") === 1 ? 'person' : 'people'})
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem className="mb-6 w-full">
              <FormLabel className="text-gray-800 font-medium mb-2 block">Additional Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any special requirements or questions?" 
                  {...field} 
                  value={field.value || ''}
                  className="bg-white border border-gray-300 text-gray-900 font-medium placeholder:text-gray-500 focus:ring-terracotta focus:border-terracotta min-h-[100px] p-4 w-full" 
                  rows={3}
                />
              </FormControl>
              <FormMessage className="mt-2 text-gray-700" />
            </FormItem>
          )}
        />
        
        <div className="pt-4 w-full">
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
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                Confirm Booking <ArrowRight className="ml-2 h-5 w-5" />
              </span>
            )}
          </Button>
          <div className="flex items-center justify-center mt-4 text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <p className="text-center text-sm">You will receive confirmation via WhatsApp from our team members (Nadia, Ahmed, and Yahia)</p>
          </div>
        </div>
      </form>
    </Form>
  );
}
