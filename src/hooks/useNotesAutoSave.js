import { useState, useCallback, useRef, useEffect } from "react";
import deckService from "../services/deckService";

/**
 * Hook personnalisé pour la sauvegarde automatique des notes de deck
 * @param {string} deckId - ID du deck
 * @param {string} notes - Contenu des notes
 * @param {number} delay - Délai avant sauvegarde automatique (défaut: 5000ms)
 * @returns {object} - { isSaving, lastSaved, saveNotes }
 */
const useNotesAutoSave = (deckId, notes, delay = 5000) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const saveTimeoutRef = useRef(null);
  const previousNotesRef = useRef(notes);

  const saveNotes = useCallback(async () => {
    if (!notes || notes === previousNotesRef.current) {
      return;
    }

    setIsSaving(true);
    try {
      const result = await deckService.updateDeckNotes(deckId, notes);
      if (result.success) {
        setLastSaved(new Date());
        previousNotesRef.current = notes;
      } else {
        console.error("Auto-save notes failed:", result.error);
      }
    } catch (error) {
      console.error("Auto-save notes failed:", error);
    } finally {
      setIsSaving(false);
    }
  }, [deckId, notes]);

  // Sauvegarde automatique avec debounce
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Ne pas déclencher de sauvegarde si les notes n'ont pas changé
    if (notes === previousNotesRef.current) {
      return;
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveNotes();
    }, delay);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [notes, delay, saveNotes]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return { isSaving, lastSaved, saveNotes };
};

export default useNotesAutoSave;
