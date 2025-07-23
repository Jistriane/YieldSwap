import { useState } from 'react';
import { useRouter } from 'next/router';

const languages = [
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
];

export function LanguageSelector() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentLanguage = languages.find(lang => lang.code === router.locale) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    router.push(router.pathname, router.asPath, { locale: languageCode });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300"
      >
        <span>{currentLanguage.flag}</span>
        <span>{currentLanguage.code.toUpperCase()}</span>
      </button>
      
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden z-50">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className="w-full px-4 py-3 text-left text-white hover:bg-white/20 transition-all duration-300 flex items-center gap-3"
            >
              <span>{language.flag}</span>
              <span>{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 