import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import deckService from "../services/deckService";

const DeckDetailPage = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [deck, setDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchDeck();
    }
  }, [isAuthenticated, id]);

  const fetchDeck = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await deckService.getDeck(id);
      if (result.success) {
        setDeck(result.data);
      } else {
        setError(result.error);
        if (result.error === "Deck not found" || result.status === 404) {
          navigate("/decks");
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDeck = async () => {
    if (!window.confirm(t("decks.confirmDelete"))) {
      return;
    }

    try {
      const result = await deckService.deleteDeck(id);
      if (result.success) {
        navigate("/decks");
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-mage-bg-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            {t("auth.loginRequired")}
          </h2>
          <p className="text-gray-400">{t("decks.detail.loginMessage")}</p>
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

  if (error || !deck) {
    return (
      <div className="min-h-screen bg-mage-bg-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            {t("decks.detail.notFound")}
          </h2>
          <p className="text-gray-400 mb-6">
            {error || t("decks.detail.notFoundMessage")}
          </p>
          <Link
            to="/decks"
            className="bg-mage-dark-600 hover:bg-mage-dark-500 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            {t("decks.detail.backToDecks")}
          </Link>
        </div>
      </div>
    );
  }

  const totalCards =
    deck.cards?.reduce((sum, deckCard) => sum + deckCard.quantity, 0) || 0;
  const uniqueCards = deck.cards?.length || 0;

  return (
    <div className="min-h-screen bg-mage-bg-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            <div className="flex items-center mb-4">
              <Link
                to="/decks"
                className="text-gray-400 hover:text-white transition-colors mr-4"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Link>
              <h1 className="text-3xl font-bold">{deck.name}</h1>
              {deck.isPublic && (
                <span className="ml-3 px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
                  {t("decks.detail.public")}
                </span>
              )}
            </div>
            {deck.description && (
              <p className="text-gray-400 text-lg mb-4">{deck.description}</p>
            )}
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                {uniqueCards} {t("decks.detail.uniqueCards")}
              </div>
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                  />
                </svg>
                {totalCards} {t("decks.detail.totalCards")}
              </div>
              {/* Toujours afficher Mage Noir puisque l'app est dédiée à ce jeu */}
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                Mage Noir
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Link
              to={`/decks/${deck.id}/edit`}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              {t("decks.edit")}
            </Link>
            <button
              onClick={handleDeleteDeck}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              {t("decks.delete")}
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

        {/* Deck Cards */}
        <div className="bg-mage-dark-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">
            {t("decks.detail.cardList")}
          </h2>

          {!deck.cards || deck.cards.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🃏</div>
              <h3 className="text-xl font-semibold mb-2">
                {t("decks.detail.noCards")}
              </h3>
              <p className="text-gray-400 mb-6">
                {t("decks.detail.noCardsMessage")}
              </p>
              <Link
                to={`/decks/${deck.id}/edit`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition-colors duration-200"
              >
                {t("decks.detail.addCards")}
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {deck.cards.map((deckCard) => (
                <div
                  key={deckCard.id}
                  className="flex items-center justify-between p-4 bg-mage-dark-700 rounded-md hover:bg-mage-dark-600 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="text-lg font-semibold text-white mr-4">
                        {deckCard.quantity}x
                      </span>
                      <div>
                        <h3 className="font-medium text-white">
                          {deckCard.card.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          {deckCard.card.manaCost && (
                            <span>
                              {t("cards.manaCost")}: {deckCard.card.manaCost}
                            </span>
                          )}
                          {deckCard.card.type && (
                            <span>
                              {t("cards.type")}: {deckCard.card.type}
                            </span>
                          )}
                          {deckCard.card.rarity && (
                            <span>
                              {t("cards.rarity")}: {deckCard.card.rarity}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {deckCard.card.description && (
                      <p className="text-gray-400 text-sm mt-2 ml-16">
                        {deckCard.card.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deck Statistics */}
        {deck.cards && deck.cards.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-mage-dark-800 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {uniqueCards}
              </div>
              <div className="text-gray-400">
                {t("decks.detail.uniqueCards")}
              </div>
            </div>
            <div className="bg-mage-dark-800 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {totalCards}
              </div>
              <div className="text-gray-400">
                {t("decks.detail.totalCards")}
              </div>
            </div>
            <div className="bg-mage-dark-800 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {totalCards > 0 ? (totalCards / uniqueCards).toFixed(1) : "0"}
              </div>
              <div className="text-gray-400">
                {t("decks.detail.averageQuantity")}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeckDetailPage;
