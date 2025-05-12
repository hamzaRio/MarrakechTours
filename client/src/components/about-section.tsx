import React from "react";
import { MapPin, Clock } from "lucide-react";

export default function AboutSection() {
  return (
    <section id="about" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1539020580202-9d3ff5c73f05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Moroccan traditional riad courtyard" 
              className="rounded-lg shadow-md hover-lift"
            />
          </div>
          
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-medium text-gray-800 mb-4">About MarrakechDeserts</h2>
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
                Open daily: 9:00 AM - 8:00 PM
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
