/**
 * Utilitaires pour la gestion des tokens JWT côté frontend
 */

/**
 * Décode un token JWT sans vérification de signature
 * @param {string} token - Le token JWT à décoder
 * @returns {Object|null} - Les données décodées ou null si erreur
 */
const decodeJwt = (token) => {
  try {
    if (!token) return null;

    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Erreur lors du décodage du token JWT:", error);
    return null;
  }
};

/**
 * Vérifie si un token JWT est expiré
 * @param {string} token - Le token JWT à vérifier
 * @returns {boolean} - true si le token est expiré, false sinon
 */
const isTokenExpired = (token) => {
  try {
    const decoded = decodeJwt(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    console.error("Erreur lors de la vérification d'expiration:", error);
    return true; // En cas d'erreur, considérer comme expiré
  }
};

/**
 * Récupère le temps restant avant expiration en secondes
 * @param {string} token - Le token JWT
 * @returns {number} - Secondes restantes (0 si expiré ou invalide)
 */
const getTimeUntilExpiration = (token) => {
  try {
    const decoded = decodeJwt(token);
    if (!decoded || !decoded.exp) return 0;

    const currentTime = Math.floor(Date.now() / 1000);
    const timeLeft = decoded.exp - currentTime;

    return Math.max(0, timeLeft);
  } catch (error) {
    console.error("Erreur lors du calcul du temps restant:", error);
    return 0;
  }
};

/**
 * Vérifie si le token expire dans les X prochaines minutes
 * @param {string} token - Le token JWT
 * @param {number} minutes - Nombre de minutes avant expiration
 * @returns {boolean} - true si le token expire bientôt
 */
const isTokenExpiringSoon = (token, minutes = 5) => {
  const timeLeft = getTimeUntilExpiration(token);
  return timeLeft > 0 && timeLeft <= minutes * 60;
};

/**
 * Récupère l'email/username depuis le token
 * @param {string} token - Le token JWT
 * @returns {string|null} - L'email ou null si erreur
 */
const getEmailFromToken = (token) => {
  try {
    const decoded = decodeJwt(token);
    return decoded?.sub || null;
  } catch (error) {
    console.error("Erreur lors de l'extraction de l'email:", error);
    return null;
  }
};

export {
  decodeJwt,
  isTokenExpired,
  getTimeUntilExpiration,
  isTokenExpiringSoon,
  getEmailFromToken,
};
