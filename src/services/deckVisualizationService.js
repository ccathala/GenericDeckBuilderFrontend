import axiosInstance from "./axiosInstance";

export const deckVisualizationService = {
  // Récupérer la visualisation complète d'un deck
  async getDeckVisualization(deckId, locale) {
    try {
      const response = await axiosInstance.get(
        `/api/decks/${deckId}/visualization`,
        {
          params: { locale },
        }
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // Créer une nouvelle colonne
  async createColumn(deckId, { name }) {
    try {
      const response = await axiosInstance.post(
        `/api/decks/${deckId}/visualization/columns`,
        {
          name,
        }
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // Modifier une colonne existante
  async updateColumn(deckId, columnId, { name, displayOrder }) {
    try {
      const payload = {};
      if (name !== undefined) payload.name = name;
      if (displayOrder !== undefined) payload.displayOrder = displayOrder;

      const response = await axiosInstance.put(
        `/api/decks/${deckId}/visualization/columns/${columnId}`,
        payload
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // Supprimer une colonne
  async deleteColumn(deckId, columnId) {
    try {
      await axiosInstance.delete(
        `/api/decks/${deckId}/visualization/columns/${columnId}`
      );
      return {
        success: true,
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // Déplacer une carte entre colonnes
  async moveCard(
    deckId,
    { cardId, sourceColumnId, targetColumnId, newPositionInPile }
  ) {
    try {
      console.log("=== DEBUG SERVICE MOVE CARD ===");
      console.log("deckId:", deckId);
      console.log("cardId:", cardId);
      console.log("sourceColumnId:", sourceColumnId);
      console.log("targetColumnId:", targetColumnId);
      console.log("newPositionInPile:", newPositionInPile);

      const payload = {
        cardId,
        sourceColumnId,
        targetColumnId,
        newPositionInPile,
      };
      console.log("Payload final envoyé à l'API:", payload);

      const response = await axiosInstance.post(
        `/api/decks/${deckId}/visualization/move-card`,
        payload
      );

      console.log("Réponse de l'API:", response.data);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Erreur dans le service moveCard:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // Réorganiser l'ordre des colonnes
  async reorderColumns(deckId, { columnOrder }) {
    try {
      const response = await axiosInstance.put(
        `/api/decks/${deckId}/visualization/columns/reorder`,
        {
          columnOrder,
        }
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // Mettre à jour l'ordre d'affichage d'une colonne
  async updateColumnDisplayOrder(deckId, columnId, newDisplayOrder) {
    try {
      const response = await axiosInstance.patch(
        `/api/decks/${deckId}/visualization/columns/${columnId}/display-order`,
        null,
        {
          params: { newDisplayOrder }
        }
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },
};

export default deckVisualizationService;
