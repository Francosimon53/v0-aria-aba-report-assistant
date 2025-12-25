import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.query) {
      return NextResponse.json({ error: 'Missing query' }, { status: 400 });
    }

    return NextResponse.json({
      chunks: [],
      query: body.query,
      totalResults: 0,
      processingTime: 0,
      message: "RAG system ready - needs Supabase setup"
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
