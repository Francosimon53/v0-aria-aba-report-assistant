'use client';

import { Lightbulb, X, Loader2 } from 'lucide-react';

interface RAGChunk {
  id: string;
  text: string;
  similarity: number;
}

interface SuggestionsPanelProps {
  suggestions: RAGChunk[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onInsert: (text: string) => void;
}

export function SuggestionsPanel({ 
  suggestions, 
  loading, 
  error, 
  onClose,
  onInsert 
}: SuggestionsPanelProps) {
  if (!loading && suggestions.length === 0 && !error) {
    return null;
  }

  return (
    <div className="fixed right-4 top-20 w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[80vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold">AI Suggestions</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="ml-2 text-sm text-gray-600">Finding suggestions...</span>
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        {!loading && suggestions.length > 0 && suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="bg-gray-50 p-3 rounded hover:bg-gray-100 cursor-pointer border border-gray-200"
            onClick={() => onInsert(suggestion.text)}
          >
            <div className="text-xs text-gray-500 mb-1">
              {Math.round(suggestion.similarity * 100)}% match
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">
              {suggestion.text}
            </p>
            <div className="mt-2 text-xs text-blue-600 hover:text-blue-700">
              Click to insert →
            </div>
          </div>
        ))}

        {!loading && suggestions.length === 0 && !error && (
          <div className="text-sm text-gray-500 text-center py-8">
            No suggestions found. Try a different query.
          </div>
        )}
      </div>
    </div>
  );
}
