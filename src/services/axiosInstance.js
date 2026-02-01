import axios from "axios";
import { API_CONFIG } from "../config/api";
import { isTokenExpired } from "../utils/jwtUtils";

const axiosInstance = axios.create({
  baseURL: API_CONFIG.baseUrl, // URL dynamique selon l'environnement
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Variable pour éviter les redirections multiples
let isRedirecting = false;

// Fonction pour nettoyer l'authentification et rediriger
const handleAuthenticationError = (errorMessage = "Session expirée") => {
  if (isRedirecting) return;
  isRedirecting = true;

  console.warn("Erreur d'authentification:", errorMessage);

  // Nettoyer le localStorage
  localStorage.removeItem("authToken");
  localStorage.removeItem("userData");

  // Rediriger vers la page de connexion après un court délai
  setTimeout(() => {
    window.location.href = "/login";
    isRedirecting = false;
  }, 100);
};

// Intercepteur pour les requêtes
axiosInstance.interceptors.request.use(
  (config) => {
    // Vérifier l'expiration du token avant d'envoyer la requête
    const token = localStorage.getItem("authToken");
    if (token) {
      // Vérifier si le token est expiré
      if (isTokenExpired(token)) {
        console.warn("Token expiré détecté avant la requête");
        handleAuthenticationError("Token expiré");
        return Promise.reject(new Error("Token expiré"));
      }

      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Gérer les erreurs d'authentification (401 et 403)
    if (error.response?.status === 401 || error.response?.status === 403) {
      const errorData = error.response.data;
      const errorMessage = errorData?.error || "Session expirée";
      const errorCode = errorData?.code;

      // Logs pour le debugging
      if (errorCode === "TOKEN_EXPIRED") {
        console.warn("Token JWT expiré côté serveur");
      } else if (errorCode === "TOKEN_INVALID") {
        console.warn("Token JWT invalide côté serveur");
      } else {
        console.warn("Erreur d'authentification:", errorMessage);
      }

      handleAuthenticationError(errorMessage);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
