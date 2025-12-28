import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import * as pdfParse from "pdf-parse"

const extractClientData = (text: string) => {
  // Extract fields from PDF text using common patterns

  const extractPattern = (pattern: RegExp, defaultValue = "") => {
    const match = text.match(pattern)
    return match ? match[1].trim() : defaultValue
  }

  const firstName = extractPattern(/(?:First Name|Name|Client)[\s:]*([A-Za-z]+)/i)
  const lastName = extractPattern(/(?:Last Name|Surname|Family)[\s:]*([A-Za-z]+)/i)
  const dateOfBirth = extractPattern(/(?:DOB|Date of Birth|Birthdate)[\s:]*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i)
  const diagnosis = extractPattern(/(?:Diagnosis|Dx|Condition|Disorder)[\s:]*([^\n]+)/i)
  const insuranceProvider = extractPattern(/(?:Insurance|Payer|Carrier)[\s:]*([^\n]+)/i)
  const insuranceId = extractPattern(/(?:Policy|Member ID|Member Number|ID Number)[\s:]*([^\n]+)/i)
  const guardianName = extractPattern(/(?:Parent|Guardian|Caregiver)[\s:]*([A-Za-z\s]+)/i)
  const guardianPhone = extractPattern(/(?:Phone|Contact|Telephone)[\s:]*(\d{3}[-.]?\d{3}[-.]?\d{4})/i)
  const guardianEmail = extractPattern(
    /(?:Email|Contact Email)[\s:]*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})/i,
  )
  const address = extractPattern(/(?:Address|Location)[\s:]*([^\n]+)/i)
  const assessmentType = extractPattern(/(?:Assessment|Instrument|Type)[\s:]*([^\n]+)/i)

  return {
    firstName,
    lastName,
    dateOfBirth,
    diagnosis,
    insuranceProvider,
    insuranceId,
    guardianName,
    guardianPhone,
    guardianEmail,
    address,
    assessmentType,
  }
}

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

    let pdfText = ""
    try {
      const pdfData = await pdfParse(buffer)
      pdfText = pdfData.text
      console.log("[v0] PDF text extracted, length:", pdfText.length)
    } catch (pdfError) {
      console.error("[v0] PDF text extraction failed:", pdfError)
      // If pdf-parse fails, return empty
      pdfText = ""
    }

    // Extract data using regex patterns
    const extractedData = extractClientData(pdfText)
    console.log("[v0] Data extraction complete:", extractedData)

    // If regex extraction is incomplete, use Claude to refine the extraction
    if (!extractedData.firstName && pdfText.length > 0) {
      try {
        const { text: refinedText } = await generateText({
          model: "anthropic/claude-3-5-sonnet-20241022",
          prompt: `From the following PDF text, extract these fields in JSON format:
- firstName (client's first name)
- lastName (client's last name)  
- dateOfBirth (MM/DD/YYYY format)
- diagnosis (primary diagnosis)
- insuranceProvider (insurance company)
- insuranceId (policy or member ID)
- guardianName (parent/guardian name)
- guardianPhone (phone number)
- guardianEmail (email address)
- address (client's address)
- assessmentType (e.g., WJ, ABLLS, VB-MAPP)

If a field is not found, use empty string.

PDF TEXT:
${pdfText.substring(0, 5000)}

Return ONLY valid JSON, no other text.`,
          temperature: 0,
          maxTokens: 500,
        })

        try {
          const refined = JSON.parse(refinedText)
          Object.assign(extractedData, refined)
          console.log("[v0] Claude refinement successful")
        } catch {
          console.log("[v0] Claude response was not valid JSON, using regex extraction")
        }
      } catch (claudeError) {
        console.log("[v0] Claude refinement skipped:", claudeError)
        // Continue with regex extraction results
      }
    }

    return NextResponse.json({
      success: true,
      data: extractedData,
    })
  } catch (error) {
    console.error("[v0] PDF parsing error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to parse PDF"

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}
