import React from "react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const scrollToBooking = () => {
    const bookingSection = document.querySelector("#booking");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="relative h-[85vh] pattern-overlay flex items-center justify-center">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-arabic font-bold text-white mb-6">
          Discover the Magic of Morocco
        </h1>
        <p className="text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto">
          Authentic desert experiences and tours from Marrakech
        </p>
        <Button 
          onClick={scrollToBooking}
          className="bg-moroccan-gold hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:-translate-y-1"
        >
          Book Your Adventure
        </Button>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/50 to-transparent"></div>
    </section>
  );
}
