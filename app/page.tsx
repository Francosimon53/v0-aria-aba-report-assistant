import Link from 'next/link';
import { Sparkles, FileText, Upload } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            ARIA - ABA Report Assistant
          </h1>
          <p className="text-xl text-gray-600">
            AI-Powered Assessment & Report Creation System
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Assessment Wizard */}
          <Link href="/assessment/new">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-500">
              <FileText className="w-12 h-12 text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Create Assessment</h2>
              <p className="text-gray-600">
                Start a new ABA assessment report with our guided wizard
              </p>
            </div>
          </Link>

          {/* RAG Assistant */}
          <Link href="/demo/rag-assistant">
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg p-8 hover:shadow-xl transition-all cursor-pointer text-white">
              <Sparkles className="w-12 h-12 mb-4" />
              <h2 className="text-2xl font-bold mb-2">AI Writing Assistant</h2>
              <p className="text-white/90">
                Get AI suggestions from insurance requirements & best practices
              </p>
              <div className="mt-4 text-sm bg-white/20 rounded px-3 py-1 inline-block">
                ✨ New Feature
              </div>
            </div>
          </Link>

          {/* Admin */}
          <Link href="/admin/rag">
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-green-500">
              <Upload className="w-12 h-12 text-green-600 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Manage Documents</h2>
              <p className="text-gray-600">
                Upload insurance policies & guidelines to the knowledge base
              </p>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center text-gray-600">
          <p className="text-sm">
            Powered by OpenAI Embeddings & RAG Technology
          </p>
        </div>
      </div>
    </div>
  );
}
