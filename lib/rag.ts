export async function queryRAG(query: string, category?: string) {
  const response = await fetch("/api/rag/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, category, matchCount: 5 }),
  })

  if (!response.ok) {
    console.error("RAG query failed")
    return []
  }

  const data = await response.json()
  return data.results || []
}

export async function getRAGContext(instruments: string[]): Promise<string> {
  if (!instruments.length) return ""

  const query = `Assessment instruments: ${instruments.join(", ")}`
  const results = await queryRAG(query, "assessment_instrument")

  if (!results.length) return ""

  return results.map((r: any) => r.content).join("\n\n")
}
