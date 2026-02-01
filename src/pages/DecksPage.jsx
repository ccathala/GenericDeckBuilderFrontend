import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import deckService from "../services/deckService";
import DeckImportModal from "../components/DeckImportModal";
import DeckExportModal from "../components/DeckExportModal";
import NotificationToast from "../components/NotificationToast";
import { Eye, Pencil, Download, Trash2, CreditCard } from "lucide-react";

const DecksPage = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // États pour l'export
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedDeckForExport, setSelectedDeckForExport] = useState(null);
  const [notification, setNotification] = useState({
    isVisible: false,
    message: "",
    type: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchDecks();
    }
  }, [isAuthenticated]);

  const fetchDecks = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await deckService.getAllDecks();
      if (result.success) {
        setDecks(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImportSuccess = (importedDeck) => {
    setDecks((prevDecks) => [importedDeck, ...prevDecks]);
    // Vous pouvez ajouter un message de succès ici si nécessaire
  };

  const handleCreateDeck = async () => {
    try {
      setIsCreating(true);
      setError(null);

      // Créer le deck vide
      const result = await deckService.createEmptyDeck();

      if (result.success) {
        // Rafraîchir la liste des decks (nouveau deck apparaîtra en bas)
        await fetchDecks();

        setNotification({
          isVisible: true,
          message: t("decks.createSuccess") || "Deck créé avec succès",
          type: "success",
        });
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("Erreur création deck:", err);
      setError("Échec de la création du deck. Veuillez réessayer.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteDeck = async (deckId) => {
    if (!window.confirm(t("decks.confirmDelete"))) {
      return;
    }

    try {
      const result = await deckService.deleteDeck(deckId);
      if (result.success) {
        setDecks(decks.filter((deck) => deck.id !== deckId));
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Fonctions pour l'export
  const handleExportDeck = (deck) => {
    setSelectedDeckForExport(deck);
    setIsExportModalOpen(true);
  };

  const showNotification = (message, type) => {
    setNotification({ isVisible: true, message, type });
  };

  const hideNotification = () => {
    setNotification({ ...notification, isVisible: false });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-mage-bg-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            {t("auth.loginRequired")}
          </h2>
          <p className="text-gray-400 mb-6">{t("decks.loginMessage")}</p>
          <Link
            to="/login"
            className="bg-mage-dark-600 hover:bg-mage-dark-500 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            {t("nav.login")}
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-mage-bg-900 flex items-center justify-center">
        <div className="text-white">
          <div className="animate-spin w-8 h-8 border-2 border-gray-400 border-t-white rounded-full mx-auto mb-4"></div>
          {t("common.loading")}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mage-bg-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t("decks.title")}</h1>
            <p className="text-gray-400">{t("decks.subtitle")}</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-md transition-colors duration-200 flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
              {t("decks.importDeck")}
            </button>
            <button
              onClick={handleCreateDeck}
              disabled={isCreating}
              className="bg-mage-dark-600 hover:bg-mage-dark-500 disabled:bg-mage-dark-700 text-white font-medium py-3 px-6 rounded-md transition-colors duration-200 flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {isCreating
                ? t("common.creating") || "Création..."
                : t("decks.createNew")}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-md">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Decks Grid */}
        {decks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎴</div>
            <h3 className="text-xl font-semibold mb-2">{t("decks.noDecks")}</h3>
            <p className="text-gray-400 mb-6">{t("decks.noDecksMessage")}</p>
            <button
              onClick={handleCreateDeck}
              disabled={isCreating}
              className="bg-mage-dark-600 hover:bg-mage-dark-500 disabled:bg-mage-dark-700 text-white font-medium py-3 px-6 rounded-md transition-colors duration-200"
            >
              {isCreating
                ? t("common.creating") || "Création..."
                : t("decks.createFirst")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {decks.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                onDelete={() => handleDeleteDeck(deck.id)}
                onExport={() => handleExportDeck(deck)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal d'importation */}
      <DeckImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={handleImportSuccess}
      />

      {/* Modal d'export */}
      <DeckExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        deck={selectedDeckForExport}
        onCopySuccess={(message) => showNotification(message, "success")}
        onCopyError={(message) => showNotification(message, "error")}
      />

      {/* Toast de notification */}
      <NotificationToast
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </div>
  );
};

const DeckCard = ({ deck, onDelete, onExport }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-mage-dark-800 rounded-lg p-4 hover:bg-mage-dark-700 transition-colors duration-200">
      {/* Image de la carte d'affichage avec boutons superposés */}
      <div className="relative flex justify-center mb-3">
        <div className="relative">
          {deck.displayImageUrl ? (
            <div className="overflow-hidden rounded-lg shadow-lg transition-all duration-200 relative hover:scale-105">
              <div className="w-64 h-32 relative overflow-hidden rounded-lg">
                <img
                  src={deck.displayImageUrl}
                  alt={deck.name}
                  className="w-full h-full object-cover object-center"
                  style={{
                    objectPosition: "center 40%",
                  }}
                  onError={(e) => {
                    e.target.parentElement.parentElement.style.display = "none";
                    e.target.parentElement.parentElement.parentElement.nextSibling.style.display =
                      "flex";
                  }}
                />
              </div>
            </div>
          ) : null}
          <div
            className="w-64 h-48 bg-mage-dark-600 rounded-md border border-mage-dark-500 flex items-center justify-center"
            style={{ display: deck.displayImageUrl ? "none" : "flex" }}
          >
            <svg
              className="w-16 h-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Boutons d'action superposés */}
          <div className="absolute bottom-2 right-2 flex space-x-1 bg-black/50 backdrop-blur-sm rounded-md p-1">
            {/* Compteur de cartes */}
            <div className="p-1.5 bg-gray-600 text-white rounded flex items-center space-x-1 text-xs font-medium">
              <CreditCard size={12} />
              <span>{deck.totalCards || 0}</span>
            </div>

            <Link
              to={`/decks/${deck.id}/visualization`}
              className="p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
              title={t("decks.view")}
            >
              <Eye size={14} />
            </Link>

            <Link
              to={`/decks/${deck.id}/edit`}
              className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              title={t("decks.edit")}
            >
              <Pencil size={14} />
            </Link>

            <button
              onClick={onExport}
              className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
              title={t("decks.export")}
            >
              <Download size={14} />
            </button>

            <button
              onClick={onDelete}
              className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              title={t("decks.delete")}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Titre du deck */}
      <h3 className="text-lg font-semibold text-white text-center">
        {deck.name}
      </h3>
    </div>
  );
};

export default DecksPage;
