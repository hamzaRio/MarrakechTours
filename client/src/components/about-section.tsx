import React from "react";
import { MapPin, Clock } from "lucide-react";

export default function AboutSection() {
  return (
    <>
      <section id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <img
                src="/attached_assets/bahia.jpg"
                alt="Bahia Palace in Marrakech"
                className="rounded-lg shadow-md hover-lift"
                onError={(e) => (e.currentTarget.src = '/attached_assets/bahia.jpg')}
              />
            </div>
            
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-bold text-center mb-6 text-gray-800">About MarrakechDeserts</h2>
              <div className="h-1 w-16 bg-terracotta mb-6"></div>
              
              <p className="text-gray-600 mb-4">
                We are a local Moroccan travel agency specializing in authentic desert experiences and tours from Marrakech. Our mission is to share the beauty and culture of Morocco with travelers from around the world.
              </p>
              <p className="text-gray-600 mb-6">
                Our team of expert local guides ensures that each experience is safe, educational, and unforgettable. We pride ourselves on offering fair prices while maintaining the highest quality services.
              </p>
              
              <div className="bg-gray-50 p-5 rounded-lg border-l-3 border-terracotta shadow-sm">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Find Us</h3>
                <p className="text-gray-700 flex items-center mb-2">
                  <MapPin className="h-5 w-5 text-terracotta mr-2" />
                  54 Riad Zitoun Lakdim, Marrakech 40000
                </p>
                <p className="text-gray-700 flex items-center">
                  <Clock className="h-5 w-5 text-terracotta mr-2" />
                  9h00 à 22h00 (7j/7j)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Morocco Destinations Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
            <div className="lg:w-1/2">
              <img
                src="/attached_assets/Ourika-valley-day-trip-from-marrakech-1.jpg"
                alt="Ourika Valley with the Atlas Mountains"
                className="rounded-lg shadow-md hover-lift"
                onError={(e) => (e.currentTarget.src = '/attached_assets/bahia.jpg')}
              />
            </div>
            
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-bold text-center mb-6 text-gray-800">Discover Morocco's Beauty</h2>
              <div className="h-1 w-16 bg-terracotta mb-6"></div>
              
              <p className="text-gray-600 mb-4">
                Morocco offers a stunning variety of landscapes, from the snow-capped Atlas Mountains to the vast Sahara Desert, from vibrant ancient cities to tranquil coastal towns.
              </p>
              <p className="text-gray-600 mb-6">
                With our curated experiences, you'll explore magnificent locations like the lush Ourika Valley with its crystal-clear streams and traditional Berber villages, or the impressive Ouzoud Waterfalls surrounded by olive groves and breathtaking gorges.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-moroccan-blue mb-2">Mountains</h3>
                  <p className="text-gray-600 text-sm">Experience the majestic Atlas Mountains with their snowy peaks and green valleys.</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-moroccan-gold mb-2">Desert</h3>
                  <p className="text-gray-600 text-sm">Explore the magical stone desert of Agafay or the golden dunes of the Sahara.</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-terracotta mb-2">Cities</h3>
                  <p className="text-gray-600 text-sm">Wander through the historic medinas of Marrakech, Essaouira, and Fez.</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-moroccan-brown mb-2">Culture</h3>
                  <p className="text-gray-600 text-sm">Immerse yourself in Moroccan traditions, crafts, cuisine, and hospitality.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
