import React from "react";

const contacts = [
  {
    name: "Ahmed",
    role: "Tour Guide & Manager",
    whatsapp: "https://wa.me/212600623630",
  },
  {
    name: "Yahia",
    role: "Local Expert & Driver",
    whatsapp: "https://wa.me/212693323368",
  },
  {
    name: "Nadia",
    role: "Booking Manager",
    whatsapp: "https://wa.me/212654497354",
  },
];

export default function ContactSection() {
  return (
    <section id="contact" className="py-16 bg-sandy/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-arabic font-bold text-moroccan-brown">Contact Our Team</h2>
          <div className="h-1 w-24 bg-moroccan-gold mx-auto mt-4"></div>
          <p className="mt-4 text-lg text-gray-700">Have questions? Reach out directly via WhatsApp</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {contacts.map((contact, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-lg p-6 text-center hover:-translate-y-2 transition duration-300"
            >
              <div className="w-24 h-24 bg-terracotta rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-moroccan-brown">{contact.name}</h3>
              <p className="text-gray-600 mb-4">{contact.role}</p>
              <a 
                href={contact.whatsapp} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-block bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-full w-full transition social-button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
            </div>
          ))}
        </div>
        
        {/* Map Section */}
        <div className="mt-16 rounded-xl overflow-hidden shadow-xl max-w-4xl mx-auto">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3397.0517579252175!2d-7.990933385269882!3d31.625683981343533!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xdafee8718b8b9dd%3A0x570a4986c646b90!2s54%20Riad%20Zitoun%20Lakdim%2C%20Marrakech%2040000%2C%20Morocco!5e0!3m2!1sen!2sus!4v1650000000000!5m2!1sen!2sus" 
            width="100%" 
            height="450" 
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="MarrakechDeserts Location"
          ></iframe>
        </div>
      </div>
    </section>
  );
}
