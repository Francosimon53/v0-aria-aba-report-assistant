import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as fs from 'fs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

async function ingest() {
  console.log('📄 Reading document...');
  const content = fs.readFileSync('test-document.txt', 'utf-8');
  
  console.log('📝 Creating document in database...');
  const { data: doc, error } = await supabase
    .from('rag_documents')
    .insert({
      title: 'ABA Therapy Goals - Best Practices',
      content,
      document_type: 'guideline',
      insurance_provider: 'aetna'
    })
    .select()
    .single();

  if (error) throw new Error(`DB Error: ${error.message}`);
  
  console.log('✂️  Chunking...');
  const chunks = chunkText(content, 500);
  console.log(`   ${chunks.length} chunks`);
  
  console.log('🤖 Embeddings...');
  for (let i = 0; i < chunks.length; i++) {
    console.log(`   ${i + 1}/${chunks.length}`);
    const res = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: chunks[i]
    });
    await supabase.from('rag_embeddings').insert({
      document_id: doc.id,
      chunk_text: chunks[i],
      chunk_index: i,
      embedding: res.data[0].embedding
    });
  }
  console.log('✅ Done!');
}

function chunkText(text: string, size: number): string[] {
  const chunks: string[] = [];
  const lines = text.split('\n');
  let curr = '';
  for (const line of lines) {
    if ((curr + line).length > size && curr) {
      chunks.push(curr.trim());
      curr = line + '\n';
    } else {
      curr += line + '\n';
    }
  }
  if (curr) chunks.push(curr.trim());
  return chunks.filter(c => c.length > 50);
}

ingest().catch(console.error);
