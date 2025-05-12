import React, { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Activity } from "@shared/schema";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { AgafayThumbnailGallery } from "@/components/agafay-gallery";
import { EssaouiraThumbnailGallery } from "@/components/essaouira-gallery";
import BookingForm from "@/components/booking-form";
import BookingConfirmation from "@/components/booking-confirmation";
import { BookingFormData } from "@shared/schema";
import { CalendarDays, Clock, Users, MapPin, ArrowRight } from "lucide-react";
import { Helmet } from "react-helmet";

export default function ActivityDetailsPage() {
  const [, params] = useRoute("/activity/:id");
  const activityId = params?.id ? parseInt(params.id) : null;
  
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState<BookingFormData | undefined>();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const activity = activities?.find(a => a.id === activityId);

  const handleBookingSuccess = (data: BookingFormData) => {
    setBookingData(data);
    setShowBookingForm(false);
    setShowConfirmation(true);
  };

  // Special handling for specific activities
  const isAgafayCombo = activity?.title.includes("Agafay");
  const isEssaouira = activity?.title.includes("Essaouira");

  if (!activity) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-12 min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-medium text-gray-800 mb-4">Activity Not Found</h1>
            <p className="text-gray-600 mb-6">The activity you're looking for doesn't exist or has been removed.</p>
            <Button 
              onClick={() => window.history.back()}
              className="bg-terracotta hover:bg-terracotta/90 text-white"
            >
              Go Back
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{activity.title} - MarrakechDeserts</title>
        <meta name="description" content={activity.description} />
      </Helmet>
      
      <Navbar />
      
      <main>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left column - Activity details */}
            <div className="lg:w-2/3">
              <div className="relative">
                <img 
                  src={activity.imageUrl} 
                  alt={activity.title}
                  className="w-full h-[400px] object-cover rounded-lg"
                />
                <div className="absolute top-4 right-4 bg-terracotta text-white px-4 py-2 rounded-md font-medium">
                  {formatPrice(activity.price)}/person
                </div>
              </div>
              
              <h1 className="text-3xl font-medium text-gray-800 mt-6 mb-4">{activity.title}</h1>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center bg-gray-100 px-3 py-2 rounded-md">
                  <Clock className="h-4 w-4 mr-2 text-terracotta" />
                  <span className="text-sm">Full day tour</span>
                </div>
                <div className="flex items-center bg-gray-100 px-3 py-2 rounded-md">
                  <Users className="h-4 w-4 mr-2 text-terracotta" />
                  <span className="text-sm">Small groups</span>
                </div>
                <div className="flex items-center bg-gray-100 px-3 py-2 rounded-md">
                  <CalendarDays className="h-4 w-4 mr-2 text-terracotta" />
                  <span className="text-sm">Available daily</span>
                </div>
                <div className="flex items-center bg-gray-100 px-3 py-2 rounded-md">
                  <MapPin className="h-4 w-4 mr-2 text-terracotta" />
                  <span className="text-sm">Pickup included</span>
                </div>
              </div>
              
              <div className="prose max-w-none">
                <h2 className="text-xl font-medium text-gray-800 mb-4">Description</h2>
                <p className="text-gray-600">{activity.description}</p>
                
                {isAgafayCombo && (
                  <>
                    <h2 className="text-xl font-medium text-gray-800 mt-6 mb-3">What's Included</h2>
                    <ul className="list-disc pl-5 text-gray-600 space-y-1">
                      <li>Professional guided tour of the Agafay desert</li>
                      <li>Traditional Moroccan mint tea with local Berber family</li>
                      <li>Camel ride through the stunning stone desert</li>
                      <li>Optional quad biking experience (additional fee)</li>
                      <li>Authentic Berber dinner under the stars</li>
                      <li>Hotel pickup and drop-off in air-conditioned vehicle</li>
                      <li>Bottled water throughout the tour</li>
                    </ul>
                    
                    {/* Agafay Gallery */}
                    <AgafayThumbnailGallery />
                  </>
                )}
                
                {isEssaouira && (
                  <>
                    <h2 className="text-xl font-medium text-gray-800 mt-6 mb-3">What's Included</h2>
                    <ul className="list-disc pl-5 text-gray-600 space-y-1">
                      <li>Full-day guided tour of Essaouira</li>
                      <li>Explore the historic port and UNESCO World Heritage medina</li>
                      <li>Visit to the vibrant fish market and Skala du Port</li>
                      <li>Free time to wander through the charming blue and white streets</li>
                      <li>Optional seafood lunch at a local restaurant (additional fee)</li>
                      <li>Hotel pickup and drop-off in air-conditioned vehicle</li>
                      <li>Professional guide and bottled water throughout the tour</li>
                    </ul>
                    
                    {/* Essaouira Gallery */}
                    <EssaouiraThumbnailGallery />
                  </>
                )}
              </div>
            </div>
            
            {/* Right column - Booking panel */}
            <div className="lg:w-1/3">
              <div className="bg-white shadow-md rounded-lg p-6 sticky top-24">
                <h2 className="text-xl font-medium text-gray-800 mb-4">Book This Tour</h2>
                
                {!showBookingForm ? (
                  <>
                    <div className="mb-6">
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600">Price per person</span>
                        <span className="font-medium">{formatPrice(activity.price)}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600">Duration</span>
                        <span className="font-medium">Full day</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-100">
                        <span className="text-gray-600">Languages</span>
                        <span className="font-medium">English, French, Arabic</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-gray-600">Payment</span>
                        <span className="font-medium">Cash on arrival</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => setShowBookingForm(true)}
                      className="w-full bg-terracotta hover:bg-terracotta/90 text-white"
                    >
                      Book Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <BookingForm 
                    selectedActivityId={activity.id}
                    onSuccess={handleBookingSuccess}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      <BookingConfirmation 
        open={showConfirmation} 
        onClose={() => setShowConfirmation(false)} 
        bookingData={bookingData} 
      />
    </>
  );
}