import axiosInstance from "./axiosInstance";

const gameService = {
  /**
   * Récupérer tous les jeux disponibles
   */
  async getAllGames() {
    try {
      const response = await axiosInstance.get("/api/games");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  /**
   * Récupérer un jeu par son ID
   */
  async getGame(gameId) {
    try {
      const response = await axiosInstance.get(`/api/games/${gameId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  /**
   * Récupérer le ruleset d'un jeu
   */
  async getGameRuleset(gameId) {
    try {
      const response = await axiosInstance.get(`/api/games/${gameId}/ruleset`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  /**
   * DEPRECATED: Cette méthode n'existe pas côté backend
   * Utilisez getGameRuleset à la place
   */
  async validateDeck(deckData) {
    console.warn("validateDeck is deprecated. Use getGameRuleset instead.");
    try {
      // Pour la compatibilité, on peut simuler une validation basique
      // ou retourner une erreur explicite
      return {
        success: false,
        error:
          "validateDeck endpoint does not exist. Use getGameRuleset instead.",
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },
};

export default gameService;
