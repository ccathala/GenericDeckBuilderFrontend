import React, { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const DeckColumn = ({
  column,
  onUpdateColumn,
  onDeleteColumn,
  hoverPreviewEnabled,
  canDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onDragLeave,
  draggedCard,
  handleDrag,
  handleDragEnd,
  handleImageError,
  dropIndicator,
  isLastColumn = false,
  hoveredCard,
  setHoveredCard,
  calculateImagePosition,
  setHoveredCardPosition,
  // Nouvelles props pour le drag & drop des colonnes
  onColumnDragStart,
  onColumnDragOver,
  onColumnDragLeave,
  onColumnDrop,
  onColumnDragEnd,
  columnDropIndicator,
  draggedColumn,
}) => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(column.name);

  const handleSave = async () => {
    try {
      await onUpdateColumn(column.id, {
        name: editName,
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Erreur lors de la modification:", err);
    }
  };

  const handleDelete = async () => {
    if (!canDelete) {
      alert(t("decks.visualization.cannotDeleteLastColumn"));
      return;
    }

    if (
      confirm(
        t("decks.visualization.confirmDeleteColumn", { name: column.name })
      )
    ) {
      try {
        await onDeleteColumn(column.id);
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
      }
    }
  };

  // Gestionnaire de drop combiné pour cartes et colonnes
  const handleDrop = (e) => {
    e.preventDefault();
    
    // Vérifier d'abord si on a un draggedColumn (priorité aux colonnes)
    if (draggedColumn && onColumnDrop) {
      onColumnDrop(e, column.id);
    } 
    // Sinon vérifier si on a un draggedCard
    else if (draggedCard && onDrop) {
      onDrop(e, column.id);
    }
  };

  // Gestionnaire de dragOver combiné
  const handleDragOver = (e) => {
    e.preventDefault();
    
    // Priorité au drag de colonne
    if (draggedColumn && onColumnDragOver) {
      onColumnDragOver(e);
    } else if (draggedCard && onDragOver) {
      onDragOver(e);
    }
  };

  // Gestionnaire de dragLeave combiné
  const handleDragLeave = (e) => {
    // Priorité au drag de colonne
    if (draggedColumn && onColumnDragLeave) {
      onColumnDragLeave(e);
    } else if (draggedCard && onDragLeave) {
      onDragLeave(e);
    }
  };

  return (
    <div
      className="deck-column w-[260px] min-w-[260px] max-w-[260px] bg-transparent flex flex-col border-r border-gray-600 relative group"
      data-column-id={column.id}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      // Drag & drop pour les colonnes
      draggable={true}
      onDragStart={(e) => onColumnDragStart && onColumnDragStart(e, column.id)}
      onDragEnd={(e) => onColumnDragEnd && onColumnDragEnd(e)}
      style={{
        opacity: draggedColumn === column.id ? 0.5 : 1,
        transition: 'opacity 0.2s ease',
      }}
    >
      {/* Indicateur de drop pour les colonnes */}
      {columnDropIndicator && columnDropIndicator.targetColumnId === column.id && (
        <div
          className={`absolute top-0 w-2 h-full bg-purple-500 z-50 ${
            columnDropIndicator.insertBefore ? '-left-1' : '-right-1'
          }`}
          style={{
            boxShadow: '0 0 10px rgba(139, 92, 246, 0.8)',
          }}
        />
      )}
      {/* Header de colonne */}
      <div className="p-3">
        {/* Header transparent */}
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-2 py-1 bg-mage-dark-700 border border-gray-600 rounded text-white text-sm"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditName(column.name);
                }}
                className="px-2 py-1 text-xs text-gray-300 hover:text-white"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleSave}
                className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                {t("common.save")}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-white">{column.name}</h3>
              <p className="text-xs text-gray-400">
                {t("decks.visualization.totalCards", {
                  count: column.cards?.length || 0,
                })}
              </p>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                title={t("columns.edit")}
              >
                <Pencil size={14} />
              </button>
              {canDelete && (
                <button
                  onClick={handleDelete}
                  className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                  title={t("columns.delete")}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Corps de colonne avec cartes */}
      <div
        className="cards-container flex-1 p-3 overflow-y-auto min-h-40"
        style={{ paddingTop: "12px", position: "relative" }}
      >
        {column.cards?.length === 0 ? (
          <>
            {/* Indicateur pour colonne vide */}
            {dropIndicator && dropIndicator.columnId === column.id && (
              <div className="drop-indicator-container">
                <div className="drop-indicator"></div>
              </div>
            )}
            <div className="text-center text-gray-400 text-sm py-8">
              {t("decks.visualization.dropCardsHere")}
            </div>
          </>
        ) : (
          <>
            {column.cards?.map((card, index) => (
              <React.Fragment key={`${card.card.id}-${index}`}>
                {/* Indicateur de drop AVANT cette carte */}
                {dropIndicator &&
                  dropIndicator.columnId === column.id &&
                  dropIndicator.position === index && (
                    <div className="drop-indicator-container">
                      <div className="drop-indicator"></div>
                    </div>
                  )}

                <div
                  className="deck-card-image"
                  style={{ zIndex: index + 1 }}
                  draggable
                  onDragStart={(e) => {
                    onDragStart(e, card, column.id);
                    e.stopPropagation(); // Empêche la propagation vers le drag de colonne
                  }}
                  onDrag={handleDrag}
                  onDragEnd={(e) => {
                    handleDragEnd(e);
                    e.stopPropagation(); // Empêche la propagation vers le drag de colonne
                  }}
                  onMouseEnter={
                    hoverPreviewEnabled
                      ? (e) => {
                          setHoveredCard(card.card);
                          const position = calculateImagePosition(e.currentTarget);
                          setHoveredCardPosition(position);
                        }
                      : undefined
                  }
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <img
                    src={card.card.imageUrl}
                    alt={card.card.name}
                    className="card-image"
                    onError={handleImageError}
                  />
                  {card.quantity > 1 && (
                    <span className="quantity-badge">{card.quantity}</span>
                  )}
                </div>
              </React.Fragment>
            ))}

            {/* Indicateur de drop APRÈS la dernière carte */}
            {dropIndicator &&
              dropIndicator.columnId === column.id &&
              dropIndicator.position === column.cards.length && (
                <div className="drop-indicator-container">
                  <div className="drop-indicator"></div>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
};

export default DeckColumn;
