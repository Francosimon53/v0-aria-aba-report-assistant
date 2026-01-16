import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Schema definitions for each section
const EXTRACTION_SCHEMAS = {
  clientInfo: {
    firstName: "string - Client's first name",
    lastName: "string - Client's last name",
    dateOfBirth: "string - Date of birth in MM/DD/YYYY format",
    age: "number - Client's age in years",
    gender: "string - Male/Female/Other",
    diagnosis: "string - Primary diagnosis (e.g., Autism Spectrum Disorder Level 2)",
    diagnosisCode: "string - ICD-10 code (e.g., F84.0)",
    insuranceProvider: "string - Insurance company name",
    insuranceId: "string - Insurance member ID",
    guardianName: "string - Parent/guardian full name",
    guardianPhone: "string - Phone number",
    guardianEmail: "string - Email address",
    address: "string - Full address",
    referralSource: "string - Who referred the client",
    referralDate: "string - Date of referral",
  },

  backgroundHistory: {
    medicalHistory: "string - Relevant medical history",
    developmentalMilestones: "string - Developmental milestone information",
    previousTherapies: "string - Previous therapies and outcomes",
    medications: "array - List of current medications",
    allergies: "array - List of allergies",
    familyHistory: "string - Relevant family history",
    educationalPlacement: "string - Current school/educational setting",
    livingArrangement: "string - Home environment description",
  },

  abcObservations: {
    observations:
      "array of objects with: date, time, setting, antecedent, behavior, consequence, function, duration, intensity",
  },

  assessmentData: {
    assessmentType: "string - Initial or Reassessment",
    assessmentDate: "string - Date of assessment",
    assessor: "string - Name of BCBA conducting assessment",
    instruments: "array - Assessment instruments used (VB-MAPP, ABLLS-R, Vineland-3, etc.)",
    scores: "object - Assessment scores by domain",
  },

  goals: {
    goals: "array of objects with: domain, goalText, baseline, target, targetDate, measurementMethod",
  },

  interventions: {
    interventions: "array of objects with: name, description, targetBehavior, function, procedures",
  },

  serviceSchedule: {
    authorizedHours: "object with: rbt, bcba, familyTraining",
    recommendedSchedule: "object with days and times",
  },
}

export async function POST(request: Request) {
  try {
    const { documentContent, documentType, targetSection } = await request.json()

    const schema = EXTRACTION_SCHEMAS[targetSection as keyof typeof EXTRACTION_SCHEMAS] || EXTRACTION_SCHEMAS.clientInfo

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: `You are an expert ABA data extraction system. Extract ALL relevant information from this ${documentType} document and map it to the required fields.

DOCUMENT CONTENT:
${documentContent}

REQUIRED FIELDS TO EXTRACT:
${JSON.stringify(schema, null, 2)}

EXTRACTION RULES:
1. Extract EVERY piece of relevant information, even if partially available
2. For dates, convert to MM/DD/YYYY format
3. For phone numbers, format as (XXX) XXX-XXXX
4. For diagnosis, include both the name and severity level if mentioned
5. Look for information in tables, headers, paragraphs - anywhere in the document
6. If a field is not found, use empty string "" not null
7. For arrays, extract all items found
8. Be thorough - insurance documents often have IDs in headers, names in multiple places
9. Look for: patient name, DOB, member ID, group number, diagnosis codes, provider info
10. Extract guardian/parent info from signature sections or contact info

Return ONLY a valid JSON object with the extracted data. No markdown, no explanation, just the JSON.

Example output format:
{
  "firstName": "Marcus",
  "lastName": "Johnson",
  "dateOfBirth": "05/15/2019",
  "diagnosis": "Autism Spectrum Disorder, Level 2",
  ...
}`,
        },
      ],
    })

    const content = message.content[0].type === "text" ? message.content[0].text : "{}"

    // Clean and parse JSON
    let extractedData
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim()
      extractedData = JSON.parse(cleanContent)
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      return NextResponse.json({ error: "Failed to parse extracted data" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: extractedData,
      fieldsExtracted: Object.keys(extractedData).filter((k) => extractedData[k] && extractedData[k] !== "").length,
    })
  } catch (error) {
    console.error("Extraction error:", error)
    return NextResponse.json({ error: "Failed to extract data" }, { status: 500 })
  }
}
