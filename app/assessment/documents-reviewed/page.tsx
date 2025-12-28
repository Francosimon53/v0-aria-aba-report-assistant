"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { SaveIcon, PlusIcon, TrashIcon } from "@/components/icons" // Added Home import
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, FileText, Check } from "lucide-react"
import { AssessmentSidebar } from "@/components/assessment-sidebar"
import { safeGetItem, safeSetItem } from "@/lib/safe-storage"

interface DocumentReviewed {
  id: string
  type: string
  name: string
  date: string
  source: string
  reviewed: boolean
  notes: string
}

const COMMON_DOCUMENTS = [
  { type: "Medical Records", name: "Diagnostic Evaluation" },
  { type: "Medical Records", name: "Psychological Evaluation" },
  { type: "Medical Records", name: "Developmental Pediatrician Report" },
  { type: "Medical Records", name: "Neurological Evaluation" },
  { type: "Educational Records", name: "IEP (Individualized Education Program)" },
  { type: "Educational Records", name: "504 Plan" },
  { type: "Educational Records", name: "School Progress Reports" },
  { type: "Educational Records", name: "Teacher Reports" },
  { type: "Previous Assessments", name: "Previous ABA Assessment" },
  { type: "Previous Assessments", name: "VB-MAPP" },
  { type: "Previous Assessments", name: "ABLLS-R" },
  { type: "Previous Assessments", name: "ADOS-2" },
  { type: "Therapy Records", name: "Speech Therapy Evaluation" },
  { type: "Therapy Records", name: "Occupational Therapy Evaluation" },
  { type: "Therapy Records", name: "Physical Therapy Evaluation" },
  { type: "Therapy Records", name: "Previous ABA Progress Reports" },
  { type: "Insurance", name: "Insurance Authorization" },
  { type: "Insurance", name: "Prior Authorization Letter" },
  { type: "Legal", name: "Custody Documentation" },
  { type: "Legal", name: "Guardianship Papers" },
]

