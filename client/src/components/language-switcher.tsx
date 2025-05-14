import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');

  // Update state when language changes
  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  // Change language
  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    setCurrentLanguage(language);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline"
          size="sm"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm border-terracotta hover:bg-terracotta/10 dark:hover:bg-terracotta/20"
          aria-label={t('language.switchLanguage')}
        >
          <Globe className="h-4 w-4" />
          <span className="font-medium">{currentLanguage === 'en' ? 'English' : 'Français'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 mt-1">
        <DropdownMenuItem 
          className={`flex justify-between items-center ${currentLanguage === 'en' ? 'bg-terracotta/10 text-terracotta' : ''}`}
          onClick={() => changeLanguage('en')}
        >
          <span>English</span>
          {currentLanguage === 'en' && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          className={`flex justify-between items-center ${currentLanguage === 'fr' ? 'bg-terracotta/10 text-terracotta' : ''}`}
          onClick={() => changeLanguage('fr')}
        >
          <span>Français</span>
          {currentLanguage === 'fr' && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;