import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { ArrowLeft, CheckCircle } from "lucide-react";
import deckService from "../services/deckService";
import gameService from "../services/gameService";
import CardBrowser from "./CardBrowser";
import { useAutoSave } from "../hooks/useAutoSave";

const DeckForm = ({ isEdit = false }) => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  // Deck metadata state
  const [deck, setDeck] = useState({
    name: "",
    description: "",
    gameId: "mage_noir", // Force le jeu à mage_noir
  });

  // Current deck cards state
  const [deckCards, setDeckCards] = useState([]);
  const [browserCards, setBrowserCards] = useState([]); // Array to store fresh card data from CardBrowser
  const [originalCardIds, setOriginalCardIds] = useState([]); // Store original deck card IDs and quantities for cross-referencing only

  // Validation state
  const [validationRules, setValidationRules] = useState(null);
  const [validationStatus, setValidationStatus] = useState({
    isValid: true,
    violations: [],
    totalCards: 0,
    uniqueCards: 0,
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCards, setSelectedCards] = useState(new Set());

  // NOUVEAU : Auto-save hook
  const { isSaving, lastSaved } = useAutoSave(
    { deck, deckCards },
    async (data) => {
      if (isEdit && id && data.deck.name.trim()) {
        try {
          console.log("🔄 Auto-save déclenchée pour deck:", id);
          await deckService.updateDeck(id, {
            name: data.deck.name,
            description: data.deck.description,
            gameId: data.deck.gameId || "mage_noir",
            cards: data.deckCards.map((deckCard) => ({
              cardId: deckCard.id,
              quantity: deckCard.quantity,
            })),
          });
          console.log("✅ Auto-save réussie");
        } catch (error) {
          console.error("❌ Erreur auto-save:", error);
          throw error;
        }
      }
    },
    1500
  );

  // États pour gestion image au survol
  const [hoveredCard, setHoveredCard] = useState(null);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [hoveredCardPosition, setHoveredCardPosition] = useState({
    top: 0,
    left: 0,
  });

  // Gestion d'erreur de chargement d'image
  const handleImageError = (cardId) => {
    setImageErrors((prev) => new Set([...prev, cardId]));
  };

  // Calcul position dynamique pour éviter débordement
  const calculateImagePosition = (cardElement) => {
    if (!cardElement) return { top: 0, left: 0 };

    const rect = cardElement.getBoundingClientRect();
    const imageHeight = 420; // Hauteur approximative de l'image agrandie (50% de plus)
    const imageWidth = 288; // Largeur de l'image (w-72 = 18rem = 288px)
    const viewportTop = 0;
    const margin = 16; // Marge entre l'image et la carte

    // Position de base : à gauche de la carte
    let left = rect.left - imageWidth - margin;
    let top = rect.top;

    // Si l'image déborde à gauche, la positionner à droite
    if (left < 0) {
      left = rect.right + margin;
    }

    // Si l'image déborde en haut, l'ajuster vers le bas
    if (top < viewportTop) {
      top = Math.max(viewportTop + margin, rect.bottom - imageHeight);
    }

    // Si l'image déborde en bas, l'ajuster vers le haut
    const viewportBottom = window.innerHeight;
    if (top + imageHeight > viewportBottom) {
      top = Math.max(
        viewportTop + margin,
        viewportBottom - imageHeight - margin
      );
    }

    return { top, left };
  };

  // Obtenir URL d'image avec fallback
  const getCardImageUrl = (card) => {
    if (imageErrors.has(card.id) || !card.imageUrl) {
      return "/images/placeholder.png";
    }

    return card.imageUrl;
  };

  // Helper components
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
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">
          {t("auth.loginRequired")}
        </h2>
        <p className="text-gray-400">{t("decks.form.loginMessage")}</p>
      </div>
    </div>
  );

  const ErrorMessage = ({ error }) => (
    <div className="p-3 bg-red-900/50 border border-red-500 rounded-md flex-shrink-0">
      <div className="flex items-center">
        <svg
          className="w-4 h-4 text-red-400 mr-2 flex-shrink-0"
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
  );

  // Load ruleset data at component initialization
  useEffect(() => {
    const loadRuleset = async () => {
      try {
        const rulesetResult = await gameService.getGameRuleset("mage_noir");
        if (rulesetResult.success) {
          setValidationRules(rulesetResult.data);
        } else {
          console.warn("Could not load ruleset:", rulesetResult.error);
        }
      } catch (error) {
        console.error("Error loading ruleset:", error);
      }
    };

    loadRuleset();
  }, []);

  // Load deck data for editing
  useEffect(() => {
    if (isEdit && id) {
      fetchDeckData();
    }
  }, [isEdit, id]);

  // Validation locale avec calcul du nombre total de cartes
  const validateDeckLocally = (deckCards, rules) => {
    const totalCards = deckCards.reduce((sum, card) => sum + card.quantity, 0);
    const violations = [];

    if (rules) {
      // Vérifier minimum de cartes
      if (totalCards < rules.minCards) {
        violations.push({
          type: "ERROR",
          messageCode: "deck.min_cards",
          message: `Minimum ${rules.minCards} cartes requis, actuel: ${totalCards}`,
          params: [rules.minCards, totalCards],
        });
      }

      // Vérifier maximum par carte
      deckCards.forEach((card) => {
        if (card.quantity > rules.maxCopiesPerCard) {
          violations.push({
            type: "ERROR",
            messageCode: "deck.max_copies",
            message: `${card.name || card.id} dépasse le maximum de ${
              rules.maxCopiesPerCard
            } exemplaires`,
            params: [
              card.name || card.id,
              rules.maxCopiesPerCard,
              card.quantity,
            ],
          });
        }
      });
    }

    return {
      isValid: violations.length === 0,
      violations,
      totalCards,
      uniqueCards: deckCards.length,
    };
  };

  // Validation automatique à chaque changement de cartes ou de règles
  useEffect(() => {
    const validation = validateDeckLocally(deckCards, validationRules);
    setValidationStatus(validation);
  }, [deckCards, validationRules]);

  // Update deck cards with fresh browser card data when available (for language switching)
  useEffect(() => {
    if (browserCards.length > 0 && originalCardIds.length > 0) {
      // Cross-reference original deck card IDs with fresh browser card data
      const updatedDeckCards = originalCardIds.map((deckCard) => {
        const freshCard = browserCards.find(
          (browserCard) => browserCard.id === deckCard.id
        );
        if (freshCard) {
          // Use fresh card data with preserved quantity
          return { ...freshCard, quantity: deckCard.quantity };
        }
        // Fallback to original data if fresh card not found
        return deckCard;
      });
      setDeckCards(updatedDeckCards);
    }
  }, [browserCards, originalCardIds]);

  const fetchDeckData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await deckService.getDeck(id);
      if (result.success) {
        const deckData = result.data;
        setDeck({
          name: deckData.name,
          description: deckData.description || "",
          gameId: "mage_noir", // Force le jeu à mage_noir même en édition
        });

        // Transform deck cards for display
        const cards =
          deckData.cards?.map((deckCard) => ({
            ...deckCard.card,
            id: deckCard.cardId, // Use cardId for cross-referencing
            quantity: deckCard.quantity,
          })) || [];

        setDeckCards(cards);

        // Store original card IDs and quantities for cross-referencing with fresh language data
        setOriginalCardIds(
          deckData.cards?.map((deckCard) => ({
            id: deckCard.cardId, // Use cardId to match with deckCards
            quantity: deckCard.quantity,
          })) || []
        );

        // Create selected cards set for CardBrowser
        setSelectedCards(new Set(cards.map((card) => card.id)));

        // Récupérer les règles via validation du deck existant
        const validationResult = await gameService.validateDeck({
          name: deckData.name,
          description: deckData.description || "",
          gameId: "mage_noir",
          cards:
            deckData.cards?.map((deckCard) => ({
              cardId: deckCard.cardId,
              quantity: deckCard.quantity,
            })) || [],
        });

        if (validationResult.success && validationResult.data.appliedRules) {
          setValidationRules(validationResult.data.appliedRules);
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCardSelectionChange = (
    cardId,
    isSelected,
    quantity = 1,
    cardData
  ) => {
    const newSelectedCards = new Set(selectedCards);

    if (isSelected) {
      newSelectedCards.add(cardId);
      // Add card to deck with quantity using fresh card data from CardBrowser
      setDeckCards((prev) => {
        const existing = prev.find((card) => card.id === cardId);
        if (existing) {
          return prev.map((card) =>
            card.id === cardId
              ? { ...cardData, quantity: Math.max(1, quantity) }
              : card
          );
        } else {
          // Use fresh card data from CardBrowser
          return [...prev, { ...cardData, quantity: Math.max(1, quantity) }];
        }
      });

      // Also update originalCardIds to keep cross-referencing working
      setOriginalCardIds((prev) => {
        const existing = prev.find((card) => card.id === cardId);
        if (existing) {
          return prev.map((card) =>
            card.id === cardId
              ? { ...card, quantity: Math.max(1, quantity) }
              : card
          );
        } else {
          return [...prev, { id: cardId, quantity: Math.max(1, quantity) }];
        }
      });
    } else {
      newSelectedCards.delete(cardId);
      // Remove card from deck
      setDeckCards((prev) => prev.filter((card) => card.id !== cardId));
      // Also remove from originalCardIds
      setOriginalCardIds((prev) => prev.filter((card) => card.id !== cardId));
    }

    setSelectedCards(newSelectedCards);
  };

  const updateCardQuantity = (cardId, quantity) => {
    if (quantity <= 0) {
      handleCardSelectionChange(cardId, false);
      return;
    }

    setDeckCards((prev) =>
      prev.map((card) =>
        card.id === cardId ? { ...card, quantity: Math.max(1, quantity) } : card
      )
    );

    // Also update originalCardIds to keep sync
    setOriginalCardIds((prev) =>
      prev.map((card) =>
        card.id === cardId ? { ...card, quantity: Math.max(1, quantity) } : card
      )
    );
  };

  const removeCardFromDeck = (cardId) => {
    handleCardSelectionChange(cardId, false);
  };

  if (!isAuthenticated) {
    return <AuthRequired />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  const totalCards = deckCards.reduce((sum, card) => sum + card.quantity, 0);

  return (
    <div className="bg-mage-bg-900 text-white">
      <div className="w-full px-6 py-4 h-[calc(105vh-6rem)] flex flex-col">
        {/* NOUVEAU : Header avec bouton retour et indicateur auto-save */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/decks")}
              className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              title={t("common.back")}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-white">
              {isEdit ? t("decks.form.editTitle") : t("decks.form.createTitle")}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Indicateur auto-save */}
            <div className="flex items-center gap-2 text-sm">
              {isSaving ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span className="text-blue-400">{t("common.saving")}</span>
                </>
              ) : lastSaved ? (
                <>
                  <CheckCircle size={16} className="text-green-400" />
                  <span className="text-green-400">
                    {t("common.autoSaved")} {lastSaved.toLocaleTimeString()}
                  </span>
                </>
              ) : null}
            </div>

            {/* Bouton Vue Visualisation */}
            {isEdit && (
              <button
                onClick={() => navigate(`/decks/${id}/visualization`)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
                title={t("decks.form.goToVisualization")}
              >
                📊 {t("decks.form.viewVisualization")}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 h-full overflow-hidden">
          {/* Error Message */}
          {error && <ErrorMessage error={error} />}

          {/* Sélection de cartes (gauche 75%) + Deck actuel (droite 25%) */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
            {/* Zone 3: Sélection de cartes (gauche - 3/4 = 75%) */}
            <div className="lg:col-span-3 bg-transparent rounded-lg p-6 flex flex-col min-h-0">
              <div className="flex-1 overflow-hidden">
                <CardBrowser
                  onCardSelection={handleCardSelectionChange}
                  selectedCards={selectedCards}
                  allowMultiSelect={true}
                  gameId={deck.gameId}
                  showTitle={false}
                  className="h-full"
                  maxColumns={6}
                  onCardsLoaded={setBrowserCards}
                />
              </div>
            </div>

            {/* Zone 2: Deck actuel (droite - 1/4 = 25%) */}
            <div className="lg:col-span-1 bg-transparent rounded-lg p-6 flex flex-col min-h-0">
              <div className="mb-4 flex-shrink-0">
                {/* Nom du deck éditable */}
                <div className="mb-3 relative">
                  <input
                    type="text"
                    value={deck.name}
                    onChange={(e) => setDeck({ ...deck, name: e.target.value })}
                    className="w-full text-xl font-semibold bg-transparent border-b-2 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors pb-1 pr-6"
                    placeholder={t("decks.form.namePlaceholder")}
                    required
                  />
                  <svg
                    className="absolute right-1 top-1 w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </div>

                {/* Statistiques avec indicateurs de validation */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">
                      {t("decks.form.totalCards")}
                    </span>
                    <span
                      className={`${
                        validationRules &&
                        validationStatus.totalCards < validationRules.minCards
                          ? "text-red-400"
                          : "text-white"
                      }`}
                    >
                      {validationStatus.totalCards}/
                      {validationRules?.minCards || 0}
                    </span>
                  </div>
                </div>
              </div>

              {deckCards.length === 0 ? (
                <div className="text-center py-4 flex-1 flex flex-col justify-center">
                  <div className="text-3xl mb-2">🃏</div>
                  <p className="text-gray-400 text-sm">
                    {t("decks.form.noDeckCards")}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {t("decks.form.selectCardsBelow")}
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                  {deckCards.map((card) => {
                    // Vérifier si cette carte dépasse la limite
                    const exceedsLimit =
                      validationRules &&
                      card.quantity > validationRules.maxCopiesPerCard;

                    return (
                      <div
                        key={card.id}
                        className={`relative flex items-center justify-between p-1.5 rounded text-xs transition-colors ${
                          exceedsLimit
                            ? "bg-red-900/50 border border-red-500/50"
                            : "bg-mage-dark-700"
                        }`}
                        onMouseEnter={(e) => {
                          setHoveredCard(card);
                          const position = calculateImagePosition(
                            e.currentTarget
                          );
                          setHoveredCardPosition(position);
                        }}
                        onMouseLeave={() => {
                          setHoveredCard(null);
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-medium truncate leading-tight ${
                              exceedsLimit ? "text-red-300" : "text-white"
                            }`}
                          >
                            {card.name || `${card.id}`}
                            {exceedsLimit && (
                              <span className="text-red-400 ml-1 text-xs">
                                (max: {validationRules.maxCopiesPerCard})
                              </span>
                            )}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-0.5 ml-1.5">
                          <button
                            onClick={() =>
                              updateCardQuantity(card.id, card.quantity - 1)
                            }
                            className="w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded text-xs flex items-center justify-center transition-colors"
                          >
                            -
                          </button>
                          <span
                            className={`w-5 text-center font-semibold text-xs ${
                              exceedsLimit ? "text-red-300" : "text-white"
                            }`}
                          >
                            {card.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCardQuantity(card.id, card.quantity + 1)
                            }
                            disabled={
                              validationRules &&
                              card.quantity >= validationRules.maxCopiesPerCard
                            }
                            className={`w-5 h-5 text-white rounded text-xs flex items-center justify-center transition-colors ${
                              validationRules &&
                              card.quantity >= validationRules.maxCopiesPerCard
                                ? "bg-gray-500 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeCardFromDeck(card.id)}
                            className="w-5 h-5 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs flex items-center justify-center transition-colors ml-1"
                          >
                            ×
                          </button>
                        </div>

                        {/* Image au survol */}
                        {hoveredCard?.id === card.id && (
                          <div
                            className="fixed z-[9999] pointer-events-none transition-opacity duration-200"
                            style={{
                              left: `${hoveredCardPosition.left}px`,
                              top: `${hoveredCardPosition.top}px`,
                            }}
                          >
                            <img
                              src={getCardImageUrl(card)}
                              alt={card.name || card.id}
                              className="w-72 h-auto rounded-lg shadow-2xl bg-gray-800"
                              onError={() => {
                                handleImageError(card.id);
                              }}
                              onLoad={() => {
                                // Retirer de la liste d'erreur si l'image se charge avec succès
                                setImageErrors((prev) => {
                                  const newSet = new Set(prev);
                                  newSet.delete(card.id);
                                  return newSet;
                                });
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Boutons d'action */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckForm;
