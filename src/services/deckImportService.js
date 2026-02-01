import axiosInstance from "./axiosInstance";

export const importDeck = async (importData) => {
  try {
    const response = await axiosInstance.post("/api/decks/import", importData);
    return response.data;
  } catch (error) {
    if (error.response?.data?.message) {
      const err = new Error(error.response.data.message);
      err.errors = error.response.data.errors || [];
      throw err;
    }
    throw new Error("Erreur lors de l'import du deck");
  }
};
