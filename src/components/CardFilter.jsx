import React, { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import styles from "./CardFilter.module.css";

const CardFilter = ({
  searchTerm,
  onSearchChange,
  selectedElements,
  onElementToggle,
  selectedComponents,
  onComponentToggle,
  availableComponents,
  translateComponent,
  selectedType,
  onTypeChange,
  onResetFilters,
  columnsCount = 6,
  onColumnsChange,
  showImagePreview = true,
  onImagePreviewToggle,
  showFanMade = false,
  onFanMadeToggle,
}) => {
  const { t } = useLanguage();
  const [isComponentDropdownOpen, setIsComponentDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  const cardTypes = ["Sort", "Permanent", "Équipement", "Animal", "Rituel"];

  const elements = [
    {
      key: "Végétal",
      cssClass: "vegetal",
      icon: "/src/assets/vegetal_icon.png",
    },
    {
      key: "Feu",
      cssClass: "feu",
      icon: "/src/assets/fire_icon.png",
    },
    {
      key: "Air",
      cssClass: "air",
      icon: "/src/assets/air_icon.png",
    },
    {
      key: "Eau",
      cssClass: "eau",
      icon: "/src/assets/water_icon.png",
    },
    {
      key: "Minéral",
      cssClass: "mineral",
      icon: "/src/assets/mineral_icon.png",
    },
    {
      key: "Arcane",
      cssClass: "arcane",
      icon: "/src/assets/arcane_icon.png",
    },
  ];

  const translatedAvailableComponents = Array.from(
    availableComponents.map((component) => translateComponent(component))
  ).sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));

  const ComponentDropdown = () => (
    <div className="relative">
      <button
        onClick={() => setIsComponentDropdownOpen(!isComponentDropdownOpen)}
        className="px-4 py-2 bg-mage-dark-700 border border-mage-dark-600 
                 rounded-md text-white text-sm font-medium
                 hover:bg-mage-dark-600 transition-colors duration-200
                 flex items-center gap-2"
        disabled={availableComponents.length === 0}
      >
        <span>
          {availableComponents.length === 0
            ? t("cards.filters.componentsLoading")
            : selectedComponents.length === 0
            ? t("cards.filters.componentsPlaceholder")
            : `${selectedComponents.length} ${t(
                "cards.filters.componentsSelected"
              )}`}
        </span>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isComponentDropdownOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
          />
        </svg>
      </button>

      {isComponentDropdownOpen && (
        <div
          className="absolute top-full left-0 mt-1 px-4 bg-mage-bg-800 
                      border border-mage-dark-600 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {availableComponents.length === 0 ? (
            <div className="px-4 py-3 text-gray-400 text-sm">
              {t("cards.filters.componentsLoading")}
            </div>
          ) : (
            translatedAvailableComponents.map((component) => (
              <label
                key={component}
                className="flex items-center px-4 py-2 hover:bg-mage-dark-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedComponents.includes(component)}
                  onChange={() => onComponentToggle(component)}
                  className="mr-3 text-mage-primary-500 rounded border-mage-dark-500 
                           focus:ring-mage-primary-500 focus:ring-2"
                />
                <span className="text-white text-sm">{component}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );

  const TypeDropdown = () => (
    <div className="relative">
      <button
        onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
        className="px-5 py-2 bg-mage-dark-700 border border-mage-dark-600 
                 rounded-md text-white text-sm font-medium
                 hover:bg-mage-dark-600 transition-colors duration-200
                 flex items-center gap-2"
      >
        <span>
          {selectedType === "" || selectedType === null
            ? t("cards.filters.typePlaceholder")
            : t(`cards.types.${selectedType}`)}
        </span>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isTypeDropdownOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
          />
        </svg>
      </button>

      {isTypeDropdownOpen && (
        <div
          className="absolute top-full left-0 mt-1 w-40 bg-mage-bg-800 
                      border border-mage-dark-600 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          <label
            onClick={() => {
              onTypeChange("");
              setIsTypeDropdownOpen(false);
            }}
            className="flex items-center px-4 py-2 hover:bg-mage-dark-700 cursor-pointer border-b border-mage-dark-600"
          >
            <span className="text-white text-sm">
              {t("cards.filters.typeAll")}
            </span>
          </label>
          {cardTypes.map((type) => (
            <label
              key={type}
              onClick={() => {
                onTypeChange(type);
                setIsTypeDropdownOpen(false);
              }}
              className={`flex items-center px-4 py-2 hover:bg-mage-dark-700 cursor-pointer ${
                selectedType === type ? "bg-mage-primary-500" : ""
              }`}
            >
              <span className="text-white text-sm">
                {t(`cards.types.${type}`)}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full mb-6">
      <div className="flex justify-center items-center gap-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("cards.filters.searchPlaceholder")}
          className="w-1/5 px-4 py-2 bg-mage-dark-700 border border-mage-dark-600 
                   rounded-md text-white placeholder-gray-400 
                   focus:outline-none focus:ring-2 focus:ring-mage-dark-500"
        />
        <div className="flex gap-2 items-center">
          {elements.map((element) => (
            <button
              key={element.key}
              onClick={() => onElementToggle(element.key)}
              className={`${styles.elementButton} ${
                selectedElements.includes(element.key)
                  ? styles[element.cssClass]
                  : styles.inactive
              }`}
              title={t(`cards.elements.${element.key}`)}
            >
              <img
                src={element.icon}
                alt={t(`cards.elements.${element.key}`)}
                className="object-contain max-w-full max-h-full"
              />
            </button>
          ))}
        </div>

        <ComponentDropdown />

        <TypeDropdown />

        {/* Fan Made toggle button */}
        <div className="flex items-center ml-2">
          <button
            onClick={() => onFanMadeToggle && onFanMadeToggle()}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              showFanMade
                ? "bg-blue-600 text-white hover:bg-purple-700 border border-purple-500"
                : "text-gray-400 hover:text-white hover:bg-mage-dark-700"
            }`}
            title={t("cards.filters.fanMadeTooltip")}
          >
            {t("cards.filters.fanMade")}
          </button>
        </div>

        <button
          onClick={onResetFilters}
          className="ml-2 p-2 text-gray-400 hover:text-white hover:bg-mage-dark-700 
                   rounded-md transition-colors duration-200"
          title={t("cards.filters.resetFilters")}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>

        {/* Contrôles de zoom */}
        <div className="flex items-center ml-4 space-x-1">
          <button
            onClick={() =>
              onColumnsChange && onColumnsChange(Math.min(10, columnsCount + 1))
            }
            disabled={columnsCount >= 10}
            className="p-2 text-gray-400 hover:text-white hover:bg-mage-dark-700 
                     rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title={t("cards.filters.zoomOut")}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12H4"
              />
            </svg>
          </button>

          <div className="p-2 text-gray-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <button
            onClick={() =>
              onColumnsChange && onColumnsChange(Math.max(6, columnsCount - 1))
            }
            disabled={columnsCount <= 6}
            className="p-2 text-gray-400 hover:text-white hover:bg-mage-dark-700 
                     rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title={t("cards.filters.zoomIn")}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </button>
        </div>

        {/* Bouton toggle aperçu d'image */}
        <div className="flex items-center ml-2">
          <button
            onClick={() => onImagePreviewToggle && onImagePreviewToggle()}
            className={`p-2 rounded-md transition-colors duration-200 ${
              showImagePreview
                ? "text-blue-400 hover:text-blue-300 hover:bg-mage-dark-700"
                : "text-gray-400 hover:text-white hover:bg-mage-dark-700"
            }`}
            title={t(
              showImagePreview
                ? "cards.filters.hideImagePreview"
                : "cards.filters.showImagePreview"
            )}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {showImagePreview ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                />
              )}
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardFilter;
