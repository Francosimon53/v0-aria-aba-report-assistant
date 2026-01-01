import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 30

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
      const arrayBuffer = await file.arrayBuffer()

      // Use pdf.js for extraction
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs")

      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: true,
      })

      const pdf = await loadingTask.promise
      let fullText = ""

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .filter((item: any) => item.str)
          .map((item: any) => item.str)
          .join(" ")
        fullText += pageText + "\n\n"
      }

      console.log("[v0] Extracted", pdf.numPages, "pages,", fullText.length, "characters")

      if (fullText.trim().length < 50) {
        return NextResponse.json(
          {
            error: "PDF appears to be empty or image-based. Try a text-based PDF.",
            text: "",
            pages: pdf.numPages,
          },
          { status: 422 },
        )
      }

      return NextResponse.json({
        text: fullText.trim(),
        type: "pdf",
        pages: pdf.numPages,
      })
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
