import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { exportDeck } from '../services/deckExportService';
import { useClipboard } from '../hooks/useClipboard';

/**
 * Modal d'export de deck avec textarea readonly et copie vers le presse-papier
 */
const DeckExportModal = ({ 
  isOpen, 
  onClose, 
  deck, 
  onCopySuccess, 
  onCopyError 
}) => {
  const { t, currentLanguage } = useLanguage();
  const { copyToClipboard, isLoading: isCopying } = useClipboard();
  
  const [exportedContent, setExportedContent] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  // Exporter le deck quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && deck) {
      handleExport();
    }
  }, [isOpen, deck, currentLanguage]);

  // Réinitialiser l'état quand le modal se ferme
  useEffect(() => {
    if (!isOpen) {
      setExportedContent('');
      setExportError('');
    }
  }, [isOpen]);

  const handleExport = async () => {
    setIsExporting(true);
    setExportError('');
    
    try {
      const result = await exportDeck(deck.id, currentLanguage);
      
      if (result.success) {
        setExportedContent(result.data.exportedContent);
      } else {
        setExportError(result.error);
      }
    } catch (error) {
      setExportError('Erreur lors de l\'export du deck');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = async () => {
    if (!exportedContent) return;
    
    const result = await copyToClipboard(exportedContent);
    
    if (result.success) {
      onCopySuccess?.(t("decks.exportSuccess", "Deck copié dans le presse-papier !"));
      onClose(); // Fermer le modal après copie réussie
    } else {
      onCopyError?.(result.error || t("decks.exportError", "Erreur lors de la copie"));
    }
  };

  const handleSelectAll = () => {
    const textarea = document.getElementById('export-textarea');
    if (textarea) {
      textarea.select();
      textarea.setSelectionRange(0, 99999); // Pour les appareils mobiles
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {t("decks.exportTitle", "Export du deck")} - {deck?.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-hidden flex flex-col">
          {isExporting ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-2 border-gray-400 border-t-blue-600 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">{t("decks.loading", "Chargement...")}</p>
              </div>
            </div>
          ) : exportError ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-red-500 text-lg mb-4">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-600 font-medium">{exportError}</p>
                <button
                  onClick={handleExport}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Réessayer
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Instructions */}
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  {t("decks.exportInstructions", "Voici le contenu de votre deck au format texte. Utilisez le bouton ci-dessous pour le copier dans le presse-papier.")}
                </p>
              </div>

              {/* Textarea avec contenu exporté */}
              <div className="flex-1 flex flex-col">
                <textarea
                  id="export-textarea"
                  value={exportedContent}
                  readOnly
                  className="flex-1 w-full p-4 border border-gray-300 rounded-md resize-none font-mono text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{ minHeight: '300px' }}
                  onClick={handleSelectAll}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {exportedContent.split('\n').length} cartes • Cliquez dans la zone de texte pour tout sélectionner
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={handleCopy}
                    disabled={isCopying || !exportedContent}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
                  >
                    {isCopying ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Copie...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>{t("decks.copyToClipboard", "Copier dans le presse-papier")}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeckExportModal;
