import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
// Configuration Vite avec stratégie de sécurité multi-niveaux :
// 1. Railway : Sécurité automatique côté hébergeur
// 2. Vite : Sécurité garantie côté build (portabilité + tests locaux)
export default defineConfig(({ mode }) => ({
  plugins: [react()],

  build: {
    // Désactiver les source maps en production pour cacher le code source
    // Garantit la sécurité même si l'hébergeur ne le fait pas automatiquement
    sourcemap: mode !== "production",

    // Minification agressive - Défense en profondeur + portabilité
    minify: "terser",
    terserOptions: {
      compress: {
        // Supprimer les console.log en production
        drop_console: mode === "production",
        // Supprimer les debugger statements
        drop_debugger: true,
        // Supprimer les commentaires
        dead_code: true,
      },
      mangle: {
        // Obfusquer les noms de variables
        safari10: true,
      },
    },

    // Optimisation des chunks pour de meilleures performances
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          ui: ["lucide-react"],
        },
        // Noms de fichiers obfusqués en production
        chunkFileNames:
          mode === "production" ? "[hash].js" : "[name]-[hash].js",
        entryFileNames:
          mode === "production" ? "[hash].js" : "[name]-[hash].js",
        assetFileNames:
          mode === "production" ? "[hash].[ext]" : "[name]-[hash].[ext]",
      },
    },
  },

  // Configuration du serveur de développement
  server: {
    port: 5173,
    host: true,
  },

  // Configuration de prévisualisation
  preview: {
    port: 3000,
    host: true,
  },
}));
