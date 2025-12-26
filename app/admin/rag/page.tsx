'use client';

import { useState } from 'react';

export default function RAGAdmin() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('insurance');
  const [provider, setProvider] = useState('');
  const [status, setStatus] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setStatus('📄 Creating document...');

    try {
      // 1. Create document
      const docResponse = await fetch('/api/admin/rag/create-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, type, provider })
      });

      const docData = await docResponse.json();
      
      if (!docResponse.ok) {
        throw new Error(docData.error || 'Failed to create document');
      }

      setStatus(`✅ Document created: ${docData.documentId}\n🔄 Generating embeddings...`);

      // 2. Generate embeddings
      const embedResponse = await fetch('/api/admin/rag/generate-embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: docData.documentId })
      });

      const embedData = await embedResponse.json();

      if (!embedResponse.ok) {
        throw new Error(embedData.error || 'Failed to generate embeddings');
      }

      setStatus(`🎉 Success! Generated ${embedData.chunksCreated} embeddings`);
      
      // Clear form
      setTitle('');
      setContent('');
      setProvider('');

    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">RAG Document Management</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border rounded px-3 py-2 h-64 font-mono text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="insurance">Insurance</option>
                <option value="report">Report</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Provider (optional)</label>
              <input
                type="text"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g., Aetna, BCBS"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full bg-blue-600 text-white py-3 rounded font-medium hover:bg-blue-700 disabled:bg-gray-400"
          >
            {processing ? 'Processing...' : 'Create Document & Generate Embeddings'}
          </button>
        </form>

        {status && (
          <div className="mt-4 bg-gray-100 p-4 rounded whitespace-pre-wrap font-mono text-sm">
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
