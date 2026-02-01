import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useDeckVisualization } from "../hooks/useDeckVisualization";
import { Plus, Pencil, ArrowLeft } from "lucide-react";
import NotesPanel from "./NotesPanel";
import DeckColumn from "./DeckColumn";

// Styles CSS pour l'affichage des images de cartes
const cardImageStyles = `
  .deck-card-image {
    position: relative;
    width: 100%;
    margin-bottom: -95%;
    cursor: grab;
    transition: transform 0.2s ease;
    z-index: 1;
  }

  .deck-card-image:first-child {
    margin-bottom: -95%;
  }

  .deck-card-image:last-child {
    margin-bottom: 8px;
  }

  .deck-card-image:hover {
    transform: scale(1.02) translateY(-10px);
    z-index: 10;
  }

  .deck-card-image:active {
    cursor: grabbing;
  }

  .card-image {
    width: 100%;
    height: auto;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.2);
    border: 2px solid transparent;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    display: block;
  }

  .card-image:hover {
    border-color: #8B5CF6;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.6), 0 4px 8px rgba(0, 0, 0, 0.4);
  }

  .quantity-badge {
    position: absolute;
    top: 1%;
    right: 1%;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    border-radius: 50%;
    width: 12%;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: clamp(10px, 2.5vw, 16px);
    font-weight: bold;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  .deck-column {
    flex: 1;
    min-width: 120px;
    max-width: none;
  }

  .drop-indicator {
    height: 4px;
    background: linear-gradient(90deg, #8B5CF6, #A855F7);
    border-radius: 2px;
    margin: 2px 0;
    box-shadow: 0 0 8px rgba(139, 92, 246, 0.6);
    animation: pulse 1s infinite;
    position: relative;
    z-index: 1000;
    width: 100%;
  }

  .drop-indicator-container {
    position: relative;
    width: 100%;
    z-index: 1000;
    margin: 0;
    height: 4px;
    pointer-events: none;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 1; }
  }

  /* Styles pour le drag & drop des colonnes */
  .deck-column.dragging {
    opacity: 0.5;
    transform: scale(0.98);
  }

  .deck-column.drop-target::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(180deg, #8B5CF6, #A855F7);
    border-radius: 2px;
    box-shadow: 0 0 15px rgba(139, 92, 246, 0.8);
    z-index: 100;
    animation: pulse 1s infinite;
  }

  .deck-column.drop-target-left::before {
    left: -2px;
  }

  .deck-column.drop-target-right::before {
    right: -2px;
  }

  .deck-column:hover {
    background: rgba(255, 255, 255, 0.05);
    transition: background-color 0.2s ease;
  }
`;

