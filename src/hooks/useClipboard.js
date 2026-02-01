import { useState } from 'react';

/**
 * Hook personnalisé pour la gestion du presse-papier
 */
export const useClipboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const copyToClipboard = async (text) => {
    setIsLoading(true);
    
    try {
      // Vérifier si l'API Clipboard est disponible
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return { success: true };
      } else {
        // Fallback pour les navigateurs plus anciens ou contextes non sécurisés
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (success) {
          return { success: true };
        } else {
          return { success: false, error: "Impossible de copier le texte" };
        }
      }
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      return { success: false, error: "Erreur lors de la copie dans le presse-papier" };
    } finally {
      setIsLoading(false);
    }
  };
  
  return { copyToClipboard, isLoading };
};
