"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, Sparkles } from "lucide-react"

interface ImportDataModalProps {
  isOpen: boolean
  onClose: () => void
  targetSection:
    | "clientInfo"
    | "backgroundHistory"
    | "abcObservations"
    | "assessmentData"
    | "goals"
    | "interventions"
    | "serviceSchedule"
  onDataExtracted: (data: any) => void
}

export function ImportDataModal({ isOpen, onClose, targetSection, onDataExtracted }: ImportDataModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [fileContent, setFileContent] = useState<string>("")
  const [extractedData, setExtractedData] = useState<any>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionStatus, setExtractionStatus] = useState<"idle" | "reading" | "extracting" | "success" | "error">(
    "idle",
  )
  const [errorMessage, setErrorMessage] = useState<string>("")
  const { toast } = useToast()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setExtractionStatus("reading")
    setExtractedData(null)
    setErrorMessage("")

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch("/api/extract-pdf-text", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error || data.suggestion || "Failed to read file")
      }

      if (!data.text || data.text.trim().length < 50) {
        throw new Error("File appears to be empty or contains no readable text")
      }

      setFileContent(data.text)
      console.log("[v0] Extracted text length:", data.text.length)

      // Auto-extract with AI
      await extractWithAI(data.text, data.type || selectedFile.type)
    } catch (error: any) {
      console.error("[v0] File read error:", error)
      setExtractionStatus("error")
      setErrorMessage(error.message)
      toast({
        title: "Error Reading File",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const extractWithAI = async (content: string, fileType: string) => {
    if (!content || content.trim().length < 50) {
      setExtractionStatus("error")
      setErrorMessage(
        "Could not read file content. The PDF may be scanned or image-based. Try a different file or convert to text format.",
      )
      toast({
        title: "Extraction Failed",
        description: "Could not read text from file. Try a text-based PDF or TXT/JSON file.",
        variant: "destructive",
      })
      return
    }

    setIsExtracting(true)
    setExtractionStatus("extracting")

    try {
      const response = await fetch("/api/extract-document-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentContent: content,
          documentType: fileType,
          targetSection,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.data) {
        setExtractedData(data.data)
        setExtractionStatus("success")
        setErrorMessage("")
        toast({
          title: "Data Extracted!",
          description: `Successfully extracted ${data.fieldsExtracted} fields`,
        })
      } else {
        throw new Error(data.error || "No data extracted")
      }
    } catch (error: any) {
      console.error("[v0] Extraction error:", error)
      setExtractionStatus("error")
      setErrorMessage(error.message)
      toast({
        title: "Extraction Failed",
        description: error.message || "Could not extract data",
        variant: "destructive",
      })
    } finally {
      setIsExtracting(false)
    }
  }

  const handleApplyData = () => {
    if (extractedData) {
      onDataExtracted(extractedData)
      toast({ title: "Data Applied!", description: "Form has been populated with extracted data" })
      onClose()
    }
  }

  const getFieldCount = () => {
    if (!extractedData) return { filled: 0, total: 0 }
    const entries = Object.entries(extractedData)
    const filled = entries.filter(([_, v]) => v && v !== "" && (Array.isArray(v) ? v.length > 0 : true)).length
    return { filled, total: entries.length }
  }

  const { filled, total } = getFieldCount()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-teal-500" />
            AI-Powered Data Import
          </DialogTitle>
          <p className="text-sm text-gray-500">
            Upload a document and AI will automatically extract and fill the form fields
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4 py-4">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
              file ? "border-teal-300 bg-teal-50" : "border-gray-200 hover:border-teal-300"
            }`}
          >
            <input
              type="file"
              accept=".pdf,.json,.csv,.txt"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="h-8 w-8 text-teal-500" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-400 mt-1">PDF, JSON, CSV, TXT supported</p>
                </div>
              )}
            </label>
          </div>

          {/* Extraction Status */}
          {extractionStatus !== "idle" && (
            <div
              className={`rounded-lg p-4 ${
                extractionStatus === "success"
                  ? "bg-green-50 border border-green-200"
                  : extractionStatus === "error"
                    ? "bg-red-50 border border-red-200"
                    : "bg-blue-50 border border-blue-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {extractionStatus === "reading" && (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500 mt-0.5" />
                    <span className="text-blue-700">Reading document...</span>
                  </>
                )}
                {extractionStatus === "extracting" && (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500 mt-0.5" />
                    <span className="text-blue-700">AI is extracting data...</span>
                  </>
                )}
                {extractionStatus === "success" && (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <span className="text-green-700">
                      Extracted {filled} of {total} fields successfully!
                    </span>
                  </>
                )}
                {extractionStatus === "error" && (
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="text-red-700 font-medium">Extraction Failed</p>
                        <p className="text-red-600 text-sm mt-1">
                          {errorMessage || "Could not extract data from document"}
                        </p>
                        <p className="text-red-500 text-xs mt-2">
                          Tip: If this is a scanned PDF, try converting it to text first using an OCR tool, or upload a
                          JSON/TXT file instead.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Data Preview */}
          {extractedData && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
                <span className="font-medium text-sm">Extracted Data Preview</span>
                <span className="text-xs text-gray-500">
                  {filled}/{total} fields
                </span>
              </div>
              <div className="max-h-64 overflow-auto p-4">
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(extractedData).map(([key, value]) => (
                    <div key={key} className={`text-sm ${value ? "" : "opacity-50"}`}>
                      <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</span>
                      <span className="ml-2 font-medium">
                        {Array.isArray(value) ? (value.length > 0 ? `${value.length} items` : "None") : value || "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleApplyData}
            disabled={!extractedData || isExtracting}
            className="bg-teal-500 hover:bg-teal-600"
          >
            {isExtracting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Extracting...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Apply {filled} Fields to Form
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
