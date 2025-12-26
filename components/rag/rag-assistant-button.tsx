'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useRAGSuggestions } from '@/hooks/useRAGSuggestions';
import { SuggestionsPanel } from './suggestions-panel';

interface RAGAssistantButtonProps {
  context: string; // El texto actual que el usuario está escribiendo
  onInsert: (text: string) => void; // Callback para insertar texto
}

export function RAGAssistantButton({ context, onInsert }: RAGAssistantButtonProps) {
  const [showPanel, setShowPanel] = useState(false);
  const { suggestions, loading, error, getSuggestions, clearSuggestions } = useRAGSuggestions();

  const handleGetSuggestions = async () => {
    if (!context.trim()) {
      alert('Please write some context first');
      return;
    }
    
    setShowPanel(true);
    await getSuggestions(context);
  };

  const handleClose = () => {
    setShowPanel(false);
    clearSuggestions();
  };

  const handleInsert = (text: string) => {
    onInsert(text);
    handleClose();
  };

  return (
    <>
      <button
        onClick={handleGetSuggestions}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
      >
        <Sparkles className="w-4 h-4" />
        Get AI Suggestions
      </button>

      {showPanel && (
        <SuggestionsPanel
          suggestions={suggestions}
          loading={loading}
          error={error}
          onClose={handleClose}
          onInsert={handleInsert}
        />
      )}
    </>
  );
}
