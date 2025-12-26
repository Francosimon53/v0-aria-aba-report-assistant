'use client';

import { useState } from 'react';

export default function RagDemo() {
  const [status, setStatus] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    const res = await fetch('/api/rag/health');
    const data = await res.json();
    setStatus(data);
  };

  const searchRAG = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/rag/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">ARIA RAG Demo</h1>
        
        {/* Health Check Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <button
            onClick={checkStatus}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Check Status
          </button>
          {status && (
            <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
              {JSON.stringify(status, null, 2)}
            </pre>
          )}
        </div>

        {/* Search Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Semantic Search</h2>
          <div className="space-y-4">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your query (e.g., 'SMART goals for receptive language')"
              className="w-full p-3 border rounded-lg h-24"
            />
            <button
              onClick={searchRAG}
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search RAG'}
            </button>
          </div>

          {results && (
            <div className="mt-6">
              <h3 className="text-xl font-bold mb-2">
                Results ({results.totalResults})
              </h3>
              <div className="space-y-4">
                {results.chunks?.map((chunk: any, i: number) => (
                  <div key={i} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-blue-600">
                        {chunk.document.title}
                      </span>
                      <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                        {(chunk.similarity * 100).toFixed(1)}% match
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{chunk.text}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      Type: {chunk.document.type} | Provider: {chunk.document.insuranceProvider}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
