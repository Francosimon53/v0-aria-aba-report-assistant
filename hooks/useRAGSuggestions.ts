import { useState, useCallback } from 'react';

interface RAGChunk {
  id: string;
  text: string;
  similarity: number;
  document: { id: string };
}

interface RAGResponse {
  query: string;
  chunks: RAGChunk[];
  totalResults: number;
  timestamp: string;
}

export function useRAGSuggestions() {
  const [suggestions, setSuggestions] = useState<RAGChunk[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSuggestions = useCallback(async (
    query: string,
    insuranceProvider?: string,
    topK: number = 5
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Build query with insurance context
      const enhancedQuery = insuranceProvider 
        ? `${insuranceProvider} ${query}`
        : query;

      const response = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: enhancedQuery,
          topK,
          minSimilarity: 0.3
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data: RAGResponse = await response.json();
      setSuggestions(data.chunks);
      return data.chunks;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    getSuggestions,
    clearSuggestions
  };
}
