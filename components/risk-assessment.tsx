"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AlertTriangleIcon, PhoneIcon, DownloadIcon, PrinterIcon, PlusIcon, XIcon } from "@/components/icons"
import { premiumToast } from "@/components/ui/premium-toast"

interface RiskFactor {
  id: string
  label: string
  checked: boolean
  severity: "high" | "medium" | "low"
}

interface CrisisContact {
  id: string
  name: string
  phone: string
  relationship: string
}

type RiskLevel = "low" | "medium" | "high"

export function RiskAssessment() {
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([
    { id: "self-injury", label: "Self-Injurious behavior", checked: false, severity: "high" },
    { id: "aggression", label: "Aggressive Behavior", checked: false, severity: "high" },
    { id: "impulsive", label: "Impulsive Behavior", checked: false, severity: "medium" },
    { id: "family-violence", label: "History of family violence", checked: false, severity: "high" },
    { id: "sexual-offense", label: "Sexually offending behavior", checked: false, severity: "high" },
    { id: "fire-setting", label: "Fire setting", checked: false, severity: "high" },
    { id: "elopement", label: "Elopement", checked: false, severity: "high" },
    { id: "substance-abuse", label: "Current substance abuse", checked: false, severity: "medium" },
    { id: "psychotic", label: "Psychotic symptoms", checked: false, severity: "high" },
    { id: "self-mutilation", label: "Self-mutilation/cutting", checked: false, severity: "high" },
    { id: "caregiver-stress", label: "Caring for ill family member", checked: false, severity: "medium" },
    { id: "loss", label: "Coping with significant loss", checked: false, severity: "medium" },
    { id: "psych-admission", label: "Prior psychiatric inpatient admission", checked: false, severity: "medium" },
  ])

  const [otherRisk, setOtherRisk] = useState("")
  const [emergencyProcedures, setEmergencyProcedures] = useState("")
  const [lastAssessmentDate, setLastAssessmentDate] = useState("")
  const [nextReviewDate, setNextReviewDate] = useState("")
  const [crisisContacts, setCrisisContacts] = useState<CrisisContact[]>([
    { id: "1", name: "", phone: "", relationship: "" },
  ])
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("low")

  // Calculate risk level based on checked items
  useEffect(() => {
    const checkedFactors = riskFactors.filter((f) => f.checked)
    const highRiskCount = checkedFactors.filter((f) => f.severity === "high").length

    if (highRiskCount >= 3 || checkedFactors.length >= 6) {
      setRiskLevel("high")
    } else if (highRiskCount >= 1 || checkedFactors.length >= 3) {
      setRiskLevel("medium")
    } else {
      setRiskLevel("low")
    }
  }, [riskFactors])

  const handleToggleRisk = (id: string) => {
    setRiskFactors(riskFactors.map((factor) => (factor.id === id ? { ...factor, checked: !factor.checked } : factor)))
  }

  const addCrisisContact = () => {
    setCrisisContacts([...crisisContacts, { id: Date.now().toString(), name: "", phone: "", relationship: "" }])
  }

  const removeCrisisContact = (id: string) => {
    if (crisisContacts.length > 1) {
      setCrisisContacts(crisisContacts.filter((c) => c.id !== id))
    }
  }

  const updateCrisisContact = (id: string, field: keyof CrisisContact, value: string) => {
    setCrisisContacts(crisisContacts.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  const exportToPDF = () => {
    premiumToast.success("Crisis plan exported to PDF")
  }

  const printCrisisPlan = () => {
    window.print()
    premiumToast.success("Crisis plan sent to printer")
  }

  const getRiskLevelColor = (level: RiskLevel) => {
    switch (level) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-amber-500"
      case "low":
        return "bg-green-500"
    }
  }

  const getRiskLevelText = (level: RiskLevel) => {
    return level.charAt(0).toUpperCase() + level.slice(1)
  }

  const checkedCount = riskFactors.filter((f) => f.checked).length
  const totalCount = riskFactors.length

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <AlertTriangleIcon className="h-8 w-8 text-red-500" />
            Risk Assessment & Crisis Plan
          </h1>
          <p className="text-muted-foreground">Comprehensive safety evaluation and emergency planning</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={printCrisisPlan}>
            <PrinterIcon className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={exportToPDF}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Risk Level Indicator */}
      <Card className="p-6 border-2 border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">Overall Risk Level</h2>
            <p className="text-sm text-muted-foreground">
              Based on {checkedCount} of {totalCount} risk factors identified
            </p>
          </div>
          <Badge
            className={`${getRiskLevelColor(riskLevel)} text-white text-lg px-6 py-2 hover:${getRiskLevelColor(riskLevel)}`}
          >
            {getRiskLevelText(riskLevel)} Risk
          </Badge>
        </div>

        {/* Risk Meter */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
          <div className="w-full h-4 bg-gradient-to-r from-green-500 via-amber-500 to-red-500 rounded-full relative">
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-800 rounded-full shadow-lg transition-all duration-500"
              style={{
                left: riskLevel === "low" ? "16.67%" : riskLevel === "medium" ? "50%" : "83.33%",
              }}
            />
          </div>
        </div>
      </Card>

      {/* Risk Factors Checklist */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Risk Factors Assessment</h2>
        <div className="space-y-3">
          {riskFactors.map((factor) => (
            <label
              key={factor.id}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-300 cursor-pointer hover:bg-gray-50 ${
                factor.checked
                  ? factor.severity === "high"
                    ? "border-red-300 bg-red-50"
                    : "border-amber-300 bg-amber-50"
                  : "border-gray-200"
              }`}
            >
              <input
                type="checkbox"
                checked={factor.checked}
                onChange={() => handleToggleRisk(factor.id)}
                className="h-5 w-5 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
              />
              <span className={`flex-1 ${factor.checked ? "font-medium" : ""}`}>{factor.label}</span>
              {factor.severity === "high" && factor.checked && <AlertTriangleIcon className="h-5 w-5 text-red-500" />}
            </label>
          ))}

          {/* Other Risk Factor */}
          <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200">
            <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]" />
            <Input
              placeholder="Other risk factor (specify)..."
              value={otherRisk}
              onChange={(e) => setOtherRisk(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
      </Card>

      {/* Crisis Contacts */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Crisis Contacts</h2>
          <Button onClick={addCrisisContact} size="sm" variant="outline">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
        <div className="space-y-4">
          {crisisContacts.map((contact, index) => (
            <Card key={contact.id} className="p-4 bg-teal-50 border-teal-200">
              <div className="flex items-start gap-4">
                <PhoneIcon className="h-5 w-5 text-[#0D9488] mt-2" />
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor={`name-${contact.id}`} className="text-sm font-medium mb-1">
                        Name
                      </Label>
                      <Input
                        id={`name-${contact.id}`}
                        placeholder="Contact name"
                        value={contact.name}
                        onChange={(e) => updateCrisisContact(contact.id, "name", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`phone-${contact.id}`} className="text-sm font-medium mb-1">
                        Phone
                      </Label>
                      <Input
                        id={`phone-${contact.id}`}
                        type="tel"
                        placeholder="(000) 000-0000"
                        value={contact.phone}
                        onChange={(e) => updateCrisisContact(contact.id, "phone", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`relationship-${contact.id}`} className="text-sm font-medium mb-1">
                        Relationship
                      </Label>
                      <Input
                        id={`relationship-${contact.id}`}
                        placeholder="Parent, Guardian, etc."
                        value={contact.relationship}
                        onChange={(e) => updateCrisisContact(contact.id, "relationship", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                {crisisContacts.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCrisisContact(contact.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Emergency Procedures */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Emergency Procedures</h2>
        <Textarea
          placeholder="Describe step-by-step emergency procedures, de-escalation strategies, when to call 911, safe places, etc."
          value={emergencyProcedures}
          onChange={(e) => setEmergencyProcedures(e.target.value)}
          rows={8}
          className="resize-none"
        />
      </Card>

      {/* Assessment Dates */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Assessment Timeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="last-assessment" className="text-sm font-medium mb-2 block">
              Last Assessment Date
            </Label>
            <Input
              id="last-assessment"
              type="date"
              value={lastAssessmentDate}
              onChange={(e) => setLastAssessmentDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="next-review" className="text-sm font-medium mb-2 block">
              Next Review Date
            </Label>
            <Input
              id="next-review"
              type="date"
              value={nextReviewDate}
              onChange={(e) => setNextReviewDate(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Important Notice */}
      {riskLevel === "high" && (
        <Card className="p-6 bg-red-50 border-2 border-red-300">
          <div className="flex gap-4">
            <AlertTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">High Risk Alert</h3>
              <p className="text-red-800 mb-3">
                This client has been identified as high risk. Immediate safety planning and coordination with the
                treatment team is recommended.
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                <li>Review crisis plan with all caregivers and team members</li>
                <li>Ensure 24/7 supervision protocols are in place</li>
                <li>Schedule immediate case review with clinical supervisor</li>
                <li>Coordinate with crisis intervention services as needed</li>
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
