import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ embedding: null }, { status: 200 })
    }

    // Use OpenAI embeddings API via fetch since AI SDK doesn't have native embedding support
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text.slice(0, 8000),
      }),
    })

    if (!response.ok) {
      console.error("[v0] OpenAI embeddings error:", await response.text())
      return NextResponse.json({ embedding: null }, { status: 200 })
    }

    const data = await response.json()

    return NextResponse.json({
      embedding: data.data?.[0]?.embedding || null,
    })
  } catch (error) {
    console.error("[v0] Embedding generation error:", error)
    // Return null embedding gracefully - don't break the flow
    return NextResponse.json({ embedding: null }, { status: 200 })
  }
}
