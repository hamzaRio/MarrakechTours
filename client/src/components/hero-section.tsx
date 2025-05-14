import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function HeroSection() {
  const { t } = useTranslation();
  
  const scrollToBooking = () => {
    const bookingSection = document.querySelector("#booking");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="relative h-[85vh] pattern-overlay flex items-center justify-center">
      <div className="container mx-auto px-4 text-center z-10 relative">
        <div className="bg-black/40 backdrop-blur-sm p-8 rounded-xl inline-block max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-medium text-white mb-6">
            {t('hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>
          <Button 
            onClick={scrollToBooking}
            size="lg"
            className="bg-terracotta hover:bg-terracotta/90 text-white font-medium py-6 px-8 rounded-md"
          >
            {t('hero.bookButton')} <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/70 to-transparent"></div>
    </section>
  );
}
