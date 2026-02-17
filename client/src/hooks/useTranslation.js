import { useState, useEffect, useCallback } from 'react';
import translator from '../utils/DynamicTranslator';

/**
 * Custom hook for using translations in React components
 * @returns {Object} Translation utilities
 */
function useTranslation() {
  const [language, setLanguage] = useState(translator.getLanguage());
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    // Subscribe to language changes
    const unsubscribe = translator.subscribe((newLang) => {
      setLanguage(newLang);
      forceUpdate((n) => n + 1);
    });

    // Also listen to the custom event
    const handleLanguageChange = (event) => {
      setLanguage(event.detail.language);
      forceUpdate((n) => n + 1);
    };

    window.addEventListener('languageChange', handleLanguageChange);

    return () => {
      unsubscribe();
      window.removeEventListener('languageChange', handleLanguageChange);
    };
  }, []);

  /**
   * Synchronous translation (cache/static only)
   * Use this for UI labels that need instant rendering
   */
  const t = useCallback(
    (text) => {
      return translator.t(text, language);
    },
    [language]
  );

  /**
   * Async translation (with API fallback)
   * Use this for dynamic content that can wait
   */
  const translateAsync = useCallback(
    async (text) => {
      return await translator.translateText(text, language);
    },
    [language]
  );

  /**
   * Batch translate multiple texts
   */
  const translateBatch = useCallback(
    async (texts) => {
      return await translator.translateBatch(texts, language);
    },
    [language]
  );

  /**
   * Change the current language
   */
  const changeLanguage = useCallback((lang) => {
    return translator.setLanguage(lang);
  }, []);

  /**
   * Get current language info
   */
  const getLanguageInfo = useCallback(() => {
    return translator.getLanguageInfo(language);
  }, [language]);

  /**
   * Get all available languages
   */
  const getLanguages = useCallback(() => {
    return translator.getAvailableLanguages();
  }, []);

  return {
    t,
    translateAsync,
    translateBatch,
    language,
    changeLanguage,
    getLanguageInfo,
    getLanguages,
    isEnglish: language === 'en',
  };
}

export { useTranslation };
export default useTranslation;
