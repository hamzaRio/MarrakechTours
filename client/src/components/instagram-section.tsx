import React from "react";
import { Instagram } from "lucide-react";

// Import local images from assets folder
import desertImage from "@assets/Hot Air Balloon Ride1.jpg";
import camelsImage from "@assets/agafaypack7.jpeg";
import mintTeaImage from "@assets/bahia.jpg";
import tileworkImage from "@assets/Ourika-valley-day-trip-from-marrakech-1.jpg";

// Instagram feed images
const instagramPosts = [
  {
    id: 1,
    imageUrl: desertImage,
    alt: "Desert dunes at sunset"
  },
  {
    id: 2,
    imageUrl: camelsImage,
    alt: "Local guide with camels"
  },
  {
    id: 3,
    imageUrl: mintTeaImage,
    alt: "Moroccan mint tea service"
  },
  {
    id: 4,
    imageUrl: tileworkImage,
    alt: "Moroccan doorway with tilework"
  }
];

export default function InstagramSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-center mb-6 text-gray-800">Follow Our Adventures</h2>
          <div className="h-1 w-16 bg-terracotta mx-auto mt-3"></div>
          <p className="mt-4 text-gray-600">
            Check out our latest tours on Instagram{" "}
            <a 
              href="https://www.instagram.com/medina_expeditions" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-terracotta hover:underline"
            >
              @medina_expeditions
            </a>
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {instagramPosts.map((post) => (
            <a 
              key={post.id}
              href="https://www.instagram.com/medina_expeditions" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative block overflow-hidden hover-lift"
            >
              <img
                src={post.imageUrl}
                alt={post.alt}
                className="w-full h-48 md:h-64 object-cover rounded-md transition-transform hover:scale-105 duration-300"
                loading="lazy"
                onError={(e) => (e.currentTarget.src = '/attached_assets/bahia.jpg')}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                <Instagram className="text-white h-6 w-6" />
              </div>
            </a>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <a 
            href="https://www.instagram.com/medina_expeditions" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-terracotta hover:text-terracotta/80 font-medium"
          >
            <Instagram className="h-5 w-5 mr-2" />
            View more on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
