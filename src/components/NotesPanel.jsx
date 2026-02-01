import React, { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import useNotesAutoSave from "../hooks/useNotesAutoSave";
import deckService from "../services/deckService";

const NotesPanel = ({ deckId }) => {
  const { t } = useLanguage();
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { isSaving, lastSaved, saveNotes } = useNotesAutoSave(deckId, notes);

  // Charger les notes initiales
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const result = await deckService.getDeck(deckId);
        if (result.success) {
          setNotes(result.data.notes || "");
        }
      } catch (error) {
        console.error("Error loading notes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (deckId) {
      loadNotes();
    }
  }, [deckId]);

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  const handleBlur = () => {
    saveNotes();
  };

  return (
    <div className="w-80 min-w-80 max-w-80 bg-transparent flex flex-col">
      {/* Header du panneau */}
      <div className="p-4 border-b border-gray-600/60 bg-black/10 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            {t("decks.visualization.notes")}
          </h3>
          {/* Indicateur de sauvegarde */}
          <div className="flex items-center gap-2 text-xs">
            {isSaving ? (
              <>
                <div className="animate-spin w-3 h-3 border border-blue-500 border-t-transparent rounded-full"></div>
                <span className="text-blue-400">{t("common.saving")}</span>
              </>
            ) : lastSaved ? (
              <>
                <CheckCircle size={12} className="text-green-400" />
                <span className="text-green-400">
                  {t("common.autoSaved")} {lastSaved.toLocaleTimeString()}
                </span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Zone de texte */}
      <div className="flex-1 p-4 bg-transparent">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        ) : (
          <textarea
            value={notes}
            onChange={handleNotesChange}
            onBlur={handleBlur}
            placeholder={t("decks.visualization.notesPlaceholder")}
            className="w-full h-full resize-none bg-black/20 border border-gray-600/50 rounded-lg p-3 text-white placeholder-gray-400/80 focus:border-blue-500 focus:outline-none text-sm backdrop-blur-sm"
          />
        )}
      </div>
    </div>
  );
};

export default NotesPanel;
