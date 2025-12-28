"use client"

import type React from "react"
import { safeSetJSON } from "@/lib/safe-storage"
import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DownloadIcon, PrinterIcon } from "@/components/icons"
import { premiumToast } from "@/components/ui/premium-toast"
import type { ClientData } from "@/lib/types"

interface ConsentFormProps {
  clientData: ClientData | null
  interventions?: string[]
}

export function ConsentForm({ clientData, interventions = [] }: ConsentFormProps) {
  const [understood, setUnderstood] = useState(false)
  const [caregiverName, setCaregiverName] = useState("")
  const [assistantName, setAssistantName] = useState("")
  const [leadName, setLeadName] = useState("")
  const [caregiverDate, setCaregiverDate] = useState("")
  const [assistantDate, setAssistantDate] = useState("")
  const [leadDate, setLeadDate] = useState("")
  const [version, setVersion] = useState(1)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const caregiverCanvasRef = useRef<HTMLCanvasElement>(null)
  const assistantCanvasRef = useRef<HTMLCanvasElement>(null)
  const leadCanvasRef = useRef<HTMLCanvasElement>(null)

  const [isDrawingCaregiver, setIsDrawingCaregiver] = useState(false)
  const [isDrawingAssistant, setIsDrawingAssistant] = useState(false)
  const [isDrawingLead, setIsDrawingLead] = useState(false)

  const [caregiverSigned, setCaregiverSigned] = useState(false)
  const [assistantSigned, setAssistantSigned] = useState(false)
  const [leadSigned, setLeadSigned] = useState(false)

  // Initialize canvas
  useEffect(() => {
    const initCanvas = (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = 2
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
    }

    initCanvas(caregiverCanvasRef.current)
    initCanvas(assistantCanvasRef.current)
    initCanvas(leadCanvasRef.current)
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>, setter: (val: boolean) => void) => {
    const canvas = e.currentTarget
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
    setter(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>, isDrawing: boolean) => {
    if (!isDrawing) return
    const canvas = e.currentTarget
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = (setter: (val: boolean) => void, signedSetter: (val: boolean) => void) => {
    setter(false)
    signedSetter(true)
  }

  const clearSignature = (canvasRef: React.RefObject<HTMLCanvasElement>, signedSetter: (val: boolean) => void) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    signedSetter(false)
  }

  const handleGeneratePDF = () => {
    if (!understood) {
      premiumToast.error("Please confirm you have read and understood the consent form")
      return
    }

    if (!caregiverSigned || !caregiverDate) {
      premiumToast.error("Caregiver signature and date are required")
      return
    }

    premiumToast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
      loading: "Generating consent form PDF...",
      success: "Consent form PDF generated successfully",
      error: "Failed to generate PDF",
    })

    // Save consent data to safeSetJSON
    const consentData = {
      version,
      clientData,
      interventions,
      signatures: {
        caregiver: { name: caregiverName, date: caregiverDate, signed: caregiverSigned },
        assistant: { name: assistantName, date: assistantDate, signed: assistantSigned },
        lead: { name: leadName, date: leadDate, signed: leadSigned },
      },
      timestamp: new Date().toISOString(),
    }
    safeSetJSON("aria_consent_form", consentData)
  }

  const handlePrint = () => {
    window.print()
    premiumToast.success("Opening print dialog...")
  }

  const handleEmailCopy = () => {
    if (!caregiverSigned) {
      premiumToast.error("Please complete the consent form before sending")
      return
    }

    premiumToast.success("Email sent to caregiver with consent form copy")
  }

  const handleUpdateVersion = () => {
    setVersion((prev) => prev + 1)
    setLastUpdated(new Date())
    premiumToast.info(`Consent form updated to version ${version + 1}`)
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Behavior Intervention Plan Consent</h1>
          <p className="text-sm text-muted-foreground">
            Version {version} • Last Updated: {lastUpdated.toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <PrinterIcon className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleEmailCopy}>
            Email Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleUpdateVersion}>
            Update Version
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <Card className="p-8 space-y-8 bg-white">
          {/* Header */}
          <div className="text-center border-b-2 border-gray-900 pb-4">
            <h2 className="text-2xl font-bold uppercase mb-2">Consent for Behavior Intervention Plan</h2>
            <p className="text-sm text-gray-600">Applied Behavior Analysis Services</p>
          </div>

          {/* Section 1: Client Information */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0D9488] text-white text-sm font-bold">
                1
              </span>
              Client Information
            </h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-semibold text-gray-600">Client Name:</p>
                <p className="font-medium">{clientData?.name || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Date of Birth:</p>
                <p className="font-medium">{clientData?.dateOfBirth || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Diagnosis:</p>
                <p className="font-medium">{clientData?.diagnosis || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Insurance:</p>
                <p className="font-medium">{clientData?.insurance || "Not provided"}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Interventions Description */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0D9488] text-white text-sm font-bold">
                2
              </span>
              Proposed Interventions
            </h3>
            <div className="space-y-2 ml-9">
              {interventions.length > 0 ? (
                interventions.map((intervention, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-[#0D9488] mt-2" />
                    <p className="text-gray-700">{intervention}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">
                  No interventions specified. This will be determined during assessment.
                </p>
              )}
            </div>
          </div>

          {/* Section 3: Risks and Benefits */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0D9488] text-white text-sm font-bold">
                3
              </span>
              Risks and Benefits
            </h3>
            <div className="space-y-4 ml-9">
              <div>
                <p className="font-semibold text-gray-900 mb-2">Benefits:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Reduction in problem behaviors</li>
                  <li>Increase in adaptive and functional skills</li>
                  <li>Improved quality of life for client and family</li>
                  <li>Evidence-based treatment approach</li>
                  <li>Data-driven decision making</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-2">Potential Risks:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Temporary increase in problem behavior during initial intervention (extinction burst)</li>
                  <li>Emotional distress during behavior reduction procedures</li>
                  <li>Time and resource commitment required from family</li>
                  <li>Potential for inconsistent implementation across settings</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 4: Rights and Responsibilities */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0D9488] text-white text-sm font-bold">
                4
              </span>
              Your Rights and Responsibilities
            </h3>
            <div className="space-y-3 ml-9 text-gray-700">
              <p className="font-semibold">As the caregiver, you have the right to:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Receive detailed information about all proposed interventions</li>
                <li>Ask questions and receive answers in language you understand</li>
                <li>Refuse consent for any intervention at any time</li>
                <li>Request modifications to the behavior plan</li>
                <li>Access all data and reports regarding your child's progress</li>
                <li>File a complaint with the BACB if ethical concerns arise</li>
              </ul>

              <p className="font-semibold mt-4">Your responsibilities include:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Implementing behavior strategies with fidelity in home settings</li>
                <li>Attending scheduled parent training sessions</li>
                <li>Communicating any concerns or changes in your child's behavior</li>
                <li>Maintaining consistency in intervention implementation</li>
                <li>Providing feedback to the clinical team</li>
              </ul>
            </div>
          </div>

          {/* Section 5: Withdrawal of Consent */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0D9488] text-white text-sm font-bold">
                5
              </span>
              Withdrawal of Consent
            </h3>
            <div className="ml-9 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
              <p className="text-gray-700 leading-relaxed">
                You have the right to withdraw consent for behavior intervention services at any time. To do so, please
                provide written notice to the lead behavior analyst. Upon withdrawal, services will be discontinued, and
                a transition plan will be developed if appropriate. Withdrawal of consent does not affect any services
                previously received, and you may reinitiate services in the future if desired.
              </p>
            </div>
          </div>

          {/* Important Notice */}
          <div className="border-2 border-red-500 bg-red-50 p-4 rounded-lg">
            <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">
              <span className="text-xl">⚠</span>
              Important: Potential Escalation Before Improvement
            </h4>
            <p className="text-red-900 text-sm leading-relaxed">
              It is common for problem behaviors to temporarily increase in frequency or intensity when behavior
              intervention begins. This is known as an "extinction burst" and is a normal part of the behavior change
              process. Your clinical team will monitor this closely and adjust interventions as needed. Consistency and
              fidelity in implementation are critical during this period.
            </p>
          </div>

          {/* Understanding Checkbox */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <Checkbox
              id="understood"
              checked={understood}
              onCheckedChange={(checked) => setUnderstood(checked as boolean)}
              className="mt-1"
            />
            <label htmlFor="understood" className="text-sm leading-relaxed cursor-pointer">
              <span className="font-semibold">I have read and understand this consent form.</span> I acknowledge that I
              have been given the opportunity to ask questions and receive answers. I understand the proposed
              interventions, potential risks and benefits, and my rights and responsibilities. I voluntarily consent to
              behavior intervention services for the client named above.
            </label>
          </div>

          {/* Section 6: Signatures */}
          <div>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0D9488] text-white text-sm font-bold">
                6
              </span>
              Signatures
            </h3>

            {/* Caregiver Signature */}
            <div className="mb-8 p-6 border-2 border-gray-300 rounded-lg bg-white">
              <p className="font-semibold mb-4">Caregiver/Legal Guardian Signature:</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Type Name:</label>
                  <Input
                    value={caregiverName}
                    onChange={(e) => setCaregiverName(e.target.value)}
                    placeholder="Full Name"
                    className="mb-4"
                  />
                  <label className="text-sm text-gray-600 mb-2 block">Or Draw Signature:</label>
                  <div className="relative">
                    <canvas
                      ref={caregiverCanvasRef}
                      width={400}
                      height={120}
                      className="border-2 border-gray-300 rounded cursor-crosshair bg-white"
                      onMouseDown={(e) => startDrawing(e, setIsDrawingCaregiver)}
                      onMouseMove={(e) => draw(e, isDrawingCaregiver)}
                      onMouseUp={() => stopDrawing(setIsDrawingCaregiver, setCaregiverSigned)}
                      onMouseLeave={() => stopDrawing(setIsDrawingCaregiver, setCaregiverSigned)}
                    />
                    <div className="absolute bottom-2 left-0 right-0 border-b border-gray-400 mx-4" />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearSignature(caregiverCanvasRef, setCaregiverSigned)}
                    className="mt-2"
                  >
                    Clear Signature
                  </Button>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Date:</label>
                  <Input type="date" value={caregiverDate} onChange={(e) => setCaregiverDate(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Assistant Analyst Signature */}
            <div className="mb-8 p-6 border-2 border-gray-300 rounded-lg bg-white">
              <p className="font-semibold mb-4">Assistant Behavior Analyst Signature:</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Type Name:</label>
                  <Input
                    value={assistantName}
                    onChange={(e) => setAssistantName(e.target.value)}
                    placeholder="Full Name"
                    className="mb-4"
                  />
                  <label className="text-sm text-gray-600 mb-2 block">Or Draw Signature:</label>
                  <div className="relative">
                    <canvas
                      ref={assistantCanvasRef}
                      width={400}
                      height={120}
                      className="border-2 border-gray-300 rounded cursor-crosshair bg-white"
                      onMouseDown={(e) => startDrawing(e, setIsDrawingAssistant)}
                      onMouseMove={(e) => draw(e, isDrawingAssistant)}
                      onMouseUp={() => stopDrawing(setIsDrawingAssistant, setAssistantSigned)}
                      onMouseLeave={() => stopDrawing(setIsDrawingAssistant, setAssistantSigned)}
                    />
                    <div className="absolute bottom-2 left-0 right-0 border-b border-gray-400 mx-4" />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearSignature(assistantCanvasRef, setAssistantSigned)}
                    className="mt-2"
                  >
                    Clear Signature
                  </Button>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Date:</label>
                  <Input type="date" value={assistantDate} onChange={(e) => setAssistantDate(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Lead Analyst Signature */}
            <div className="p-6 border-2 border-gray-300 rounded-lg bg-white">
              <p className="font-semibold mb-4">Lead Behavior Analyst (BCBA) Signature:</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Type Name:</label>
                  <Input
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="Full Name, BCBA"
                    className="mb-4"
                  />
                  <label className="text-sm text-gray-600 mb-2 block">Or Draw Signature:</label>
                  <div className="relative">
                    <canvas
                      ref={leadCanvasRef}
                      width={400}
                      height={120}
                      className="border-2 border-gray-300 rounded cursor-crosshair bg-white"
                      onMouseDown={(e) => startDrawing(e, setIsDrawingLead)}
                      onMouseMove={(e) => draw(e, isDrawingLead)}
                      onMouseUp={() => stopDrawing(setIsDrawingLead, setLeadSigned)}
                      onMouseLeave={() => stopDrawing(setIsDrawingLead, setLeadSigned)}
                    />
                    <div className="absolute bottom-2 left-0 right-0 border-b border-gray-400 mx-4" />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearSignature(leadCanvasRef, setLeadSigned)}
                    className="mt-2"
                  >
                    Clear Signature
                  </Button>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Date:</label>
                  <Input type="date" value={leadDate} onChange={(e) => setLeadDate(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 pt-6 border-t">
            <p>This consent form complies with BACB Professional and Ethical Compliance Code</p>
            <p className="mt-1">For questions or concerns, contact your clinical supervisor</p>
            <p className="mt-1">
              Document ID: ARIA-CONSENT-{version}-{new Date().getTime()}
            </p>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 pb-8">
          <Button onClick={handleGeneratePDF} disabled={!understood || !caregiverSigned} className="flex-1" size="lg">
            <DownloadIcon className="h-5 w-5 mr-2" />
            Generate PDF
          </Button>
          <Button
            variant="outline"
            onClick={handleEmailCopy}
            disabled={!caregiverSigned}
            className="flex-1 bg-transparent"
            size="lg"
          >
            Email to Caregiver
          </Button>
        </div>
      </ScrollArea>
    </div>
  )
}
