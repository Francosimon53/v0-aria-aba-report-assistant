const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai').default;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiKey });

const DOCUMENT_ID = '1ca4e32b-1d86-4439-8b61-7538a3ffc2a4';

async function generateEmbeddings() {
  console.log('📄 Fetching document...');
  
  const { data: doc, error: docError } = await supabase
    .from('rag_documents')
    .select('content')
    .eq('id', DOCUMENT_ID)
    .single();
  
  if (docError) throw docError;
  
  console.log('✅ Document fetched');
  console.log('📦 Creating chunks...');
  
  const chunks = chunkText(doc.content, 500, 50);
  console.log(`✅ Created ${chunks.length} chunks`);
  
  for (let i = 0; i < chunks.length; i++) {
    console.log(`🔄 Processing chunk ${i + 1}/${chunks.length}...`);
    
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: chunks[i]
    });
    
    const embedding = embeddingResponse.data[0].embedding;
    
    const { error } = await supabase
      .from('rag_embeddings')
      .insert({
        document_id: DOCUMENT_ID,
        chunk_index: i,
        chunk_text: chunks[i],
        embedding: JSON.stringify(embedding)
      });
    
    if (error) throw error;
    console.log(`✅ Chunk ${i + 1} embedded`);
  }
  
  console.log('🎉 All embeddings generated!');
}

function chunkText(text, chunkSize, overlap) {
  const chunks = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }
  
  return chunks;
}

generateEmbeddings().catch(console.error);
