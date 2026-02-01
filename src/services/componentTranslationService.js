import axiosInstance from "./axiosInstance";

/**
 * Service pour gérer les traductions des composants
 */
class ComponentTranslationService {
  constructor() {
    this.cache = new Map();
    this.loadingPromises = new Map();
  }

  /**
   * Récupère les traductions des composants pour un jeu et une langue
   * @param {string} gameId - Identifiant du jeu
   * @param {string} language - Code de langue (fr, en)
   * @returns {Promise<Object>} - Map des traductions
   */
  async getComponentTranslations(gameId, language) {
    const cacheKey = `${gameId}-${language}`;

    // Vérifier le cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Vérifier si une requête est déjà en cours
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }

    // Créer la promesse de chargement
    const loadingPromise = this._fetchTranslations(gameId, language, cacheKey);
    this.loadingPromises.set(cacheKey, loadingPromise);

    try {
      const result = await loadingPromise;
      return result;
    } finally {
      // Nettoyer la promesse de chargement
      this.loadingPromises.delete(cacheKey);
    }
  }

  /**
   * Méthode privée pour effectuer la requête HTTP
   */
  async _fetchTranslations(gameId, language, cacheKey) {
    try {
      console.log(
        `🔄 Chargement des traductions pour ${gameId} en ${language}`
      );

      const response = await axiosInstance.get("/api/components/translations", {
        params: { gameId, language },
      });

      const translations = response.data || {};

      // Mettre en cache
      this.cache.set(cacheKey, translations);

      console.log(`✅ Traductions chargées:`, translations);
      return translations;
    } catch (error) {
      console.error("❌ Erreur lors du chargement des traductions:", error);

      // En cas d'erreur, retourner un objet vide et ne pas cacher
      const emptyTranslations = {};
      return emptyTranslations;
    }
  }

  /**
   * Traduit un nom de composant
   * @param {string} componentName - Nom du composant en français
   * @param {Object} translations - Map des traductions
   * @returns {string} - Nom traduit ou original
   */
  translateComponent(componentName, translations) {
    if (!componentName || !translations) {
      return componentName;
    }

    return translations[componentName] || componentName;
  }

  /**
   * Initialise les traductions pour un jeu (appel l'endpoint d'initialisation)
   * @param {string} gameId - Identifiant du jeu
   * @returns {Promise<string>} - Message de confirmation
   */
  async initializeTranslations(gameId) {
    try {
      const response = await axiosInstance.post(
        `/api/components/initialize/${gameId}`
      );

      // Invalider le cache pour ce jeu
      this.clearCacheForGame(gameId);

      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'initialisation des traductions:", error);
      throw error;
    }
  }

  /**
   * Vide le cache
   */
  clearCache() {
    this.cache.clear();
    this.loadingPromises.clear();
  }

  /**
   * Vide le cache pour un jeu spécifique
   * @param {string} gameId - Identifiant du jeu
   */
  clearCacheForGame(gameId) {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${gameId}-`)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => {
      this.cache.delete(key);
      this.loadingPromises.delete(key);
    });
  }

  /**
   * Pré-charge les traductions pour un jeu dans toutes les langues supportées
   * @param {string} gameId - Identifiant du jeu
   * @param {string[]} languages - Liste des langues à pré-charger
   */
  async preloadTranslations(gameId, languages = ["fr", "en"]) {
    const promises = languages.map((lang) =>
      this.getComponentTranslations(gameId, lang).catch((err) => {
        console.warn(`Échec du pré-chargement pour ${gameId}-${lang}:`, err);
        return {};
      })
    );

    await Promise.all(promises);
    console.log(`🚀 Pré-chargement terminé pour ${gameId}`);
  }
}

// Instance singleton
export const componentTranslationService = new ComponentTranslationService();
export default componentTranslationService;
