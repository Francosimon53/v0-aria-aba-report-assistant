import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { title, content, type, provider } = await request.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('rag_documents')
      .insert({
        title,
        content,
        document_type: type,
        insurance_provider: provider || null
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      documentId: data.id,
      title: data.title
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
