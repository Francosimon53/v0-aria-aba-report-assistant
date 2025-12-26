import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, topK = 5, minSimilarity = 0.3 } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('rag_embeddings')
      .select('id, document_id, chunk_index, chunk_text, embedding')
      .limit(20);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('First row embedding type:', typeof data[0]?.embedding);
    console.log('Is array?', Array.isArray(data[0]?.embedding));

    const results = data.map((row: any) => {
      // Parsear el embedding si es string
      let embedding = row.embedding;
      if (typeof embedding === 'string') {
        embedding = JSON.parse(embedding);
      }
      
      const similarity = cosineSimilarity(queryEmbedding, embedding);
      return {
        id: row.id,
        text: row.chunk_text,
        similarity,
        document: {
          id: row.document_id
        }
      };
    }).filter((r: any) => r.similarity >= minSimilarity)
      .sort((a: any, b: any) => b.similarity - a.similarity)
      .slice(0, topK);

    return NextResponse.json({
      query,
      chunks: results,
      totalResults: results.length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Full error:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { 
      status: 500 
    });
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}
