import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./language-switcher";

export default function Navbar() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdminPage = location.startsWith("/admin");

  // Define navigation links with translations
  const links = [
    { name: t('navigation.home'), href: "#home" },
    { name: t('navigation.activities'), href: "#activities" },
    { name: t('navigation.about'), href: "#about" },
    { name: t('navigation.contact'), href: "#contact" },
    { name: t('navigation.booking'), href: "#booking" },
    { name: "Photos", href: "/photos", isPage: true }
  ];

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
        <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <span className="text-2xl font-medium text-terracotta">
              <span className="text-moroccan-brown">Marrakech</span>Deserts
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <div>
              <LanguageSwitcher />
            </div>
            <Link href="/">
              <span className="text-gray-600 hover:text-terracotta transition-colors">
                {t('admin.backToSite') || 'Back to Site'}
              </span>
            </Link>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <h1 className="text-2xl font-medium text-terracotta cursor-pointer">
              <span className="text-moroccan-brown">Marrakech</span>Deserts
            </h1>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <div className="flex items-center space-x-4">
            {links.map((link) => (
              link.isPage ? (
                <Link
                  key={link.name}
                  href={link.href}
                  className="font-medium text-gray-700 hover:text-terracotta transition-colors"
                >
                  {link.name}
                </Link>
              ) : (
                link.name === t('navigation.home') ? (
                  <Link
                    key={link.name}
                    href="/"
                    className="font-medium text-gray-700 hover:text-terracotta transition-colors"
                  >
                    {link.name}
                  </Link>
                ) : (
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
                )
              )
            ))}
          </div>
          
          {/* Language Switcher */}
          <div className="pl-2 border-l border-gray-200">
            <LanguageSwitcher />
          </div>
        </div>
        
        <div className="md:hidden flex items-center gap-4">
          <div>
            <LanguageSwitcher />
          </div>
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
        {links.map((link) => (
          link.isPage ? (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-gray-700 hover:text-terracotta"
            >
              {link.name}
            </Link>
          ) : (
            link.name === t('navigation.home') ? (
              <Link
                key={link.name}
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-gray-700 hover:text-terracotta"
              >
                {link.name}
              </Link>
            ) : (
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
            )
          )
        ))}
      </div>
    </header>
  );
}
