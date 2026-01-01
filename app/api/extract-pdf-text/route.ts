import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 30

const getPdfParser = async () => {
  // Import from lib/pdf-parse.js to avoid test file loading issue
  const pdfParse = await import("pdf-parse/lib/pdf-parse.js")
  return pdfParse.default
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const fileName = file.name.toLowerCase()
    console.log("[v0] Processing file:", fileName, "Size:", file.size)

    // Handle text files directly
    if (fileName.endsWith(".txt") || fileName.endsWith(".json") || fileName.endsWith(".csv")) {
      const text = await file.text()
      return NextResponse.json({ text, type: "text", pages: 1 })
    }

    if (fileName.endsWith(".pdf")) {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const pdfParse = await getPdfParser()
        const data = await pdfParse(buffer)

        console.log("[v0] Extracted", data.numpages, "pages,", data.text.length, "characters")

        if (data.text.trim().length < 50) {
          return NextResponse.json(
            {
              error: "PDF appears to be empty or image-based. Try a text-based PDF or OCR tool.",
              text: "",
              pages: data.numpages,
            },
            { status: 422 },
          )
        }

        return NextResponse.json({
          text: data.text.trim(),
          type: "pdf",
          pages: data.numpages,
        })
      } catch (pdfError: any) {
        console.error("[v0] PDF parsing error:", pdfError.message)
        return NextResponse.json(
          {
            error: "Could not parse PDF: " + pdfError.message,
          },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({ error: "Unsupported file type. Use PDF, TXT, JSON, or CSV." }, { status: 400 })
  } catch (error: any) {
    console.error("[v0] Extraction error:", error.message)
    return NextResponse.json(
      {
        error: "Failed to process file: " + error.message,
      },
      { status: 500 },
    )
  }
}
