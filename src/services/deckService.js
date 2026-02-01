import axiosInstance from "./axiosInstance";

export const deckService = {
  // Récupérer tous les decks de l'utilisateur
  async getAllDecks() {
    try {
      const response = await axiosInstance.get("/api/decks");
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

  // Récupérer un deck spécifique
  async getDeck(deckId) {
    try {
      const response = await axiosInstance.get(`/api/decks/${deckId}`);
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

  // Créer un nouveau deck
  async createDeck(deckData) {
    try {
      const response = await axiosInstance.post("/api/decks", deckData);
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

  // Créer un deck vide automatiquement
  async createEmptyDeck() {
    try {
      const response = await axiosInstance.post("/api/decks", {
        name: "Nouveau deck",
        description: "",
        gameId: "mage_noir",
        cards: [],
      });
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

  // Mettre à jour un deck
  async updateDeck(deckId, deckData) {
    try {
      const response = await axiosInstance.put(
        `/api/decks/${deckId}`,
        deckData
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

  // Supprimer un deck
  async deleteDeck(deckId) {
    try {
      const response = await axiosInstance.delete(`/api/decks/${deckId}`);
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

  // Mettre à jour les notes d'un deck
  async updateDeckNotes(deckId, notes) {
    try {
      const response = await axiosInstance.patch(`/api/decks/${deckId}/notes`, {
        notes: notes,
      });
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

export default deckService;
