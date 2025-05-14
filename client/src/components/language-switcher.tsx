import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');

  // Update state when language changes
  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  // Toggle between English and French
  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLanguage);
    setCurrentLanguage(newLanguage);
  };

  return (
    <Button 
      variant="ghost"
      className="flex items-center gap-2 rounded-full px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
      onClick={toggleLanguage}
      aria-label={`Switch to ${currentLanguage === 'en' ? t('language.french') : t('language.english')}`}
    >
      <Globe className="h-4 w-4" />
      <span>{currentLanguage === 'en' ? 'FR' : 'EN'}</span>
    </Button>
  );
};

export default LanguageSwitcher;