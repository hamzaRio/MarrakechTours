import React from "react";
import { MapPin, Phone, Mail, Instagram, Send } from "lucide-react";

const quickLinks = [
  { name: "Home", href: "#home" },
  { name: "Activities", href: "#activities" },
  { name: "About Us", href: "#about" },
  { name: "Contact", href: "#contact" },
];

export default function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleAdminClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // No need to prevent default as this should navigate
  };

  return (
    <footer className="bg-gray-800 text-gray-200 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-xl font-medium mb-4">MarrakechDeserts</h3>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/medina_expeditions" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-terracotta transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-terracotta transition-colors">
                <Send className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.href);
                    }}
                    className="text-gray-400 hover:text-terracotta transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
              <li>
                <a 
                  href="/admin/login"
                  onClick={handleAdminClick}
                  className="text-gray-400 hover:text-terracotta transition-colors"
                >
                  Admin Login
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-medium mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <MapPin className="h-5 w-5 mr-3 text-terracotta" />
                <span className="text-gray-400">54 Riad Zitoun Lakdim, Marrakech 40000, Morocco</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-terracotta" />
                <span className="text-gray-400">+212 600 623 630</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-terracotta" />
                <span className="text-gray-400">info@marrakechdeserts.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-10 pt-6 text-center">
          <p className="text-gray-500">&copy; {new Date().getFullYear()} MarrakechDeserts. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
