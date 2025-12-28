import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

const extractClientData = (text: string) => {
  // Removed pdf-parse dependency and using regex-based extraction

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

    // For PDFs, try to extract text from binary content
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Try to extract text from PDF binary (basic approach)
    let pdfText = ""
    try {
      // Convert buffer to string, filtering for readable text
      const bufferStr = buffer.toString("latin1")
      // Extract text between common PDF text markers
      pdfText = bufferStr
        .replace(/\x00/g, "") // Remove null bytes
        .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F]/g, " ") // Remove control characters
        .replace(/BT[\s\S]*?ET/g, "") // Remove PDF text objects
        .replace(/\/[A-Z0-9]+/g, "") // Remove PDF operators
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join("\n")
        .substring(0, 10000) // Limit to first 10000 chars

      console.log("[v0] PDF text extracted, length:", pdfText.length)
    } catch (extractError) {
      console.error("[v0] PDF text extraction failed:", extractError)
      pdfText = ""
    }

    // Extract data using regex patterns
    const extractedData = extractClientData(pdfText)
    console.log("[v0] Data extraction complete:", extractedData)

    // If regex extraction is incomplete, use Claude to refine the extraction
    if (!extractedData.firstName && pdfText.length > 100) {
      try {
        const { text: refinedText } = await generateText({
          model: "anthropic/claude-3-5-sonnet-20241022",
          prompt: `From the following text (extracted from a PDF), extract these fields in JSON format:
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

TEXT:
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
