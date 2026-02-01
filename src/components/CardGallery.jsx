import React, { useState } from "react";
import UniversalImage from "./UniversalImage";
import { ExternalLink } from "lucide-react";

const CardGallery = ({
  cards,
  loading,
  error,
  onCardClick = null,
  showSelection = false,
  selectedCards = [],
  maxColumns = null, // Limite le nombre de colonnes (contrôles de zoom)
  showImagePreview = true, // Affichage de l'aperçu d'image au survol
}) => {
  // Fonction pour gérer la redirection vers le site officiel
  const handleCardRedirect = (cardUrl, event) => {
    event.stopPropagation(); // Empêche le déclenchement du onClick de la carte
    if (cardUrl) {
      window.open(cardUrl, "_blank", "noopener,noreferrer");
    }
  };
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
    const imageHeight = 420; // Hauteur approximative de l'image agrandie
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
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">Chargement des cartes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">Erreur: {error}</div>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-400">Aucune carte trouvée</div>
      </div>
    );
  }

  // Classes CSS basées sur le nombre de colonnes choisi
  const getGridClasses = () => {
    switch (maxColumns) {
      case 6:
        return "grid grid-cols-6 gap-6 pb-4 pt-3 pl-3";
      case 7:
        return "grid grid-cols-7 gap-6 pb-4 pt-3 pl-3";
      case 8:
        return "grid grid-cols-8 gap-6 pb-4 pt-3 pl-3";
      case 9:
        return "grid grid-cols-9 gap-6 pb-4 pt-3 pl-3";
      case 10:
        return "grid grid-cols-10 gap-6 pb-4 pt-3 pl-3";
      default:
        // Grille responsive par défaut
        return "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 gap-10 pb-4";
    }
  };

  return (
    <div className={getGridClasses()}>
      {cards.map((card) => {
        const isSelected =
          showSelection &&
          selectedCards.some((selectedCard) => selectedCard.id === card.id);

        return (
          <div
            key={card.id}
            className={`overflow-hidden rounded-lg shadow-lg transition-all duration-200 relative group ${
              onCardClick ? "cursor-pointer hover:scale-105" : ""
            } ${isSelected ? "ring-4 ring-blue-500" : ""}`}
            onClick={() => onCardClick && onCardClick(card)}
            onMouseEnter={
              showImagePreview
                ? (e) => {
                    setHoveredCard(card);
                    const position = calculateImagePosition(e.currentTarget);
                    setHoveredCardPosition(position);
                  }
                : undefined
            }
            onMouseLeave={
              showImagePreview
                ? () => {
                    setHoveredCard(null);
                  }
                : undefined
            }
          >
            <UniversalImage
              src={card.imageUrl}
              alt={card.name}
              className="w-full h-auto object-cover"
            />
            {isSelected && (
              <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                ✓
              </div>
            )}

            {/* Bouton de redirection en overlay (pattern DecksPage) */}
            {card.cardUrl && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => handleCardRedirect(card.cardUrl, e)}
                  className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors border-0 outline-none focus:outline-none shadow-none"
                  title="Voir sur le site officiel"
                  aria-label="Voir sur le site officiel"
                >
                  <ExternalLink size={14} />
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Image au survol */}
      {showImagePreview && hoveredCard && (
        <div
          className="fixed z-[9999] pointer-events-none transition-opacity duration-200"
          style={{
            left: `${hoveredCardPosition.left}px`,
            top: `${hoveredCardPosition.top}px`,
          }}
        >
          <img
            src={getCardImageUrl(hoveredCard)}
            alt={hoveredCard.name}
            className="w-72 h-auto rounded-lg shadow-2xl bg-gray-800"
            onError={() => {
              handleImageError(hoveredCard.id);
            }}
            onLoad={() => {
              // Retirer de la liste d'erreur si l'image se charge avec succès
              setImageErrors((prev) => {
                const newSet = new Set(prev);
                newSet.delete(hoveredCard.id);
                return newSet;
              });
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CardGallery;
