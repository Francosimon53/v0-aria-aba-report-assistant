'use client';

import { useState } from 'react';
import { RAGAssistantButton } from '@/components/rag/rag-assistant-button';

export default function RAGAssistantDemo() {
  const [content, setContent] = useState('');

  const handleInsert = (text: string) => {
    setContent(prev => prev + '\n\n' + text);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">RAG Assistant Demo</h1>
        <p className="text-gray-600 mb-8">
          Write some context about ABA therapy, insurance requirements, or treatment goals, 
          then click "Get AI Suggestions" to see relevant content from your knowledge base.
        </p>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Your Report Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing about treatment goals, assessment requirements, or insurance documentation..."
              className="w-full h-64 border rounded px-3 py-2 font-mono text-sm"
            />
          </div>

          <div className="flex justify-between items-center">
            <RAGAssistantButton
              context={content}
              onInsert={handleInsert}
            />
            
            <button
              onClick={() => setContent('')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p><strong>Try these queries:</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>"What are the BCBS prior authorization requirements?"</li>
            <li>"Treatment goals for autism therapy"</li>
            <li>"Medical necessity language for ABA services"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
