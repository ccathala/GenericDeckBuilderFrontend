import React, { createContext, useContext, useState, useEffect } from "react";
import frTranslations from "../locales/fr.json";
import enTranslations from "../locales/en.json";

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  // Initialiser directement avec la langue sauvegardée ou "fr" par défaut
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem("language");
    return savedLanguage && ["fr", "en"].includes(savedLanguage)
      ? savedLanguage
      : "fr";
  });
  const [translations] = useState({
    fr: frTranslations,
    en: enTranslations,
  });

  // Sauvegarder la langue quand elle change
  useEffect(() => {
    localStorage.setItem("language", currentLanguage);
  }, [currentLanguage]);

  const toggleLanguage = () => {
    setCurrentLanguage((prev) => (prev === "fr" ? "en" : "fr"));
  };

  const t = (key, params = {}, defaultValue = key) => {
    if (!translations[currentLanguage]) {
      return defaultValue;
    }

    // Gérer les clés imbriquées comme "nav.home"
    const keys = key.split(".");
    let value = translations[currentLanguage];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }

    // Interpolation des variables {{variable}} si des paramètres sont fournis
    if (typeof value === "string" && params && Object.keys(params).length > 0) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
        return params[varName] !== undefined ? params[varName] : match;
      });
    }

    return value || defaultValue;
  };

  const value = {
    currentLanguage,
    toggleLanguage,
    t,
    isLoading: Object.keys(translations).length === 0,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
