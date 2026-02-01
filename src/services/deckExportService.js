import axiosInstance from "./axiosInstance";

/**
 * Service pour l'export de decks
 */
export const exportDeck = async (deckId, locale = "fr") => {
  try {
    const response = await axiosInstance.get(`/api/decks/${deckId}/export`, {
      params: { locale }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || "Erreur lors de l'export du deck" 
    };
  }
};
