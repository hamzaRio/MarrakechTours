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
import { BalloonThumbnailGallery } from "@/components/balloon-gallery";
import { OuzoudThumbnailGallery } from "@/components/ouzoud-gallery";
import { OurikaThumbnailGallery } from "@/components/ourika-gallery";
import BookingForm from "@/components/booking-form";
import BookingConfirmation from "@/components/booking-confirmation";
import { BookingFormData } from "@shared/schema";
import { CalendarDays, Clock, Users, MapPin, ArrowRight, Globe, Wallet } from "lucide-react";
import { Helmet } from "react-helmet";
import { SocialSharePopover } from "@/components/social-share";

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
  const isBalloonRide = activity?.title.includes("Montgolfière") || activity?.title.includes("Hot Air Balloon");
  const isOuzoud = activity?.title.includes("Ouzoud");
  const isOurika = activity?.title.includes("Ourika");

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
                  onError={(e) => {
                    // Fallback if image doesn't load
                    e.currentTarget.src = "/attached_assets/bahia.jpg";
                    console.error(`Image failed to load: ${activity.imageUrl}`);
                  }}
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
                
                {isBalloonRide && (
                  <>
                    <h2 className="text-xl font-medium text-gray-800 mt-6 mb-3">What's Included</h2>
                    <ul className="list-disc pl-5 text-gray-600 space-y-1">
                      <li>Sunrise hot air balloon flight over Marrakech</li>
                      <li>Spectacular aerial views of the Atlas Mountains and desert landscape</li>
                      <li>Traditional Berber breakfast after landing</li>
                      <li>Commemorative flight certificate</li>
                      <li>Round-trip transportation from your hotel in Marrakech</li>
                      <li>Professional, experienced pilot and ground crew</li>
                      <li>Safety briefing and equipment</li>
                    </ul>
                    
                    {/* Hot Air Balloon Gallery */}
                    <BalloonThumbnailGallery />
                  </>
                )}
                
                {isOuzoud && (
                  <>
                    <h2 className="text-xl font-medium text-gray-800 mt-6 mb-3">What's Included</h2>
                    <ul className="list-disc pl-5 text-gray-600 space-y-1">
                      <li>Full-day guided tour to the magnificent Ouzoud Waterfalls</li>
                      <li>Opportunity to spot wild Barbary macaque monkeys</li>
                      <li>Boat ride at the base of the falls (optional, additional fee)</li>
                      <li>Scenic hiking experience with breathtaking viewpoints</li>
                      <li>Traditional Berber lunch option at a local restaurant (additional fee)</li>
                      <li>Hotel pickup and drop-off in air-conditioned vehicle</li>
                      <li>Professional guide and bottled water throughout the tour</li>
                    </ul>
                    
                    {/* Ouzoud Waterfalls Gallery */}
                    <OuzoudThumbnailGallery />
                  </>
                )}
                
                {isOurika && (
                  <>
                    <h2 className="text-xl font-medium text-gray-800 mt-6 mb-3">What's Included</h2>
                    <ul className="list-disc pl-5 text-gray-600 space-y-1">
                      <li>Full-day guided tour of the beautiful Ourika Valley</li>
                      <li>Visit to traditional Berber villages with local crafts and cultural insights</li>
                      <li>Guided walk to refreshing mountain streams and small waterfalls</li>
                      <li>Opportunity to visit a traditional Berber home and learn about local life</li>
                      <li>Optional aromatic garden visit with herbs and spices (seasonal)</li>
                      <li>Hotel pickup and drop-off in air-conditioned vehicle</li>
                      <li>Professional guide and bottled water throughout the tour</li>
                    </ul>
                    
                    {/* Ourika Valley Gallery */}
                    <OurikaThumbnailGallery />
                  </>
                )}
              </div>
            </div>
            
            {/* Right column - Booking panel */}
            <div className="lg:w-1/3 mt-8 lg:mt-0">
              <div className="bg-gray-50 shadow-lg rounded-lg p-4 sm:p-6 sticky top-24 border-2 border-terracotta">
                <div className="bg-terracotta text-white rounded-lg py-4 px-2 mb-6 shadow-md">
                  <h2 className="text-2xl font-bold text-center flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    Book This Tour
                  </h2>
                </div>
                
                {!showBookingForm ? (
                  <>
                    <div className="mb-6 bg-white p-5 rounded-md shadow-sm">
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-700 font-medium flex items-center">
                          <Users className="mr-2 h-5 w-5 text-terracotta" /> 
                          Price per person
                        </span>
                        <span className="font-bold text-2xl text-terracotta">{formatPrice(activity.price)}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-700 font-medium flex items-center">
                          <Clock className="mr-2 h-5 w-5 text-terracotta" /> 
                          Duration
                        </span>
                        <span className="font-bold">Full day</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-700 font-medium flex items-center">
                          <Globe className="mr-2 h-5 w-5 text-terracotta" /> 
                          Languages
                        </span>
                        <span className="font-bold">English, French, Arabic</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-gray-700 font-medium flex items-center">
                          <Wallet className="mr-2 h-5 w-5 text-terracotta" /> 
                          Payment
                        </span>
                        <span className="font-bold">Cash on arrival</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => {
                        setShowBookingForm(true);
                        // Ensure selected activity id is set
                        if (activity && activity.id) {
                          console.log("Setting booking form for activity:", activity.id);
                        }
                      }}
                      className="w-full bg-terracotta hover:bg-terracotta/90 text-white font-bold text-lg py-6 border-2 border-white shadow-md"
                    >
                      Book Now <ArrowRight className="ml-2 h-5 w-5" />
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