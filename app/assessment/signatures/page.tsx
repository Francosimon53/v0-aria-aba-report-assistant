"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { SaveIcon } from "@/components/icons"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Pen, Check, AlertCircle, User } from "lucide-react"
import { AssessmentSidebar } from "@/components/assessment-sidebar"
import { useStepData } from "@/lib/hooks/use-step-data"
import { useSafeNavigation } from "@/lib/hooks/use-safe-navigation"
import { useAssessmentSession } from "@/components/assessment/AssessmentSessionProvider"

interface SignatureLine {
  id: string
  role: string
  name: string
  credentials: string
  licenseNumber: string
  date: string
  signed: boolean
  signatureData: string | null
}

const DEFAULT_SIGNATURES: SignatureLine[] = [
  {
    id: "sig-bcba",
    role: "Board Certified Behavior Analyst (BCBA)",
    name: "",
    credentials: "BCBA",
    licenseNumber: "",
    date: "",
    signed: false,
    signatureData: null,
  },
  {
    id: "sig-bcaba",
    role: "Board Certified Assistant Behavior Analyst (BCaBA)",
    name: "",
    credentials: "BCaBA",
    licenseNumber: "",
    date: "",
    signed: false,
    signatureData: null,
  },
  {
    id: "sig-caregiver",
    role: "Parent/Caregiver",
    name: "",
    credentials: "",
    licenseNumber: "",
    date: "",
    signed: false,
    signatureData: null,
  },
]

export const dynamic = "force-dynamic"

