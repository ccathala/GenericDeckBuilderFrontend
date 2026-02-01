import React from "react";
import { useLanguage } from "../contexts/LanguageContext";

const LanguageToggle = () => {
  const { currentLanguage, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium 
                 text-gray-700 hover:text-gray-900 hover:bg-gray-100 
                 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700
                 transition-colors duration-200"
      aria-label="Toggle language"
    >
      <span className="text-base">🌐</span>
      <span className="uppercase font-semibold">{currentLanguage}</span>
    </button>
  );
};

export default LanguageToggle;
