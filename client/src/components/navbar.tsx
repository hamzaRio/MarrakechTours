import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "Activities", href: "#activities" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" }
];

export default function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdminPage = location.startsWith("/admin");

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  // If we're on an admin page, show a different navbar
  if (isAdminPage) {
    return (
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm shadow-md">
        <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/">
            <a className="text-3xl font-arabic font-bold text-moroccan-red">
              <span className="text-moroccan-gold">Marrakech</span>Deserts
            </a>
          </Link>
          <Link href="/">
            <a className="text-moroccan-brown hover:text-moroccan-gold transition">
              Back to Site
            </a>
          </Link>
        </nav>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm shadow-md">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-3xl font-arabic font-bold text-moroccan-red">
            <span className="text-moroccan-gold">Marrakech</span>Deserts
          </h1>
        </div>
        
        <div className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(link.href);
              }}
              className="font-medium text-moroccan-brown hover:text-moroccan-gold transition"
            >
              {link.name}
            </a>
          ))}
        </div>
        
        <div className="md:hidden">
          <Button
            variant="ghost"
            className="text-moroccan-brown hover:text-moroccan-gold"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </nav>
      
      {/* Mobile menu */}
      <div className={cn(
        "md:hidden bg-white border-t border-sandy px-4 py-2",
        mobileMenuOpen ? "block" : "hidden"
      )}>
        {navLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            onClick={(e) => {
              e.preventDefault();
              scrollToSection(link.href);
            }}
            className="block py-2 text-moroccan-brown hover:text-moroccan-gold"
          >
            {link.name}
          </a>
        ))}
      </div>
    </header>
  );
}
