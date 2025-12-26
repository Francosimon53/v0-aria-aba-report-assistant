import { useState } from 'react';

interface RAGChunk {
  id: string;
  text: string;
  similarity: number;
  document: {
    id: string;
  };
}

interface RAGResponse {
  chunks: RAGChunk[];
  totalResults: number;
}

export function useRAGSuggestions() {
  const [suggestions, setSuggestions] = useState<RAGChunk[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSuggestions = async (query: string, minSimilarity: number = 0.3) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, minSimilarity, topK: 3 })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data: RAGResponse = await response.json();
      setSuggestions(data.chunks);
    } catch (err: any) {
      setError(err.message);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSuggestions = () => {
    setSuggestions([]);
    setError(null);
  };

  return {
    suggestions,
    loading,
    error,
    getSuggestions,
    clearSuggestions
  };
}
