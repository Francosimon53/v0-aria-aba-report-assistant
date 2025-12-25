import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    database: { connected: false, documentsCount: 0, embeddingsCount: 0 },
    message: 'RAG endpoints ready - configure Supabase to activate',
    version: '1.0.0'
  });
}
