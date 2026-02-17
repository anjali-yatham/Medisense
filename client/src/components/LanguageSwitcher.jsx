import React, { useState, useEffect, useRef } from 'react';
import translator from '../utils/DynamicTranslator';

function LanguageSwitcher({ className = '', variant = 'dark' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(translator.getLanguage());
  const [isLimitReached, setIsLimitReached] = useState(translator.isApiLimitReached());
  const dropdownRef = useRef(null);

  const languages = translator.getAvailableLanguages();
  const currentLangInfo = translator.getLanguageInfo(currentLang);
  
  // Different styles based on variant (light for light backgrounds, dark for dark backgrounds)
  const buttonStyles = variant === 'light' 
    ? 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700 shadow-sm hover:shadow-md'
    : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm border-white/20 text-white';

  useEffect(() => {
    // Subscribe to language changes
    const unsubscribe = translator.subscribe((lang) => {
      setCurrentLang(lang);
    });

    // Check API limit periodically
    const interval = setInterval(() => {
      setIsLimitReached(translator.isApiLimitReached());
    }, 10000);

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      unsubscribe();
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (langCode) => {
    translator.setLanguage(langCode);
    setIsOpen(false);
    // Force page re-render by dispatching event
    window.location.reload(); // Simple approach for full re-render
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Current Language Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-200 border ${buttonStyles}`}
        title="Change Language"
      >
        <span className="text-2xl leading-none">{currentLangInfo.flag}</span>
        <span className="text-sm font-semibold">{currentLangInfo.code.toUpperCase()}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-xl border border-gray-100 overflow-hidden z-50 animate-fadeIn">
          {/* Header */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Select Language
            </p>
          </div>

          {/* API Limit Warning */}
          {isLimitReached && (
            <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-100">
              <p className="text-xs text-yellow-700">
                ⚠️ Translation limit reached. Using cached translations.
              </p>
            </div>
          )}

          {/* Language Options */}
          <div className="py-1 max-h-64 overflow-y-auto">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 transition-colors duration-150 ${
                  currentLang === lang.code ? 'bg-blue-50' : ''
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="flex-1 text-left">
                  <p className={`text-sm font-medium ${
                    currentLang === lang.code ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {lang.name}
                  </p>
                  <p className="text-xs text-gray-400">{lang.nativeName}</p>
                </div>
                {currentLang === lang.code && (
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <button
              onClick={() => {
                translator.clearCache();
                translator.resetApiLimit();
                setIsLimitReached(false);
                setIsOpen(false);
              }}
              className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
            >
              Clear translation cache
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default LanguageSwitcher;