export default function SignaturesPage() {
  const router = useRouter()
  const { navigateTo } = useSafeNavigation()
  const { assessmentId } = useAssessmentSession()

  const {
    value: signatures,
    setValue: setSignatures,
    status,
    saveNow,
  } = useStepData<SignatureLine[]>("signatures", DEFAULT_SIGNATURES)

  const [activeSignature, setActiveSignature] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const handleSave = async () => {
    await saveNow()
    toast({ title: "Saved", description: "Signatures saved successfully" })
  }

  const updateSignature = (id: string, field: keyof SignatureLine, value: string | boolean | null) => {
    setSignatures((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    setIsDrawing(true)
    const rect = canvas.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.strokeStyle = "#1e293b"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const saveSignature = () => {
    if (!activeSignature) return
    const canvas = canvasRef.current
    if (!canvas) return

    const signatureData = canvas.toDataURL("image/png")
    const updatedSignatures = signatures.map((s) =>
      s.id === activeSignature
        ? {
            ...s,
            signatureData,
            signed: true,
            date: new Date().toISOString().split("T")[0],
          }
        : s,
    )
    setSignatures(updatedSignatures)
    setActiveSignature(null)
    clearCanvas()
    toast({ title: "Signature Saved", description: "Signature has been captured successfully" })
  }

  const signedCount = signatures.filter((s) => s.signed).length
  const requiredSigned = signatures
    .filter((s) => s.role.includes("BCBA") && !s.role.includes("BCaBA"))
    .every((s) => s.signed)

  return (
    <div className="flex h-screen bg-slate-50">
      <AssessmentSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Signatures</h1>
            <p className="text-sm text-slate-500">Collect required signatures for the assessment</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={requiredSigned ? "default" : "destructive"}
              className={requiredSigned ? "bg-green-500" : ""}
            >
              {signedCount}/{signatures.length} signed
            </Badge>
            {status === "saved" && (
              <span className="text-xs text-slate-400">
                Last saved {new Date(status.timestamp).toLocaleTimeString()}
              </span>
            )}
            <Button variant="outline" onClick={handleSave} disabled={status === "saving"}>
              <SaveIcon className="h-4 w-4 mr-2" />
              {status === "saving" ? "Saving..." : "Save"}
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Status Banner */}
            {!requiredSigned && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-medium text-amber-800">BCBA Signature Required</p>
                  <p className="text-sm text-amber-600">
                    The supervising BCBA must sign before the report can be finalized.
                  </p>
                </div>
              </div>
            )}

            {/* Signature Lines */}
            {signatures.map((sig) => (
              <Card key={sig.id} className={sig.signed ? "border-green-300 bg-green-50" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {sig.signed ? (
                        <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="h-5 w-5 text-white" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-slate-500" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{sig.role}</CardTitle>
                        <CardDescription>{sig.signed ? `Signed on ${sig.date}` : "Signature required"}</CardDescription>
                      </div>
                    </div>
                    {sig.signed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          updateSignature(sig.id, "signed", false)
                          updateSignature(sig.id, "signatureData", null)
                          updateSignature(sig.id, "date", "")
                        }}
                      >
                        Clear Signature
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-2">
                      <Label>Full Name</Label>
                      <Input
                        value={sig.name}
                        onChange={(e) => updateSignature(sig.id, "name", e.target.value)}
                        placeholder="Enter full name"
                      />
                    </div>
                    {sig.credentials && (
                      <div>
                        <Label>Credentials</Label>
                        <Input
                          value={sig.credentials}
                          onChange={(e) => updateSignature(sig.id, "credentials", e.target.value)}
                          placeholder="e.g., BCBA, LBA"
                        />
                      </div>
                    )}
                    {sig.role.includes("BCBA") && (
                      <div>
                        <Label>License Number</Label>
                        <Input
                          value={sig.licenseNumber}
                          onChange={(e) => updateSignature(sig.id, "licenseNumber", e.target.value)}
                          placeholder="License #"
                        />
                      </div>
                    )}
                  </div>

                  {/* Signature Display or Capture */}
                  {sig.signed && sig.signatureData ? (
                    <div className="border rounded-lg p-4 bg-white">
                      <Label className="text-xs text-slate-500 mb-2 block">Signature</Label>
                      <img
                        src={sig.signatureData || "/placeholder.svg"}
                        alt="Signature"
                        className="h-20 object-contain"
                      />
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setActiveSignature(sig.id)}
                      className="w-full h-24 border-dashed"
                    >
                      <Pen className="h-5 w-5 mr-2" />
                      Click to Sign
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Signature Pad Modal */}
            {activeSignature && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <Card className="w-[600px]">
                  <CardHeader>
                    <CardTitle>Draw Signature</CardTitle>
                    <CardDescription>
                      Sign for: {signatures.find((s) => s.id === activeSignature)?.role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-slate-300 rounded-lg">
                      <canvas
                        ref={canvasRef}
                        width={550}
                        height={200}
                        className="w-full cursor-crosshair"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Button variant="outline" onClick={clearCanvas}>
                        Clear
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setActiveSignature(null)
                            clearCanvas()
                          }}
                        >
                          Cancel
                        </Button>
                        <Button onClick={saveSignature} className="bg-teal-600 hover:bg-teal-700">
                          <Check className="h-4 w-4 mr-2" />
                          Save Signature
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Certification Statement */}
            <Card>
              <CardHeader>
                <CardTitle>Certification Statement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 leading-relaxed">
                  By signing above, I certify that I have personally conducted or supervised this assessment, that the
                  information contained in this report is accurate to the best of my knowledge, and that the recommended
                  services are medically necessary for the treatment of the identified conditions. I understand that
                  this document may be used for insurance authorization purposes and that any falsification of
                  information may result in denial of services or other penalties.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>

        <footer className="bg-white border-t px-6 py-4 flex items-center justify-between shrink-0">
          <Button variant="outline" onClick={() => navigateTo("/assessment/medical-necessity", saveNow)}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous: Medical Necessity
          </Button>
          <Button
            onClick={() => navigateTo("/assessment/generate-report", saveNow)}
            className="bg-teal-600 hover:bg-teal-700"
            disabled={!requiredSigned}
          >
            Finalize Report
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </footer>
      </div>
    </div>
  )
}
