import axiosInstance from "./axiosInstance";

export const getCardsByGame = async (gameId, locale) => {
  try {
    const response = await axiosInstance.get(
      `/api/public/games/${gameId}/cards`,
      {
        params: { locale },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching cards:", error);
    throw error;
  }
};

export const cardService = {
  getCardsByGame,
};

export default cardService;
