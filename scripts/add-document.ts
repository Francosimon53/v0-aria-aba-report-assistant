import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const openaiKey = process.env.OPENAI_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiKey });

async function addDocument(filePath: string, metadata: any = {}) {
  console.log(`📄 Processing: ${filePath}`);
  
  // 1. Leer el archivo
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // 2. Crear documento en la DB
  const { data: doc, error: docError } = await supabase
    .from('rag_documents')
    .insert({
      title: metadata.title || path.basename(filePath),
      content,
      document_type: metadata.type || 'text',
      insurance_provider: metadata.provider,
      metadata: metadata
    })
    .select()
    .single();

  if (docError) throw docError;
  console.log(`✅ Document created: ${doc.id}`);

  // 3. Dividir en chunks
  const chunks = chunkText(content, 500, 50);
  console.log(`📦 Created ${chunks.length} chunks`);

  // 4. Generar embeddings y guardar
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: chunk
    });
    
    const embedding = embeddingResponse.data[0].embedding;
    
    const { error: embError } = await supabase
      .from('rag_embeddings')
      .insert({
        document_id: doc.id,
        chunk_index: i,
        chunk_text: chunk,
        embedding: JSON.stringify(embedding)
      });

    if (embError) throw embError;
    console.log(`✅ Chunk ${i + 1}/${chunks.length} embedded`);
  }

  console.log(`🎉 Document added successfully!`);
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

// Uso
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node --loader tsx scripts/add-document.ts <file-path> [--title "Title"] [--type "type"] [--provider "Provider"]');
  process.exit(1);
}

const filePath = args[0];
const metadata: any = {};

for (let i = 1; i < args.length; i += 2) {
  const key = args[i].replace('--', '');
  const value = args[i + 1];
  metadata[key] = value;
}

addDocument(filePath, metadata);
