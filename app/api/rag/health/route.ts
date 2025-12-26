import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const [{ count: docCount }, { count: embCount }] = await Promise.all([
      supabase.from('rag_documents').select('*', { count: 'exact', head: true }),
      supabase.from('rag_embeddings').select('*', { count: 'exact', head: true })
    ]);

    return NextResponse.json({
      status: 'healthy',
      database: {
        connected: true,
        documentsCount: docCount || 0,
        embeddingsCount: embCount || 0
      },
      message: 'RAG system ready',
      version: '1.0.0'
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      database: { connected: false, documentsCount: 0, embeddingsCount: 0 },
      error: error.message,
      version: '1.0.0'
    }, { status: 500 });
  }
}
