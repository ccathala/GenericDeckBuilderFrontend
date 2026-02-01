/**
 * Configuration API universelle - fonctionne automatiquement en dev ET prod
 */
export const API_CONFIG = {
  baseUrl:import.meta.env.VITE_API_BASE_URL,
  apiPath: "/api",
  imagesPath: "/images",
};

/**
 * Génère l'URL pour un endpoint API
 */
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.baseUrl}${API_CONFIG.apiPath}${endpoint}`;
};

/**
 * Transforme une imageUrl relative en URL absolue
 * Gère automatiquement dev (localhost:8080) et prod (même domaine)
 */
export const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  // Si c'est déjà une URL absolue
  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  // URL relative - rediriger vers le backend
  if (imageUrl.startsWith("/images/")) {
    return `${API_CONFIG.baseUrl}${imageUrl}`;
  }

  // Ajouter le préfixe images si manquant
  return `${API_CONFIG.baseUrl}/images/${imageUrl}`;
};
