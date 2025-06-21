import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import ActivitySection from "@/components/activity-section";
import AboutSection from "@/components/about-section";
import InstagramSection from "@/components/instagram-section";
import BookingForm from "@/components/booking-form";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";
import BookingConfirmation from "@/components/booking-confirmation";
import { BookingFormData } from "@shared/schema";
import { Helmet } from "react-helmet";

export default function HomePage() {
  const [selectedActivityId, setSelectedActivityId] = useState<number | undefined>();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingData, setBookingData] = useState<BookingFormData | undefined>();
  
  // When an activity is booked from the activity section, scroll to booking form
  const handleBookActivity = (activityId: number) => {
    console.log("Booking activity from home page:", activityId);
    setSelectedActivityId(activityId);
    // Small delay to ensure state is updated before scrolling
    setTimeout(() => {
      const bookingSection = document.querySelector("#booking");
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  // When booking is successful, show confirmation modal
  const handleBookingSuccess = (data: BookingFormData) => {
    setBookingData(data);
    setShowConfirmation(true);
  };

  return (
    <>
      <Helmet>
        <title>MarrakechDeserts - Authentic Moroccan Desert Tours</title>
        <meta name="description" content="Experience authentic Moroccan desert tours with MarrakechDeserts. Book hot air balloon rides, desert excursions, and day trips from Marrakech." />
      </Helmet>
      
      <Navbar />
      
      <main>
        <HeroSection />
        <ActivitySection onBookActivity={handleBookActivity} />
        <AboutSection />
        <InstagramSection />
        
        <section id="booking" className="py-16 bg-terracotta text-white">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-center mb-6">Book Your Moroccan Adventure</h2>
              <div className="h-1 w-16 bg-white mx-auto mt-3"></div>
              <p className="mt-4 text-white/90">Fill out the form below to reserve your tour</p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <BookingForm
                  selectedActivityId={selectedActivityId}
                  onSuccess={handleBookingSuccess}
                />
              </div>
            </div>
          </div>
        </section>
        
        <ContactSection />
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
