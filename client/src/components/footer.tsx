import React from "react";
import { Link } from "wouter";

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

  return (
    <footer className="bg-moroccan-brown text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h3 className="text-xl font-arabic font-bold mb-4">MarrakechDeserts</h3>
            <p className="mb-4">Your gateway to authentic Moroccan adventures since 2015.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-moroccan-gold transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
                </svg>
              </a>
              <a href="https://www.instagram.com/medina_expeditions" target="_blank" rel="noopener noreferrer" className="text-white hover:text-moroccan-gold transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="#" className="text-white hover:text-moroccan-gold transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.445 14.841l1.349-9.729c.051-.37-.004-.584-.273-.674a1.73 1.73 0 00-.705.089c-.337.115-4.84 1.804-5.982 2.236l-7.645 2.92c-.216.085-.318.173-.281.469.041.305.382.423.656.554.193.093 2.318.736 3.234 1.025.151.036.265-.161.353-.389.32-.826 2.211-5.708 2.287-5.896.096-.238.146-.369.436-.19.29.179.264.335.176.443-.088.107-1.516 1.5-3.663 3.592-.259.253-.458.383-.696.46-.363.116-.673-.132-.917-.329-.323-.261-1.9-1.234-3.36-2.203-.782-.521-1.634-1.569-.037-2.565 1.944-1.223 4.011-2.549 5.273-3.337 2.49-1.553 5.177-3.185 5.893-3.58 1.262-.693 2.459-.78 2.905-.589.446.191 1.705.599 1.755 1.204.05.604-.111 1.736-.111 1.736l-1.356 9.789c-.134.474-.363.649-.686.65-.323 0-.517-.175-.517-.175-.455-.39-2.486-1.633-3.116-2.063-.217-.147-.075-.471.052-.603 1.312-1.372 3.407-3.534 3.765-3.895.177-.179.147-.349 0-.419-.149-.07-.367.035-.473.106-.217.142-3.26 2.108-3.477 2.248z" />
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.href);
                    }}
                    className="hover:text-moroccan-gold transition"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
              <li>
                <Link href="/admin/login">
                  <a className="hover:text-moroccan-gold transition">Admin Login</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-1 mr-3 text-moroccan-gold" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>54 Riad Zitoun Lakdim, Marrakech 40000, Morocco</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-1 mr-3 text-moroccan-gold" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span>+212 600 623 630</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-1 mr-3 text-moroccan-gold" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span>info@marrakechdeserts.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-10 pt-6 text-center">
          <p>&copy; {new Date().getFullYear()} MarrakechDeserts. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
