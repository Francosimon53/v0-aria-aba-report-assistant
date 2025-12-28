import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { z } from "zod"

const ClientDataSchema = z.object({
  firstName: z.string().describe("Client's first name"),
  lastName: z.string().describe("Client's last name"),
  dateOfBirth: z.string().describe("Date of birth in MM/DD/YYYY format"),
  diagnosis: z.string().describe("Primary diagnosis (e.g., Autism Spectrum Disorder)"),
  insuranceProvider: z.string().describe("Insurance company name"),
  insuranceId: z.string().describe("Insurance policy or member ID number"),
  guardianName: z.string().optional().describe("Parent or guardian name"),
  guardianPhone: z.string().optional().describe("Guardian phone number"),
  guardianEmail: z.string().optional().describe("Guardian email address"),
  address: z.string().optional().describe("Client's address"),
  assessmentType: z.string().optional().describe("Type of assessment (e.g., WJ, ABLLS, VB-MAPP)"),
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("[v0] PDF parsing started:", file.name, file.type)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")

    console.log("[v0] File converted to base64, size:", base64.length)

    const result = await generateObject({
      model: "anthropic/claude-3-5-sonnet-20241022",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Extract client information from this ABA assessment document. 
              
Look for:
- Client name (first and last)
- Date of birth (DOB)
- Diagnosis or clinical diagnosis
- Insurance information (provider and ID/policy number)
- Parent/guardian contact information
- Address
- Assessment type (WJ, ABLLS, VB-MAPP, etc.)

If you cannot find a field, leave it empty string. Do not make up information.`,
            },
            {
              type: "image",
              image: `data:application/pdf;base64,${base64}`,
            },
          ],
        },
      ],
      schema: ClientDataSchema,
      maxTokens: 1000,
    })

    console.log("[v0] AI extraction successful:", result.object)

    return NextResponse.json({
      success: true,
      data: result.object,
    })
  } catch (error) {
    console.error("[v0] PDF parsing error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to parse PDF"
    const errorDetails = error instanceof Error ? error.stack : String(error)

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 },
    )
  }
}
