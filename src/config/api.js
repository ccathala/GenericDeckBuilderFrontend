/**
 * Configuration API universelle - fonctionne automatiquement en dev ET prod
 */

const isDevelopment = import.meta.env.DEV;
const isLocalHost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

export const API_CONFIG = {
  // Configuration intelligente de l'API :
  // - Dev (npm run dev) : localhost:8080
  // - Prod locale (npm run preview:prod) : localhost:8080
  // - Prod déployée : même origine que le frontend
  baseUrl:
    isDevelopment || isLocalHost
      ? "http://localhost:8080"
      : window.location.origin,
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
