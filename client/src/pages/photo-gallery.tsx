import React from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Helmet } from "@/hooks/use-helmet";
import ImageGalleryGrid from "@/components/image-gallery-grid";

export default function PhotoGalleryPage() {
  // Example categorized image collections
  const websiteImages = [
    "marrakech_screenshot.png"
  ];
  
  const agafayImages = [
    "agafaypack.jpeg",
    "agafaypack1.jpeg",
    "agafaypack2.jpeg",
    "agafaypack3.jpeg",
    "agafaypack5.jpeg",
    "agafaypack6.jpeg",
  ];
  
  const ourikaImages = [
    "ourika-valley-1.jpeg",
    "ourika valley3.jpg",
    "Ourika Valley Day Trip.jpg",
    "Ourika Valley Day Trip1.jpg",
    "Ourika-valley-day-trip-from-marrakech-1.jpg",
    "ourika-valley-marrakech.jpg",
  ];
  
  const ouzoudImages = [
    "Ouzoud-Waterfalls.jpg",
    "ouzoud waterfalls 2.jpg",
    "Ouzoud-Waterfalls3.jpg",
    "Ouzoud-Waterfalls4.JPG",
  ];
  
  const essaouiraImages = [
    "Essaouira Day Trip.jpg",
    "Essaouira Day Trip1.jpg",
    "Essaouira Day Trip2.jpg",
    "Essaouira day trip 3.jpg",
    "Essaouira day trip 4.jpg",
  ];
  
  const balloonImages = [
    "Hot Air Balloon Ride1.jpg",
    "Hot Air Balloon Ride2.jpg",
    "Hot Air Balloon Ride3.jpg",
    "montgofliere_a_marrakech.jpg",
    "montgolfiere-marrakech.jpg",
  ];

  return (
    <div className="bg-texture min-h-screen py-16">
      <Helmet 
        title="Photo Gallery | MarrakechDeserts" 
        description="Browse our collection of amazing Morocco travel experiences through our photo gallery. See the beauty of Agafay Desert, Ourika Valley, Ouzoud Waterfalls and more."
      />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center">
          <Link href="/" className="inline-flex items-center text-terracotta hover:text-terracotta-dark transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-10">Explore Morocco Through Photos</h1>
        
        <div className="space-y-16">
          <ImageGalleryGrid 
            title="MarrakechDeserts Website" 
            images={websiteImages} 
            columns={2}
            className="mb-8 border-b border-gray-200 pb-8"
          />
          
          <ImageGalleryGrid 
            title="Agafay Desert Experience" 
            images={agafayImages} 
            columns={3}
          />
          
          <ImageGalleryGrid 
            title="Ourika Valley Excursions" 
            images={ourikaImages} 
            columns={3}
          />
          
          <ImageGalleryGrid 
            title="Ouzoud Waterfalls" 
            images={ouzoudImages} 
            columns={2}
          />
          
          <ImageGalleryGrid 
            title="Essaouira Day Trip" 
            images={essaouiraImages} 
            columns={3}
          />
          
          <ImageGalleryGrid 
            title="Hot Air Balloon Experience" 
            images={balloonImages} 
            columns={3}
          />
        </div>
      </div>
    </div>
  );
}