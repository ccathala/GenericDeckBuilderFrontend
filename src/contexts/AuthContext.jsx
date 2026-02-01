import React, { createContext, useContext, useState, useEffect } from "react";
import { isTokenExpired, getTimeUntilExpiration } from "../utils/jwtUtils";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier l'authentification au démarrage
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const userData = localStorage.getItem("userData");

        if (token && userData) {
          // Vérifier si le token n'est pas expiré
          if (isTokenExpired(token)) {
            console.warn("Token expiré détecté au démarrage de l'application");
            logout();
          } else {
            setUser(JSON.parse(userData));
            setIsAuthenticated(true);

            // Programmer la vérification périodique d'expiration
            scheduleTokenExpirationCheck(token);
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      // Use the actual auth service
      const result = await require("../services/authService").default.login(
        credentials.email,
        credentials.password
      );

      if (result.success) {
        // Store token
        localStorage.setItem("authToken", result.data.token);

        // Use enhanced user data from backend response
        const userData = {
          id: result.data.user.id,
          email: result.data.user.email,
          name: result.data.user.name,
        };
        localStorage.setItem("userData", JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);

        // Programmer la vérification d'expiration pour le nouveau token
        scheduleTokenExpirationCheck(result.data.token);

        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setUser(null);
    setIsAuthenticated(false);

    // Nettoyer les timers d'expiration
    if (window.tokenExpirationTimer) {
      clearTimeout(window.tokenExpirationTimer);
      window.tokenExpirationTimer = null;
    }
  };

  // Programmer la vérification d'expiration du token
  const scheduleTokenExpirationCheck = (token) => {
    const timeUntilExpiration = getTimeUntilExpiration(token);

    if (timeUntilExpiration > 0) {
      // Nettoyer le timer précédent s'il existe
      if (window.tokenExpirationTimer) {
        clearTimeout(window.tokenExpirationTimer);
      }

      // Programmer la déconnexion automatique quelques secondes avant l'expiration
      const logoutTime = Math.max(0, (timeUntilExpiration - 30) * 1000); // 30 secondes avant expiration

      window.tokenExpirationTimer = setTimeout(() => {
        console.warn("Token sur le point d'expirer, déconnexion automatique");
        logout();
      }, logoutTime);

      console.info(
        `Token expirera dans ${timeUntilExpiration} secondes, déconnexion programmée dans ${
          logoutTime / 1000
        } secondes`
      );
    } else {
      // Token déjà expiré
      console.warn("Token déjà expiré, déconnexion immédiate");
      logout();
    }
  };

  const setAuthenticatedUser = (token, userData) => {
    // Store in localStorage
    localStorage.setItem("authToken", token);
    localStorage.setItem("userData", JSON.stringify(userData));

    // Update context state immediately
    setUser(userData);
    setIsAuthenticated(true);

    // Programmer la vérification d'expiration pour le nouveau token
    scheduleTokenExpirationCheck(token);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setAuthenticatedUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
