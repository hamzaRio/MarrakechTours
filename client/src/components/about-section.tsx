import React from "react";

export default function AboutSection() {
  return (
    <section id="about" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1539020580202-9d3ff5c73f05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Moroccan traditional riad courtyard" 
              className="rounded-xl shadow-xl"
            />
          </div>
          
          <div className="lg:w-1/2">
            <h2 className="text-4xl font-arabic font-bold text-moroccan-brown mb-6">About MarrakechDeserts</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              We are a local Moroccan travel agency specializing in authentic desert experiences and tours from Marrakech. Our mission is to share the beauty and culture of Morocco with travelers from around the world.
            </p>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Our team of expert local guides ensures that each experience is safe, educational, and unforgettable. We pride ourselves on offering fair prices while maintaining the highest quality services.
            </p>
            
            <div className="bg-sandy/20 p-6 rounded-lg border-l-4 border-moroccan-gold">
              <h3 className="text-xl font-bold text-moroccan-brown mb-2">Find Us</h3>
              <p className="text-gray-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-moroccan-gold mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                54 Riad Zitoun Lakdim, Marrakech 40000
              </p>
              <p className="text-gray-700 mt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-moroccan-gold mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Open daily: 9:00 AM - 8:00 PM
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
