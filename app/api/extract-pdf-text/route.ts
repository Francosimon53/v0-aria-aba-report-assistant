import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const fileType = file.type
    const fileName = file.name.toLowerCase()

    // Handle JSON files
    if (fileType === "application/json" || fileName.endsWith(".json")) {
      const text = await file.text()
      return NextResponse.json({ text, type: "json" })
    }

    // Handle CSV files
    if (fileType === "text/csv" || fileName.endsWith(".csv")) {
      const text = await file.text()
      return NextResponse.json({ text, type: "csv" })
    }

    // Handle text files
    if (fileType === "text/plain" || fileName.endsWith(".txt")) {
      const text = await file.text()
      return NextResponse.json({ text, type: "txt" })
    }

    if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer())

        // Dynamic import of pdf-parse to avoid build issues
        const pdfParse = (await import("pdf-parse")).default
        const data = await pdfParse(buffer)

        if (!data.text || data.text.trim().length < 50) {
          throw new Error("PDF appears to have no readable text")
        }

        return NextResponse.json({
          text: data.text,
          pages: data.numpages,
          type: "pdf",
        })
      } catch (pdfError: any) {
        console.error("PDF parse error:", pdfError)

        // Fallback: Try to read as text (for some PDFs)
        try {
          const text = await file.text()
          if (text && text.length > 100) {
            return NextResponse.json({ text, type: "pdf-text" })
          }
        } catch {}

        return NextResponse.json(
          {
            error: "Could not extract text from PDF. The file may be scanned/image-based.",
            suggestion: "Try uploading a text-based PDF or convert to TXT/JSON format",
          },
          { status: 422 },
        )
      }
    }

    return NextResponse.json(
      {
        error: "Unsupported file type",
        supported: ["pdf", "json", "csv", "txt"],
      },
      { status: 400 },
    )
  } catch (error: any) {
    console.error("File extraction error:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to process file",
      },
      { status: 500 },
    )
  }
}
