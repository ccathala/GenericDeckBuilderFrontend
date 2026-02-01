import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DeckVisualizationView from "../components/DeckVisualizationView";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import deckService from "../services/deckService";

const DeckVisualizationPage = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [deck, setDeck] = useState(null);
  const [deckCards, setDeckCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper component
  const LoadingSpinner = () => (
    <div className="min-h-screen bg-mage-bg-900 flex items-center justify-center">
      <div className="text-white">
        <div className="animate-spin w-8 h-8 border-2 border-gray-400 border-t-white rounded-full mx-auto mb-4"></div>
        {t("common.loading")}
      </div>
    </div>
  );

  const AuthRequired = () => (
    <div className="min-h-screen bg-mage-bg-900 flex items-center justify-center">
      <div className="text-white text-xl">{t("common.authRequired")}</div>
    </div>
  );

  // Load deck data
  useEffect(() => {
    const loadDeck = async () => {
      if (!id || !isAuthenticated) return;

      try {
        setLoading(true);
        setError(null);

        const result = await deckService.getDeck(id);
        if (result.success) {
          const deckData = result.data;
          setDeck(deckData);

          // Transform deck cards for display
          const cards =
            deckData.cards?.map((deckCard) => ({
              ...deckCard.card,
              id: deckCard.cardId,
              quantity: deckCard.quantity,
            })) || [];

          setDeckCards(cards);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDeck();
  }, [id, isAuthenticated]);

  // Update card function
  const updateCard = async (cardId, newQuantity) => {
    try {
      // Update local state
      setDeckCards((prev) =>
        prev.map((card) =>
          card.id === cardId ? { ...card, quantity: newQuantity } : card
        )
      );

      // Update on server
      const deckData = {
        ...deck,
        cards: deckCards.map((card) => ({
          cardId: card.id,
          quantity: card.id === cardId ? newQuantity : card.quantity,
        })),
      };

      await deckService.updateDeck(id, deckData);
    } catch (err) {
      console.error("Error updating card:", err);
      setError(err.message);
    }
  };

  if (!isAuthenticated) {
    return <AuthRequired />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-mage-bg-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Erreur : {error}</div>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="min-h-screen bg-mage-bg-900 flex items-center justify-center">
        <div className="text-white text-xl">Deck non trouvé</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mage-bg-900 p-4">
      <DeckVisualizationView
        deckId={id}
        deckCards={deckCards}
        onCardUpdate={updateCard}
      />
    </div>
  );
};

export default DeckVisualizationPage;
