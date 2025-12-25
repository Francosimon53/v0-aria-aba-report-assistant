'use client';
import { useState } from 'react';

export default function RagDemoPage() {
  const [healthStatus, setHealthStatus] = useState<any>(null);

  const checkHealth = async () => {
    const res = await fetch('/api/rag/health');
    setHealthStatus(await res.json());
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">ARIA RAG Demo</h1>
      <button onClick={checkHealth} className="px-4 py-2 bg-blue-500 text-white rounded">
        Check Status
      </button>
      {healthStatus && (
        <pre className="mt-4 p-4 bg-gray-100 rounded">{JSON.stringify(healthStatus, null, 2)}</pre>
      )}
    </div>
  );
}
