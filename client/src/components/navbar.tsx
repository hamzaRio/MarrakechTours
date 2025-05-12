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
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <span className="text-2xl font-medium text-terracotta">
              <span className="text-moroccan-brown">Marrakech</span>Deserts
            </span>
          </Link>
          <Link href="/">
            <span className="text-gray-600 hover:text-terracotta transition-colors">
              Back to Site
            </span>
          </Link>
        </nav>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-medium text-terracotta">
            <span className="text-moroccan-brown">Marrakech</span>Deserts
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
              className="font-medium text-gray-700 hover:text-terracotta transition-colors"
            >
              {link.name}
            </a>
          ))}
        </div>
        
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>
      
      {/* Mobile menu */}
      <div className={cn(
        "md:hidden bg-white border-t border-gray-100 px-4 py-2",
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
            className="block py-2 text-gray-700 hover:text-terracotta"
          >
            {link.name}
          </a>
        ))}
      </div>
    </header>
  );
}