export default function DocumentsReviewedPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const [documents, setDocuments] = useState<DocumentReviewed[]>([])
  const [additionalNotes, setAdditionalNotes] = useState("")

  useEffect(() => {
    setIsClient(true)
    const saved = safeGetItem("aria-documents-reviewed", null)
    if (saved) {
      setDocuments(saved.documents || [])
      setAdditionalNotes(saved.additionalNotes || "")
    }
  }, [])

  useEffect(() => {
    if (!isClient) return
    const timer = setTimeout(() => {
      safeSetItem("aria-documents-reviewed", { documents, additionalNotes })
    }, 1000)
    return () => clearTimeout(timer)
  }, [documents, additionalNotes, isClient])

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    safeSetItem("aria-documents-reviewed", { documents, additionalNotes })
    setLastSaved(new Date())
    setIsSaving(false)
    toast({ title: "Saved", description: "Documents reviewed saved successfully" })
  }

  const addDocument = (type?: string, name?: string) => {
    const newDoc: DocumentReviewed = {
      id: `doc-${Date.now()}`,
      type: type || "",
      name: name || "",
      date: "",
      source: "",
      reviewed: true,
      notes: "",
    }
    setDocuments((prev) => [...prev, newDoc])
  }

  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id))
  }

  const updateDocument = (id: string, field: keyof DocumentReviewed, value: string | boolean) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)))
  }

  const addCommonDocument = (doc: { type: string; name: string }) => {
    const exists = documents.some((d) => d.type === doc.type && d.name === doc.name)
    if (!exists) {
      addDocument(doc.type, doc.name)
    }
  }

  const reviewedCount = documents.filter((d) => d.reviewed).length
  const documentTypes = [...new Set(documents.map((d) => d.type))].filter(Boolean)

  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <AssessmentSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Documents Reviewed</h1>
            <p className="text-sm text-slate-500">Track all documents reviewed for this assessment</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-teal-50 text-teal-700">
              {reviewedCount} documents reviewed
            </Badge>
            {lastSaved && <span className="text-xs text-slate-400">Last saved {lastSaved.toLocaleTimeString()}</span>}
            <Button variant="outline" onClick={handleSave} disabled={isSaving}>
              <SaveIcon className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Quick Add Common Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Quick Add Common Documents
                </CardTitle>
                <CardDescription>Click to add commonly reviewed documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {COMMON_DOCUMENTS.map((doc, i) => {
                    const exists = documents.some((d) => d.type === doc.type && d.name === doc.name)
                    return (
                      <Button
                        key={i}
                        variant={exists ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => addCommonDocument(doc)}
                        disabled={exists}
                        className={exists ? "opacity-50" : ""}
                      >
                        {exists && <Check className="h-3 w-3 mr-1" />}
                        {doc.name}
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Documents List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Documents Reviewed</CardTitle>
                    <CardDescription>List of all documents reviewed for this assessment</CardDescription>
                  </div>
                  <Button onClick={() => addDocument()} size="sm">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Custom Document
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No documents added yet</p>
                    <p className="text-sm">Use the quick add buttons above or add a custom document</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Group by type */}
                    {documentTypes.length > 0 &&
                      documentTypes.map((type) => (
                        <div key={type} className="space-y-2">
                          <h3 className="font-medium text-slate-700 text-sm uppercase tracking-wide">{type}</h3>
                          {documents
                            .filter((d) => d.type === type)
                            .map((doc) => (
                              <div
                                key={doc.id}
                                className={`p-4 border rounded-lg ${doc.reviewed ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200"}`}
                              >
                                <div className="flex items-start gap-4">
                                  <Checkbox
                                    checked={doc.reviewed}
                                    onCheckedChange={(checked) =>
                                      updateDocument(doc.id, "reviewed", checked as boolean)
                                    }
                                  />
                                  <div className="flex-1 grid grid-cols-4 gap-4">
                                    <div>
                                      <Label className="text-xs">Document Type</Label>
                                      <Input
                                        value={doc.type}
                                        onChange={(e) => updateDocument(doc.id, "type", e.target.value)}
                                        placeholder="Type"
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">Document Name</Label>
                                      <Input
                                        value={doc.name}
                                        onChange={(e) => updateDocument(doc.id, "name", e.target.value)}
                                        placeholder="Name"
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">Date</Label>
                                      <Input
                                        type="date"
                                        value={doc.date}
                                        onChange={(e) => updateDocument(doc.id, "date", e.target.value)}
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">Source</Label>
                                      <Input
                                        value={doc.source}
                                        onChange={(e) => updateDocument(doc.id, "source", e.target.value)}
                                        placeholder="e.g., Parent, School"
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="sm" onClick={() => removeDocument(doc.id)}>
                                    <TrashIcon className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="mt-2 ml-8">
                                  <Input
                                    value={doc.notes}
                                    onChange={(e) => updateDocument(doc.id, "notes", e.target.value)}
                                    placeholder="Notes about this document..."
                                    className="h-8 text-sm"
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      ))}
                    {/* Documents without type */}
                    {documents.filter((d) => !d.type).length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-medium text-slate-700 text-sm uppercase tracking-wide">Other</h3>
                        {documents
                          .filter((d) => !d.type)
                          .map((doc) => (
                            <div
                              key={doc.id}
                              className={`p-4 border rounded-lg ${doc.reviewed ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200"}`}
                            >
                              <div className="flex items-start gap-4">
                                <Checkbox
                                  checked={doc.reviewed}
                                  onCheckedChange={(checked) => updateDocument(doc.id, "reviewed", checked as boolean)}
                                />
                                <div className="flex-1 grid grid-cols-4 gap-4">
                                  <div>
                                    <Label className="text-xs">Document Type</Label>
                                    <Input
                                      value={doc.type}
                                      onChange={(e) => updateDocument(doc.id, "type", e.target.value)}
                                      placeholder="Type"
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Document Name</Label>
                                    <Input
                                      value={doc.name}
                                      onChange={(e) => updateDocument(doc.id, "name", e.target.value)}
                                      placeholder="Name"
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Date</Label>
                                    <Input
                                      type="date"
                                      value={doc.date}
                                      onChange={(e) => updateDocument(doc.id, "date", e.target.value)}
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Source</Label>
                                    <Input
                                      value={doc.source}
                                      onChange={(e) => updateDocument(doc.id, "source", e.target.value)}
                                      placeholder="e.g., Parent, School"
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => removeDocument(doc.id)}>
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
                <CardDescription>Any additional notes about documents reviewed or requested</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="e.g., Awaiting school records, parent to provide updated IEP..."
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>
          </div>
        </main>

        <footer className="bg-white border-t px-6 py-4 flex items-center justify-between shrink-0">
          <Button variant="outline" onClick={() => router.push("/assessment/background-history")}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button onClick={() => router.push("/assessment/evaluation")} className="bg-teal-600 hover:bg-teal-700">
            Next: Evaluation
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </footer>
      </div>
    </div>
  )
}