const DeckVisualizationView = ({ deckId, deckCards, onCardUpdate }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  // États pour gestion image au survol
  const [hoveredCard, setHoveredCard] = useState(null);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [hoverPreviewEnabled, setHoverPreviewEnabled] = useState(true);
  const [hoveredCardPosition, setHoveredCardPosition] = useState({
    top: 0,
    left: 0,
  });
  const {
    visualization,
    loading,
    error,
    createColumn,
    updateColumn,
    deleteColumn,
    moveCard,
    reorderColumns,
    updateColumnDisplayOrder, // Fonction manquante ajoutée
    clearError,
  } = useDeckVisualization(deckId);

  // État local pour le drag & drop
  const [draggedCard, setDraggedCard] = useState(null);
  const [draggedColumn, setDraggedColumn] = useState(null); // Nouvel état pour le drag de colonne
  const [dropIndicator, setDropIndicator] = useState(null); // { columnId, position }
  const [columnDropIndicator, setColumnDropIndicator] = useState(null); // Nouvel indicateur pour les colonnes
  const [showCreateColumnModal, setShowCreateColumnModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [createColumnError, setCreateColumnError] = useState(null); // Erreur spécifique au modal

  // Gestion de la création de colonne
  const handleCreateColumn = async () => {
    setCreateColumnError(null); // Clear l'erreur avant de tenter

    const columnName =
      newColumnName.trim() || t("decks.visualization.newColumnName");
    const result = await createColumn(columnName);

    if (result.success) {
      // Succès : Reset du formulaire et fermeture du modal
      setNewColumnName("");
      setShowCreateColumnModal(false);
      setCreateColumnError(null);
    } else {
      // Erreur : Afficher l'erreur dans le modal sans le fermer
      setCreateColumnError(result.error);
    }
  };

  // Gestion du drag & drop des cartes
  const handleDragStart = (e, card, sourceColumnId) => {
    console.log("🎯 Drag start - Card ID:", card.id);
    setHoverPreviewEnabled(false); // Désactive l'aperçu au survol
    setHoveredCard(null); // Force la fermeture si un aperçu était ouvert

    setDraggedCard({
      card,
      sourceColumnId,
    });

    e.dataTransfer.effectAllowed = "move";
  };

  // Gestion du drag & drop des colonnes
  const handleColumnDragStart = (e, columnId) => {
    // Vérifier si l'événement vient d'une carte (ne pas traiter les drag de cartes)
    if (e.target.closest('.deck-card-image')) {
      console.log("Ignorer drag de colonne - événement vient d'une carte");
      return;
    }
    
    console.log("🎯 Column drag start - Column ID:", columnId);
    setDraggedColumn(columnId);
    e.dataTransfer.effectAllowed = "move";
    
    // Ajouter un effet visuel pour la colonne en cours de déplacement
    e.currentTarget.style.opacity = "0.5";
  };

  const handleColumnDragEnd = (e) => {
    console.log("🎯 Column drag end");
    setDraggedColumn(null);
    setColumnDropIndicator(null);
    
    // Réinitialiser l'effet visuel
    e.currentTarget.style.opacity = "1";
  };

  const handleColumnDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (draggedColumn) {
      const targetColumnElement = e.currentTarget.closest('[data-column-id]');
      if (targetColumnElement) {
        const targetColumnId = targetColumnElement.getAttribute('data-column-id');
        if (targetColumnId !== draggedColumn) {
          // Calculer la position de drop relative
          const rect = targetColumnElement.getBoundingClientRect();
          const dropX = e.clientX;
          const columnCenter = rect.left + rect.width / 2;
          
          // Déterminer si on drop avant ou après la colonne cible
          const insertBefore = dropX < columnCenter;
          
          setColumnDropIndicator({
            targetColumnId,
            insertBefore,
            draggedColumnId: draggedColumn
          });
        }
      }
    }
  };

  const handleColumnDragLeave = (e) => {
    // Masquer l'indicateur seulement si on sort vraiment de la zone
    const currentTarget = e.currentTarget;
    const relatedTarget = e.relatedTarget;

    if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
      setColumnDropIndicator(null);
    }
  };

  const handleColumnDrop = async (e, targetColumnId) => {
    e.preventDefault();
    setColumnDropIndicator(null);

    if (!draggedColumn || draggedColumn === targetColumnId) {
      console.log("Pas de colonne déplacée ou même colonne, abandon");
      setDraggedColumn(null);
      return;
    }

    try {
      // Trouver les colonnes actuelles
      const columns = visualization?.column_groups || [];
      const draggedCol = columns.find(col => col.id === draggedColumn);
      const targetCol = columns.find(col => col.id === targetColumnId);
      
      if (!draggedCol || !targetCol) {
        console.error("Colonne source ou cible non trouvée");
        return;
      }

      // Trouver les index actuels
      const draggedIndex = columns.findIndex(col => col.id === draggedColumn);
      const targetIndex = columns.findIndex(col => col.id === targetColumnId);
      
      // Déterminer la nouvelle position basée sur l'indicateur
      const dropIndicator = columnDropIndicator;
      let newPosition = targetIndex;
      
      if (dropIndicator && dropIndicator.insertBefore && draggedIndex > targetIndex) {
        // Déplacer avant la colonne cible
        newPosition = targetIndex;
      } else if (dropIndicator && !dropIndicator.insertBefore && draggedIndex < targetIndex) {
        // Déplacer après la colonne cible
        newPosition = targetIndex + 1;
      } else if (draggedIndex < targetIndex) {
        // Déplacement vers la droite
        newPosition = targetIndex;
      } else {
        // Déplacement vers la gauche
        newPosition = targetIndex;
      }

      // Ajuster la position si nécessaire
      if (newPosition > columns.length - 1) {
        newPosition = columns.length - 1;
      }

      console.log(`Déplacement colonne ${draggedIndex} → ${newPosition}`);

      // Appeler l'API pour mettre à jour le displayOrder
      await updateColumnDisplayOrder(draggedColumn, newPosition);

    } catch (err) {
      console.error("❌ Erreur lors du déplacement de colonne:", err);
    } finally {
      setDraggedColumn(null);
    }
  };

  // Gestion des erreurs d'image
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
      return "/images/card-placeholder.png";
    }
    return card.imageUrl;
  };

  // Gestion du drag pour les images
  const handleDrag = (e) => {
    e.target.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    setHoverPreviewEnabled(true); // Réactive l'aperçu au survol
    e.target.style.opacity = "1";
    setDraggedCard(null);
    setDropIndicator(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    // Calculer et afficher l'indicateur en temps réel pendant le drag
    if (draggedCard) {
      const targetColumnId =
        e.currentTarget.getAttribute("data-column-id") ||
        e.currentTarget
          .closest("[data-column-id]")
          ?.getAttribute("data-column-id");
      if (targetColumnId) {
        calculateDropPosition(e, targetColumnId);
      }
    }
  };

  const handleDragLeave = (e) => {
    // Masquer l'indicateur seulement si on sort vraiment de la colonne
    // et qu'on ne va pas vers un élément enfant
    const currentTarget = e.currentTarget;
    const relatedTarget = e.relatedTarget;

    // Si relatedTarget est null (on sort de la fenêtre) ou
    // si relatedTarget n'est pas un enfant de currentTarget
    if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
      setDropIndicator(null);
    }
  };

  const handleDrop = async (e, targetColumnId) => {
    e.preventDefault();
    setDropIndicator(null); // Masquer l'indicateur après le drop

    console.log("=== DEBUG HANDLE DROP ===");
    console.log("draggedCard:", draggedCard);
    console.log("targetColumnId:", targetColumnId);

    if (!draggedCard) {
      console.log("Pas de carte déplacée, abandon");
      setDraggedCard(null);
      setDropIndicator(null);
      return;
    }

    try {
      console.log("=== DEBUG AVANT APPEL MOVE CARD ===");
      console.log("cardId:", draggedCard.card.id);
      console.log("sourceColumnId:", draggedCard.sourceColumnId);
      console.log("targetColumnId:", targetColumnId);

      // Calculer la position d'insertion basée sur la position du drop
      const dropPosition = calculateDropPosition(e, targetColumnId);
      console.log("Position calculée pour le drop:", dropPosition);

      // Vérifier si c'est un déplacement dans la même colonne
      if (draggedCard.sourceColumnId === targetColumnId) {
        const sourceColumn = visualization?.column_groups?.find(
          (col) => col.id === draggedCard.sourceColumnId
        );

        // CORRECTION : utiliser l'ID du DeckCard (pas card.card.id)
        const draggedCardDeckId = draggedCard.card.id; // ID du DeckCard
        const currentPosition = sourceColumn?.cards?.findIndex(
          (deckCard) => deckCard.id === draggedCardDeckId
        );

        console.log("DEBUG - draggedCard structure:", draggedCard.card);
        console.log("DEBUG - draggedCardDeckId:", draggedCardDeckId);
        console.log(
          "DEBUG - sourceColumn.cards[0] structure:",
          sourceColumn?.cards?.[0]
        );
        console.log("DEBUG - currentPosition:", currentPosition);
        console.log("DEBUG - dropPosition:", dropPosition);

        if (currentPosition === -1) {
          console.error("❌ Carte non trouvée dans la colonne source");
          setDraggedCard(null);
          setDropIndicator(null);
          return;
        }

        if (currentPosition === dropPosition) {
          console.log(
            "Même position dans la même colonne, pas de déplacement nécessaire"
          );
          setDraggedCard(null);
          setDropIndicator(null);
          return;
        }
        console.log(
          `Réorganisation dans la même colonne: ${currentPosition} → ${dropPosition}`
        );

        // ✅ CORRECTION : Appeler moveCard() aussi pour les déplacements intra-colonne
        console.log("🔄 Appel API moveCard pour intra-colonne...");
        await moveCard(
          draggedCard.card.id,
          draggedCard.sourceColumnId,
          targetColumnId,
          dropPosition
        );
        console.log("✅ Réorganisation intra-colonne réussie");
      } else {
        // Déplacement inter-colonne
        console.log("🔄 Déplacement inter-colonne, appel API moveCard...");
        await moveCard(
          draggedCard.card.id,
          draggedCard.sourceColumnId,
          targetColumnId,
          dropPosition
        );
        console.log("✅ Déplacement inter-colonne réussi");
      }
    } catch (err) {
      console.error("❌ Erreur lors du déplacement:", err);
    } finally {
      setDraggedCard(null);
      setDropIndicator(null); // S'assurer que l'indicateur disparaît toujours
    }
  };

  // Calculer la position d'insertion dans la pile (version simplifiée)
  const calculateDropPosition = (dropEvent, targetColumnId) => {
    const dropY = dropEvent.clientY;

    console.log("=== DEBUG CALCULATE DROP POSITION (SIMPLIFIÉ) ===");
    console.log("dropY:", dropY);
    console.log("targetColumnId:", targetColumnId);

    // Trouver la colonne cible
    const targetColumn = visualization?.column_groups?.find(
      (col) => col.id === targetColumnId
    );

    if (
      !targetColumn ||
      !targetColumn.cards ||
      targetColumn.cards.length === 0
    ) {
      console.log("Colonne vide, position = 0");
      return 0;
    }

    console.log(
      "Nombre de cartes dans la colonne cible:",
      targetColumn.cards.length
    );

    // Obtenir l'élément de la colonne
    const columnElement = dropEvent.currentTarget;
    const cardsContainer = columnElement.querySelector(".cards-container");

    if (!cardsContainer) {
      console.log("Container non trouvé, position = 0");
      return 0;
    }

    // Obtenir les dimensions du conteneur
    const containerRect = cardsContainer.getBoundingClientRect();
    const relativeY = dropY - containerRect.top;
    const containerHeight = containerRect.height;

    console.log("containerRect.top:", containerRect.top);
    console.log("containerHeight:", containerHeight);
    console.log("relativeY:", relativeY);

    // Diviser la zone en segments égaux selon le nombre de cartes + 1
    // +1 car on peut insérer avant la première carte, entre les cartes, ou après la dernière
    const numberOfSegments = targetColumn.cards.length + 1;
    const segmentHeight = containerHeight / numberOfSegments;

    console.log("numberOfSegments:", numberOfSegments);
    console.log("segmentHeight:", segmentHeight);

    // Calculer dans quel segment le drop a eu lieu
    const segmentIndex = Math.floor(relativeY / segmentHeight);
    const insertPosition = Math.max(
      0,
      Math.min(segmentIndex, targetColumn.cards.length)
    );

    console.log("segmentIndex calculé:", segmentIndex);
    console.log(
      "Position finale (simplifiée):",
      insertPosition,
      "/",
      targetColumn.cards.length
    );

    // Mettre à jour l'indicateur visuel
    setDropIndicator({
      columnId: targetColumnId,
      position: insertPosition,
    });

    return insertPosition;
  };

  // Rendu du loading
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-300">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  // Rendu des erreurs
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-red-400">
          <p className="text-lg font-semibold mb-2">{t("common.error")}</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <style>{cardImageStyles}</style>

      {/* Header avec titre et boutons */}
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
            {visualization?.deck_name || t("decks.visualization.title")}
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowCreateColumnModal(true);
              setCreateColumnError(null); // Clear l'erreur du modal quand on l'ouvre
              clearError(); // Clear l'erreur globale aussi
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={16} />
            {t("decks.visualization.addColumn")}
          </button>
          <button
            onClick={() => navigate(`/decks/${deckId}/edit`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
            title={t("decks.visualization.viewConstruction")}
          >
            <Pencil size={16} />
            {t("decks.visualization.viewConstruction")}
          </button>
        </div>
      </div>

      {/* Zone principale avec colonnes + panneau notes */}
      <div className="flex-1 flex min-h-0">
        {/* Zone des colonnes (flex-1 pour prendre l'espace restant) */}
        <div className="flex-1 flex gap-0 min-h-0 overflow-x-auto">
          <div className="flex gap-0 min-h-full">
            {visualization?.column_groups?.map((column, index) => (
              <DeckColumn
                key={column.id}
                column={column}
                onUpdateColumn={updateColumn}
                onDeleteColumn={deleteColumn}
                canDelete={visualization.column_groups.length > 1}
                hoverPreviewEnabled={hoverPreviewEnabled}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                draggedCard={draggedCard}
                handleDrag={handleDrag}
                handleDragEnd={handleDragEnd}
                handleImageError={handleImageError}
                dropIndicator={dropIndicator}
                isLastColumn={index === visualization.column_groups.length - 1}
                hoveredCard={hoveredCard}
                setHoveredCard={setHoveredCard}
                calculateImagePosition={calculateImagePosition}
                setHoveredCardPosition={setHoveredCardPosition}
                // Nouvelles props pour le drag & drop des colonnes
                onColumnDragStart={handleColumnDragStart}
                onColumnDragOver={handleColumnDragOver}
                onColumnDragLeave={handleColumnDragLeave}
                onColumnDrop={handleColumnDrop}
                onColumnDragEnd={handleColumnDragEnd}
                columnDropIndicator={columnDropIndicator}
                draggedColumn={draggedColumn}
              />
            ))}
          </div>

          {/* Message si aucune colonne */}
          {(!visualization?.column_groups ||
            visualization.column_groups.length === 0) && (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <p>Aucune colonne trouvée</p>
            </div>
          )}
        </div>

        {/* Panneau notes fixe à droite */}
        <NotesPanel deckId={deckId} />
      </div>

      {/* Modal de création de colonne */}
      {showCreateColumnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-mage-dark-800 rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              {t("decks.visualization.addColumn")}
            </h3>

            {/* Affichage de l'erreur du modal */}
            {createColumnError && (
              <div className="bg-red-600 text-white p-3 rounded mb-4 text-sm">
                {createColumnError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t("decks.visualization.columnName")}
                </label>
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => {
                    setNewColumnName(e.target.value);
                    if (createColumnError) setCreateColumnError(null); // Clear l'erreur du modal quand l'utilisateur tape
                  }}
                  placeholder={t("decks.visualization.newColumnName")}
                  className="w-full px-3 py-2 bg-mage-dark-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateColumnModal(false);
                  setNewColumnName("");
                  setCreateColumnError(null); // Clear l'erreur du modal
                  clearError(); // Clear l'erreur globale aussi
                }}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleCreateColumn}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                {t("decks.visualization.createColumn")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Aperçu d'image au survol */}
      {hoveredCard && (
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
          />
        </div>
      )}
    </div>
  );
};

export default DeckVisualizationView;