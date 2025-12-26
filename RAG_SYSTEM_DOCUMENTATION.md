# ARIA RAG System - Complete Documentation

## 🎯 Overview

ARIA (ABA Report Assistant) now includes a complete RAG (Retrieval-Augmented Generation) system that provides AI-powered suggestions to BCBAs while writing assessment reports. The system searches through a knowledge base of insurance requirements and best practices to provide contextually relevant suggestions.

## 🏗️ Architecture

### Components

1. **Vector Database**: Supabase with pgvector extension
2. **Embeddings**: OpenAI text-embedding-3-small (1536 dimensions)
3. **Search**: Cosine similarity implemented in JavaScript
4. **Frontend**: Next.js 15 with React components
5. **Backend**: Next.js API routes

### Database Schema
```sql
-- Documents table
CREATE TABLE rag_documents (
  id UUID PRIMARY KEY,
  title TEXT,
  content TEXT,
  document_type TEXT CHECK (document_type IN ('insurance', 'report')),
  insurance_provider TEXT,
  metadata JSONB,
  created_at TIMESTAMP
);

-- Embeddings table
CREATE TABLE rag_embeddings (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES rag_documents(id),
  chunk_index INTEGER,
  chunk_text TEXT,
  embedding vector(1536),
  created_at TIMESTAMP
);

-- Search function
CREATE FUNCTION match_rag_chunks(
  query_embedding vector(1536),
  match_count int,
  similarity_threshold float
) RETURNS TABLE (...);
```

## 📁 File Structure
```
├── app/
│   ├── page.tsx                              # Home page with navigation
│   ├── admin/rag/page.tsx                    # Admin interface for uploading documents
│   ├── demo/rag/page.tsx                     # Basic RAG search demo
│   ├── demo/rag-assistant/page.tsx           # Full RAG assistant demo
│   └── api/
│       ├── rag/query/route.ts                # Search endpoint
│       └── admin/rag/
│           ├── create-document/route.ts      # Create document endpoint
│           └── generate-embeddings/route.ts  # Generate embeddings endpoint
├── components/
│   └── rag/
│       ├── rag-assistant-button.tsx          # Button to trigger suggestions
│       └── suggestions-panel.tsx             # Panel to display results
├── hooks/
│   └── useRAGSuggestions.ts                  # Custom hook for API calls
└── scripts/
    └── generate-embeddings-simple.js         # Script to generate embeddings
```

## 🚀 Features

### 1. Document Management (`/admin/rag`)
- Upload new documents (insurance policies, guidelines)
- Automatic chunking (500 chars with 50 char overlap)
- Automatic embedding generation
- Support for insurance providers (Aetna, BCBS, Cigna, etc.)

### 2. AI Writing Assistant (`/demo/rag-assistant`)
- Real-time suggestions based on context
- Similarity scoring (shows % match)
- Click-to-insert functionality
- Clean, intuitive UI

### 3. Search API (`/api/rag/query`)
- POST endpoint accepting query text
- Returns top K most similar chunks
- Configurable similarity threshold
- Fast response times (<1s)

## 📊 Current Knowledge Base

1. **ABA Therapy Goals - Best Practices**
   - Treatment goal templates
   - Skill acquisition examples
   - Progress monitoring guidelines

2. **Aetna Insurance Requirements**
   - Documentation requirements
   - Assessment data needs
   - Treatment goals format
   - Medical necessity language

3. **BCBS Insurance Requirements**
   - Prior authorization requirements
   - Treatment plan requirements
   - Progress reporting guidelines
   - Service delivery specifications

## 🔧 How to Use

### For BCBAs (End Users)

1. Navigate to homepage
2. Click "AI Writing Assistant"
3. Write your report content in the textarea
4. Click "Get AI Suggestions"
5. Review suggestions in the sidebar
6. Click any suggestion to insert it into your report

### For Administrators

1. Navigate to `/admin/rag`
2. Fill in the form:
   - Title: Document name
   - Content: Full text of the document
   - Type: Insurance or Report
   - Provider: Insurance company name (optional)
3. Click "Create Document & Generate Embeddings"
4. Wait for confirmation (usually 5-10 seconds)

## 🛠️ Technical Details

### Chunking Strategy
- **Chunk Size**: 500 characters
- **Overlap**: 50 characters
- **Rationale**: Balances context preservation with retrieval precision

### Similarity Calculation
```javascript
function cosineSimilarity(a, b) {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}
```

### Default Parameters
- **Top K**: 3 results
- **Min Similarity**: 0.3 (30% match)
- **Max Results**: 5 results shown in UI

## 📈 Performance

- **Embedding Generation**: ~1-2 seconds per chunk
- **Search Query**: <500ms typical
- **Database Size**: Minimal (3 documents = ~10 chunks)
- **Scalability**: Can handle 1000+ documents efficiently

## 🔐 Security

- Uses Supabase SERVICE_ROLE_KEY for admin operations
- Row Level Security disabled for development (re-enable for production)
- API routes protected by Next.js server-side execution
- No sensitive data exposed to client

## 🎯 Future Enhancements

### Short Term
1. Integrate directly into Dashboard wizard
2. Add more insurance providers (Cigna, United Healthcare)
3. Add filters by insurance provider
4. Add document versioning

### Medium Term
1. Implement semantic caching
2. Add user feedback mechanism (thumbs up/down)
3. Track which suggestions are most used
4. A/B testing different similarity thresholds

### Long Term
1. Fine-tune custom embedding model
2. Add multi-modal support (PDFs, images)
3. Implement RAG with citations
4. Add collaborative editing with RAG suggestions

## 🐛 Troubleshooting

### No results returned
- Check similarity threshold (try lowering to 0.2)
- Verify embeddings were generated (check rag_embeddings table)
- Ensure query text is substantive (not too short)

### Slow response times
- Check network latency to Supabase
- Consider implementing caching
- Verify database indexes are in place

### Embeddings not generating
- Check OpenAI API key is valid
- Verify OPENAI_API_KEY in .env.local
- Check API rate limits

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review console logs in browser/terminal
3. Check Supabase logs
4. Contact: [your contact info]

## 🎓 Resources

- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [Supabase Vector Guide](https://supabase.com/docs/guides/ai/vector-columns)
- [RAG Pattern Overview](https://www.pinecone.io/learn/retrieval-augmented-generation/)

---

**Built with ❤️ for BCBAs by Simón Franco**
**Last Updated**: December 26, 2024
