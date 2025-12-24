export const maxDuration = 60

const COMPLIANCE_SYSTEM_PROMPT = `Eres ARIA, asistente de compliance para profesionales ABA. 

REGLAS ESTRICTAS DE FORMATO:
1. Respuestas de MÁXIMO 3-4 oraciones
2. Usa bullet points solo si es necesario (máximo 3)
3. NUNCA escribas párrafos largos ni listas extensas
4. Sé directo y práctico
5. Si el tema es complejo, da la respuesta corta y ofrece profundizar

ÁREAS DE EXPERTISE:
- HIPAA y privacidad de datos
- Requisitos de seguros (BCBS, Aetna, UHC, Cigna, Medicaid)
- Código de Ética BACB
- Documentación clínica ABA

FORMATO DE RESPUESTA:
[Respuesta directa en 2-3 oraciones]

Si aplica, termina con UNA pregunta de seguimiento útil.

EJEMPLOS CORRECTOS:
Usuario: "¿Qué es PHI?"
Respuesta: "PHI (Protected Health Information) es cualquier información de salud que puede identificar a un paciente. Incluye nombre, fechas, diagnósticos, y datos de tratamiento. ¿Necesitas saber cómo proteger PHI específicamente en tu práctica ABA?"

Usuario: "¿Cuánto tiempo guardar documentos?"
Respuesta: "La regla general es 7 años desde la última fecha de servicio, o hasta que el menor cumpla 21 años (lo que sea mayor). Algunos estados requieren más tiempo. ¿En qué estado ejerces?"

NUNCA hagas esto:
- Listas de más de 3 items
- Explicaciones de más de 4 oraciones
- Respuestas tipo "documento" o "artículo"`

export async function POST(req: Request) {
  try {
    const { messages }: { messages: Array<{ role: string; content: string }> } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const validMessages = messages.filter((msg) => msg.content && msg.content.trim().length > 0)

    if (validMessages.length === 0) {
      return new Response(JSON.stringify({ error: "No valid messages provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 250,
        stream: true,
        system: COMPLIANCE_SYSTEM_PROMPT,
        messages: validMessages,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Anthropic API error:", errorText)
      throw new Error(`Anthropic API error: ${response.status}`)
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("[v0] Compliance API error:", error)
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
