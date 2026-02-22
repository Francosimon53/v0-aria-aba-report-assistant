import { createClient } from "@/lib/supabase/server"
import OpenAI from "openai"
import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
    const { title, content, category, metadata } = await req.json()

    if (!title || !content || !category) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Insert document
    const { data: doc, error: docError } = await supabase
      .from("rag_documents")
      .insert({ title, content, category, metadata: metadata || {} })
      .select()
      .single()

    if (docError) throw docError

    // Split content into chunks (roughly 500 tokens each)
    const chunks = splitIntoChunks(content, 2000)

    // Create embeddings for each chunk
    for (let i = 0; i < chunks.length; i++) {
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: chunks[i],
      })

      const embedding = embeddingResponse.data[0].embedding

      await supabase.from("rag_embeddings").insert({
        document_id: doc.id,
        content: chunks[i],
        embedding,
        chunk_index: i,
        metadata: { title, category },
      })
    }

    return Response.json({
      success: true,
      documentId: doc.id,
      chunksCreated: chunks.length,
    })
  } catch (error) {
    console.error("RAG ingest error:", error)
    return Response.json({ error: "Failed to ingest document" }, { status: 500 })
  }
}

function splitIntoChunks(text: string, maxLength: number): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/)
  const chunks: string[] = []
  let currentChunk = ""

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxLength && currentChunk) {
      chunks.push(currentChunk.trim())
      currentChunk = sentence
    } else {
      currentChunk += " " + sentence
    }
  }
  if (currentChunk.trim()) chunks.push(currentChunk.trim())
  return chunks
}
