import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');
  const [isOpen, setIsOpen] = useState(false);

  // Update state when language changes
  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  // Change language
  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    setCurrentLanguage(language);
    setIsOpen(false); // Close dropdown after selection
  };

  return (
    <div className="relative">
      <Button 
        variant="outline"
        size="sm"
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm border-terracotta hover:bg-terracotta/10 dark:hover:bg-terracotta/20"
        aria-label={t('language.switchLanguage')}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Globe className="h-4 w-4" />
        <span className="font-medium">{currentLanguage === 'en' ? 'English' : 'Français'}</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-1 z-50 bg-white rounded-md shadow-lg border border-gray-200 w-40 py-1">
          <button
            className={`w-full px-4 py-2 text-left flex justify-between items-center ${
              currentLanguage === 'en' ? 'bg-terracotta/10 text-terracotta' : 'hover:bg-gray-100'
            }`}
            onClick={() => changeLanguage('en')}
          >
            <span>English</span>
            {currentLanguage === 'en' && (
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
            )}
          </button>
          <button
            className={`w-full px-4 py-2 text-left flex justify-between items-center ${
              currentLanguage === 'fr' ? 'bg-terracotta/10 text-terracotta' : 'hover:bg-gray-100'
            }`}
            onClick={() => changeLanguage('fr')}
          >
            <span>Français</span>
            {currentLanguage === 'fr' && (
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Overlay to capture clicks outside the dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default LanguageSwitcher;