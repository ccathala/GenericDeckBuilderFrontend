import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { componentTranslationService } from "../services/componentTranslationService";

/**
 * Hook personnalisé pour gérer les traductions des composants
 * @param {string} gameId - Identifiant du jeu
 * @returns {Object} - Objet contenant les traductions et fonctions utiles
 */
export const useComponentTranslations = (gameId) => {
  const { currentLanguage } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  /**
   * Charge les traductions depuis l'API
   */
  const loadTranslations = useCallback(async () => {
    if (!gameId) {
      setTranslations({});
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const componentTranslations =
        await componentTranslationService.getComponentTranslations(
          gameId,
          currentLanguage
        );

      setTranslations(componentTranslations);
      setInitialized(true);
    } catch (err) {
      console.error("Erreur lors du chargement des traductions:", err);
      setError(err.message || "Erreur de chargement des traductions");
      setTranslations({});
    } finally {
      setLoading(false);
    }
  }, [gameId, currentLanguage]);

  /**
   * Traduit un nom de composant
   */
  const translateComponent = useCallback(
    (componentName) => {
      if (!componentName) return componentName;
      return componentTranslationService.translateComponent(
        componentName,
        translations
      );
    },
    [translations]
  );

  /**
   * Traduit une liste de composants en conservant les noms originaux
   */
  const translateComponents = useCallback(
    (components) => {
      if (!Array.isArray(components)) return [];

      return components.map((component) => ({
        original: component,
        translated: translateComponent(component),
      }));
    },
    [translateComponent]
  );

  /**
   * Initialise les traductions pour le jeu (crée les entrées manquantes)
   */
  const initializeTranslations = useCallback(async () => {
    if (!gameId) return;

    try {
      setLoading(true);
      await componentTranslationService.initializeTranslations(gameId);
      // Recharger les traductions après initialisation
      await loadTranslations();
    } catch (err) {
      console.error("Erreur lors de l'initialisation:", err);
      setError(err.message || "Erreur d'initialisation");
    } finally {
      setLoading(false);
    }
  }, [gameId, loadTranslations]);

  /**
   * Vérifie si une traduction existe pour un composant
   */
  const hasTranslation = useCallback(
    (componentName) => {
      return componentName && translations.hasOwnProperty(componentName);
    },
    [translations]
  );

  /**
   * Retourne le nombre de traductions disponibles
   */
  const translationCount = Object.keys(translations).length;

  /**
   * Indique si les traductions sont prêtes (chargées et non vides)
   */
  const isReady = initialized && !loading && translationCount > 0;

  // Charger les traductions quand le hook est utilisé
  useEffect(() => {
    loadTranslations();
  }, [loadTranslations]);

  // Debug: Logger les changements de traductions
  useEffect(() => {
    if (Object.keys(translations).length > 0) {
      console.log(
        `🌍 Traductions ${currentLanguage} pour ${gameId}:`,
        translations
      );
    }
  }, [translations, currentLanguage, gameId]);

  return {
    // État
    translations,
    loading,
    error,
    initialized,
    isReady,
    translationCount,

    // Fonctions
    translateComponent,
    translateComponents,
    hasTranslation,
    reload: loadTranslations,
    initializeTranslations,

    // Utilitaires
    clearCache: () => componentTranslationService.clearCache(),
    clearCacheForGame: () =>
      componentTranslationService.clearCacheForGame(gameId),
  };
};

export default useComponentTranslations;
