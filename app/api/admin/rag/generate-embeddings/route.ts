import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    // 1. Get document
    const { data: doc, error: docError } = await supabase
      .from('rag_documents')
      .select('content')
      .eq('id', documentId)
      .single();

    if (docError) throw docError;

    // 2. Create chunks
    const chunks = chunkText(doc.content, 500, 50);

    // 3. Generate embeddings
    for (let i = 0; i < chunks.length; i++) {
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunks[i]
      });

      const embedding = embeddingResponse.data[0].embedding;

      const { error: embedError } = await supabase
        .from('rag_embeddings')
        .insert({
          document_id: documentId,
          chunk_index: i,
          chunk_text: chunks[i],
          embedding: JSON.stringify(embedding)
        });

      if (embedError) throw embedError;
    }

    return NextResponse.json({
      chunksCreated: chunks.length
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }

  return chunks;
}
