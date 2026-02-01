import React, { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { importDeck } from "../services/deckImportService";

const DeckImportModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    title: "",
    cardsList: "",
  });
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);

    try {
      const result = await importDeck(formData);
      onSuccess(result);
      setFormData({ title: "", cardsList: "" });
      onClose();
    } catch (error) {
      setErrors(error.errors || [error.message]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ title: "", cardsList: "" });
    setErrors([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {t("decks.import.title", "Importer un deck")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Titre du deck */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("decks.import.deckTitle", "Titre du deck")} *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-400 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={t(
                "decks.import.titlePlaceholder",
                "Mon nouveau deck"
              )}
              required
            />
          </div>

          {/* Liste des cartes */}
          <div>
            <label
              htmlFor="cardsList"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("decks.import.cardsList", "Liste des cartes")} *
            </label>
            <textarea
              id="cardsList"
              value={formData.cardsList}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, cardsList: e.target.value }))
              }
              className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-400 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-48 font-mono text-sm"
              placeholder={t(
                "decks.import.cardsPlaceholder",
                "4 anneau d'azur\n2 épée de lumière\n..."
              )}
              required
            />
            <p className="text-sm text-gray-600 mt-1">
              {t(
                "decks.import.formatHelp",
                "Format : quantité + espace + nom de la carte (une par ligne)"
              )}
            </p>
          </div>

          {/* Erreurs */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <h4 className="text-red-800 font-medium mb-2">
                {t("decks.import.errors", "Erreurs d'importation")}
              </h4>
              <ul className="text-red-700 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Boutons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              disabled={isLoading}
            >
              {t("common.cancel", "Annuler")}
            </button>
            <button
              type="submit"
              disabled={
                isLoading ||
                !formData.title.trim() ||
                !formData.cardsList.trim()
              }
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {isLoading
                ? t("decks.import.importing", "Importation...")
                : t("decks.import.importButton", "Importer")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeckImportModal;
