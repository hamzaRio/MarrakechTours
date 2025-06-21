import React from "react";
import { Link } from "wouter";
import { MapPin, Phone, Mail, Instagram, Send, Image } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
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
    <footer className="bg-gray-800 text-white py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
          <div>
            <h3 className="text-xl font-medium mb-4">MarrakechDeserts</h3>
            <div className="flex justify-center md:justify-start space-x-4">
              <a href="https://www.instagram.com/medina_expeditions" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-terracotta transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-medium mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2 flex flex-col items-center md:items-start">
              {[
                { name: t('navigation.home'), href: "#home" },
                { name: t('navigation.activities'), href: "#activities" },
                { name: t('navigation.about'), href: "#about" },
                { name: t('navigation.contact'), href: "#contact" }
              ].map((link, index) => (
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
                <Link 
                  href="/photos"
                  className="text-gray-400 hover:text-terracotta transition-colors flex items-center"
                >
                  <Image className="h-4 w-4 mr-1" /> {t('footer.photoGallery')}
                </Link>
              </li>
              <li>
                <a 
                  href="/admin/login"
                  onClick={handleAdminClick}
                  className="text-gray-400 hover:text-terracotta transition-colors"
                >
                  {t('admin.login')}
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-medium mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-3 flex flex-col items-center md:items-start">
              <li className="flex items-center justify-center md:justify-start">
                <MapPin className="h-5 w-5 mr-3 text-terracotta" />
                <span className="text-gray-400">54 Riad Zitoun Lakdim, Marrakech 40000, Morocco</span>
              </li>
              <li className="flex items-center justify-center md:justify-start">
                <Phone className="h-5 w-5 mr-3 text-terracotta" />
                <span className="text-gray-400">+212 600 623 630</span>
              </li>

              <li className="flex items-center justify-center md:justify-start">
                <span className="h-5 w-5 mr-3 text-terracotta">⏰</span>
                <span className="text-gray-400">9h00 à 22h00 (7j/7j)</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-10 pt-6 text-center">
          <p className="text-gray-500">&copy; {new Date().getFullYear()} MarrakechDeserts. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
}
