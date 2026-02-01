import React, { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import CardBrowser from "../components/CardBrowser";
import { getCardsByGame } from "../services/cardService";

const CardsPage = () => {
  const { t, currentLanguage } = useLanguage();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getCardsByGame("mage_noir", currentLanguage);
        setCards(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [currentLanguage]);

  return (
    <div className="min-h-screen bg-mage-bg-900 text-white">
      <div className="w-full max-w-none mx-auto px-4 py-8">
        <CardBrowser
          cards={cards}
          loading={loading}
          error={error}
          title={t("pages.cards.title")}
          showTitle={true}
        />
      </div>
    </div>
  );
};

export default CardsPage;
