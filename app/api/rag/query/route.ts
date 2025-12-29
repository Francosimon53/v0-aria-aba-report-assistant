import { createClient } from "@/lib/supabase/server"
import OpenAI from "openai"
import type { NextRequest } from "next/server"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { query, category, matchCount = 5, threshold = 0.7 } = await req.json()

    if (!query) {
      return Response.json({ error: "Query is required" }, { status: 400 })
    }

    // Create embedding for the query
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: query,
    })

    const queryEmbedding = embeddingResponse.data[0].embedding

    const supabase = await createClient()

    // Search for similar chunks
    const { data: matches, error } = await supabase.rpc("match_rag_embeddings", {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: matchCount,
    })

    if (error) throw error

    // Filter by category if provided
    const filteredMatches = category ? matches?.filter((m: any) => m.metadata?.category === category) : matches

    return Response.json({
      success: true,
      results: filteredMatches || [],
      query,
    })
  } catch (error) {
    console.error("RAG query error:", error)
    return Response.json({ error: "Failed to query documents" }, { status: 500 })
  }
}
