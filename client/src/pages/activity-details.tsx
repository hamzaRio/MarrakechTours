import React, { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Activity } from "@shared/schema";
import { useTranslation } from "react-i18next";

// Extended type to handle both image property variants
interface ActivityWithImageUrl extends Activity {
  imageUrl?: string;
}
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
import AvailabilityCalendar from "@/components/availability-calendar";
import { CapacityDisplay, CapacityBadge } from "@/components/capacity-display";

export default function ActivityDetailsPage() {
  const [, params] = useRoute("/activity/:id");
  const activityId = params?.id ? parseInt(params.id) : null;
  const { t } = useTranslation();
  
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState<BookingFormData | undefined>();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: activities } = useQuery<ActivityWithImageUrl[]>({
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
        <div className="max-w-7xl mx-auto px-4 py-12 min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-medium text-gray-800 mb-4">{t('activities.notFound')}</h1>
            <p className="text-gray-600 mb-6">{t('activities.notFoundMessage')}</p>
            <Button 
              onClick={() => window.history.back()}
              className="bg-terracotta hover:bg-terracotta/90 text-white"
            >
              {t('common.goBack')}
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
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left column - Activity details */}
            <div className="lg:w-2/3">
              <div className="relative">
                <img 
                  src={activity.image || activity.imageUrl} 
                  alt={activity.title}
                  className="w-full h-[400px] object-cover rounded-lg"
                  onError={(e) => {
                    // Fallback if image doesn't load
                    e.currentTarget.src = "/attached_assets/bahia.jpg";
                    console.error(`Image failed to load: ${activity.image || activity.imageUrl}`);
                  }}
                />
                <div className="absolute top-4 right-4 bg-terracotta text-white px-4 py-2 rounded-md font-medium">
                  {formatPrice(activity.price)}/{t('activities.person')}
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-6 mb-4">
                <h1 className="text-4xl font-bold text-gray-800">{activity.title}</h1>
                <SocialSharePopover activity={activity} />
              </div>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center bg-gray-100 px-3 py-2 rounded-md">
                  <Clock className="h-4 w-4 mr-2 text-terracotta" />
                  <span className="text-sm">{t('activities.fullDayTour')}</span>
                </div>
                <div className="flex items-center bg-gray-100 px-3 py-2 rounded-md">
                  <Users className="h-4 w-4 mr-2 text-terracotta" />
                  <span className="text-sm">{t('activities.smallGroups')}</span>
                  {activity.id && activity.maxGroupSize && (
                    <span className="text-xs text-gray-500 ml-1">
                      ({t('activities.max')} {activity.maxGroupSize})
                    </span>
                  )}
                </div>
                <div className="flex items-center bg-gray-100 px-3 py-2 rounded-md">
                  <CalendarDays className="h-4 w-4 mr-2 text-terracotta" />
                  <span className="text-sm">{t('activities.availableDaily')}</span>
                </div>
                <div className="flex items-center bg-gray-100 px-3 py-2 rounded-md">
                  <MapPin className="h-4 w-4 mr-2 text-terracotta" />
                  <span className="text-sm">{t('activities.pickupIncluded')}</span>
                </div>
              </div>
              
              {activity.id && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">{t('activities.availabilityForToday')}</h3>
                  <CapacityDisplay 
                    activityId={activity.id} 
                    date={selectedDate}
                    className="mb-4" 
                  />
                </div>
              )}
              
              <div className="prose max-w-none">
                <h2 className="text-xl font-medium text-gray-800 mb-4">{t('activities.description')}</h2>
                <p className="text-gray-600">
                  {activity.id && t(`activities.${activity.id}.description`)}
                </p>
                
                {isAgafayCombo && (
                  <>
                    <h2 className="text-xl font-medium text-gray-800 mt-6 mb-3">{t('activities.whatsIncluded')}</h2>
                    <ul className="list-disc pl-5 text-gray-600 space-y-1">
                      <li>{t('activities.agafay.included.tour')}</li>
                      <li>{t('activities.agafay.included.tea')}</li>
                      <li>{t('activities.agafay.included.camelRide')}</li>
                      <li>{t('activities.agafay.included.quadBiking')}</li>
                      <li>{t('activities.agafay.included.dinner')}</li>
                      <li>{t('activities.agafay.included.transport')}</li>
                      <li>{t('activities.agafay.included.water')}</li>
                    </ul>
                    
                    {/* Agafay Gallery */}
                    <AgafayThumbnailGallery />
                  </>
                )}
                
                {isEssaouira && (
                  <>
                    <h2 className="text-xl font-medium text-gray-800 mt-6 mb-3">{t('activities.whatsIncluded')}</h2>
                    <ul className="list-disc pl-5 text-gray-600 space-y-1">
                      <li>{t('activities.essaouira.included.tour')}</li>
                      <li>{t('activities.essaouira.included.medina')}</li>
                      <li>{t('activities.essaouira.included.market')}</li>
                      <li>{t('activities.essaouira.included.freeTime')}</li>
                      <li>{t('activities.essaouira.included.lunch')}</li>
                      <li>{t('activities.essaouira.included.transport')}</li>
                      <li>{t('activities.essaouira.included.guide')}</li>
                    </ul>
                    
                    {/* Essaouira Gallery */}
                    <EssaouiraThumbnailGallery />
                  </>
                )}
                
                {isBalloonRide && (
                  <>
                    <h2 className="text-xl font-medium text-gray-800 mt-6 mb-3">{t('activities.whatsIncluded')}</h2>
                    <ul className="list-disc pl-5 text-gray-600 space-y-1">
                      <li>{t('activities.balloon.included.flight')}</li>
                      <li>{t('activities.balloon.included.views')}</li>
                      <li>{t('activities.balloon.included.breakfast')}</li>
                      <li>{t('activities.balloon.included.certificate')}</li>
                      <li>{t('activities.balloon.included.transport')}</li>
                      <li>{t('activities.balloon.included.pilot')}</li>
                      <li>{t('activities.balloon.included.safety')}</li>
                    </ul>
                    
                    {/* Hot Air Balloon Gallery */}
                    <BalloonThumbnailGallery />
                  </>
                )}
                
                {isOuzoud && (
                  <>
                    <h2 className="text-xl font-medium text-gray-800 mt-6 mb-3">{t('activities.whatsIncluded')}</h2>
                    <ul className="list-disc pl-5 text-gray-600 space-y-1">
                      <li>{t('activities.ouzoud.included.tour')}</li>
                      <li>{t('activities.ouzoud.included.monkeys')}</li>
                      <li>{t('activities.ouzoud.included.boat')}</li>
                      <li>{t('activities.ouzoud.included.hiking')}</li>
                      <li>{t('activities.ouzoud.included.lunch')}</li>
                      <li>{t('activities.ouzoud.included.transport')}</li>
                      <li>{t('activities.ouzoud.included.guide')}</li>
                    </ul>
                    
                    {/* Ouzoud Waterfalls Gallery */}
                    <OuzoudThumbnailGallery />
                  </>
                )}
                
                {isOurika && (
                  <>
                    <h2 className="text-xl font-medium text-gray-800 mt-6 mb-3">{t('activities.whatsIncluded')}</h2>
                    <ul className="list-disc pl-5 text-gray-600 space-y-1">
                      <li>{t('activities.ourika.included.tour')}</li>
                      <li>{t('activities.ourika.included.villages')}</li>
                      <li>{t('activities.ourika.included.walk')}</li>
                      <li>{t('activities.ourika.included.home')}</li>
                      <li>{t('activities.ourika.included.garden')}</li>
                      <li>{t('activities.ourika.included.transport')}</li>
                      <li>{t('activities.ourika.included.guide')}</li>
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
                    {t('activities.bookThisTour')}
                  </h2>
                </div>
                
                <div className="mb-6">
                  <AvailabilityCalendar 
                    onDateSelect={(date) => {
                      console.log("Selected date:", date);
                      setSelectedDate(date);
                      setShowBookingForm(true);
                    }}
                  />
                </div>
                
                {activity.id && !showBookingForm && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      {t('booking.availabilityFor', { date: selectedDate.toLocaleDateString() })}
                    </h3>
                    <CapacityDisplay 
                      activityId={activity.id} 
                      date={selectedDate}
                      className="mt-1" 
                    />
                  </div>
                )}
                
                {!showBookingForm ? (
                  <>
                    <div className="mb-6 bg-white p-5 rounded-md shadow-sm">
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-700 font-medium flex items-center">
                          <Users className="mr-2 h-5 w-5 text-terracotta" /> 
                          {t('activities.price')} {t('activities.perPerson')}
                        </span>
                        <span className="font-bold text-2xl text-terracotta">{formatPrice(activity.price)}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-700 font-medium flex items-center">
                          <Clock className="mr-2 h-5 w-5 text-terracotta" /> 
                          {t('activities.duration')}
                        </span>
                        <span className="font-bold">{t('activities.fullDayTour')}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-700 font-medium flex items-center">
                          <Globe className="mr-2 h-5 w-5 text-terracotta" /> 
                          {t('language.languages')}
                        </span>
                        <span className="font-bold">{t('language.english')}, {t('language.french')}, {t('about.arabic')}</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-gray-700 font-medium flex items-center">
                          <Wallet className="mr-2 h-5 w-5 text-terracotta" /> 
                          {t('booking.paymentMethod')}
                        </span>
                        <span className="font-bold">{t('booking.cashOnArrival')}</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => {
                        setShowBookingForm(true);
                        // Ensure selected activity id is set
                        if (activity && activity.id) {
                          console.log("Setting booking form for activity:", activity.id);
                          
                          // Create a small delay to ensure state is updated before scrolling
                          setTimeout(() => {
                            const bookingSection = document.getElementById("booking-form-section");
                            if (bookingSection) {
                              bookingSection.scrollIntoView({ behavior: "smooth" });
                            }
                          }, 100);
                        }
                      }}
                      className="w-full bg-terracotta hover:bg-terracotta/90 text-white font-bold text-lg py-6 border-2 border-white shadow-md"
                    >
                      {t('activities.bookNow')} <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </>
                ) : (
                  <div id="booking-form-section">
                    <BookingForm 
                      selectedActivityId={activity.id}
                      onSuccess={handleBookingSuccess}
                    />
                  </div>
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