import React from "react";
import { User, MessageSquare } from "lucide-react";

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
    <section id="contact" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-center mb-6 text-gray-800">Contact Our Team</h2>
          <div className="h-1 w-16 bg-terracotta mx-auto mt-3"></div>
          <p className="mt-4 text-gray-600">Have questions? Reach out directly via WhatsApp</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {contacts.map((contact, index) => (
            <div
              key={index}
className="bg-white rounded-2xl shadow-md p-5 text-center hover:scale-105 transition"
            >
              <div className="w-16 h-16 bg-terracotta rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-medium text-gray-800">{contact.name}</h3>
              <p className="text-gray-500 text-sm mb-4">{contact.role}</p>
              <a 
                href={contact.whatsapp} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md w-full transition-colors"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                WhatsApp
              </a>
            </div>
          ))}
        </div>
        
        {/* Map Section */}
<div className="mt-12 rounded-2xl overflow-hidden shadow-md max-w-4xl mx-auto">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3397.0517579252175!2d-7.990933385269882!3d31.625683981343533!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xdafee8718b8b9dd%3A0x570a4986c646b90!2s54%20Riad%20Zitoun%20Lakdim%2C%20Marrakech%2040000%2C%20Morocco!5e0!3m2!1sen!2sus!4v1650000000000!5m2!1sen!2sus"
            width="100%"
            height="450"
            className="border-0"
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
