"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { EditableAIField } from "@/components/editable-ai-field"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangleIcon,
  PhoneIcon,
  DownloadIcon,
  PrinterIcon,
  PlusIcon,
  XIcon,
  Sparkles,
  Loader2,
  Shield,
  Eye,
  ArrowDownCircle,
  AlertCircle,
  ClipboardCheck,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ChevronRightIcon,
} from "@/components/icons"
import { useToast } from "@/hooks/use-toast"

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

interface ClientData {
  name: string
  age: number
  gender: string
}

interface RiskAssessmentProps {
  clientData: ClientData
  onSave: (plan: any) => void
}

type RiskLevel = "low" | "medium" | "high"

function RiskAssessment({ clientData, onSave }: RiskAssessmentProps) {
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
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [isGeneratingEmergency, setIsGeneratingEmergency] = useState(false)
  const [crisisPlan, setCrisisPlan] = useState<any>(null)
  const { toast } = useToast()

  const safeClientData = {
    name: clientData?.name || "Unnamed Client",
    age: clientData?.age || 0,
    gender: clientData?.gender || "Unknown",
  }

  useEffect(() => {
    console.log("[ARIA] Loading Risk Assessment data from localStorage")
    try {
      const stored = localStorage.getItem("aria-risk-assessment")
      if (stored) {
        const parsed = JSON.parse(stored)
        console.log("[ARIA] Loaded Risk Assessment data:", parsed)
        if (parsed.riskFactors) setRiskFactors(parsed.riskFactors)
        if (parsed.otherRisk) setOtherRisk(parsed.otherRisk)
        if (parsed.emergencyProcedures) setEmergencyProcedures(parsed.emergencyProcedures)
        if (parsed.lastAssessmentDate) setLastAssessmentDate(parsed.lastAssessmentDate)
        if (parsed.nextReviewDate) setNextReviewDate(parsed.nextReviewDate)
        if (parsed.crisisContacts) setCrisisContacts(parsed.crisisContacts)
        if (parsed.crisisPlan) setCrisisPlan(parsed.crisisPlan)
      }
    } catch (e) {
      console.error("[ARIA] Error loading risk assessment data:", e)
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log("[ARIA] Auto-saving Risk Assessment data")
      const dataToSave = {
        riskFactors,
        otherRisk,
        emergencyProcedures,
        lastAssessmentDate,
        nextReviewDate,
        crisisContacts,
        riskLevel,
        crisisPlan,
      }
      localStorage.setItem("aria-risk-assessment", JSON.stringify(dataToSave))
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [
    riskFactors,
    otherRisk,
    emergencyProcedures,
    lastAssessmentDate,
    nextReviewDate,
    crisisContacts,
    riskLevel,
    crisisPlan,
  ])

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

  const exportCrisisPlan = () => {
    toast({
      title: "Success",
      description: "Crisis plan exported to PDF",
    })
  }

  const printCrisisPlan = () => {
    window.print()
    toast({
      title: "Success",
      description: "Crisis plan sent to printer",
    })
  }

  const handleGenerateCrisisPlan = async () => {
    const selectedRiskFactors = riskFactors.filter((f) => f.checked).map((f) => f.label)

    if (selectedRiskFactors.length === 0) {
      toast({
        title: "No risk factors selected",
        description: "Please select at least one risk factor",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingPlan(true)

    try {
      const response = await fetch("/api/generate-crisis-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          riskFactors: selectedRiskFactors,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Generation failed")
      }

      setCrisisPlan(data)

      const aiRiskLevel = data.riskProfile.level.toLowerCase()
      if (aiRiskLevel === "critical" || aiRiskLevel === "high") {
        setRiskLevel("high")
      } else if (aiRiskLevel === "medium") {
        setRiskLevel("medium")
      } else {
        setRiskLevel("low")
      }

      const emergencyProceduresText = `
RISK LEVEL: ${data.riskProfile.level}

WARNING SIGNS:
${data.warningSignsEscalation.map((s: string) => `• ${s}`).join("\n")}

DE-ESCALATION STEPS:
${data.deEscalationStrategies.map((s: any) => `${s.step}. ${s.action}: ${s.details}`).join("\n")}

IMMEDIATE ACTIONS:
${data.emergencyProcedures.immediateActions.map((a: string) => `• ${a}`).join("\n")}

SAFETY MEASURES:
${data.emergencyProcedures.safetyMeasures.map((m: string) => `• ${m}`).join("\n")}

${data.emergencyProcedures.restrictedItems?.length > 0 ? `ITEMS TO SECURE:\n${data.emergencyProcedures.restrictedItems.map((i: string) => `• ${i}`).join("\n")}\n\n` : ""}WHEN TO CALL 911:
${data.when911.criteria.map((c: string) => `• ${c}`).join("\n")}

911 SCRIPT: "${data.when911.whatToSay}"

POST-CRISIS PROTOCOL:
${data.postCrisisProtocol.map((s: string, i: number) => `${i + 1}. ${s}`).join("\n")}

PREVENTION STRATEGIES:
${data.preventionStrategies.map((s: string) => `• ${s}`).join("\n")}
`.trim()

      setEmergencyProcedures(emergencyProceduresText)

      const today = new Date()
      let reviewDays = 90 // default for Low risk

      if (data.riskProfile.level === "Critical") {
        reviewDays = 14 // 2 weeks for critical
      } else if (data.riskProfile.level === "High") {
        reviewDays = 30 // 1 month for high
      } else if (data.riskProfile.level === "Medium") {
        reviewDays = 60 // 2 months for medium
      }

      const nextReviewDate = new Date(today)
      nextReviewDate.setDate(nextReviewDate.getDate() + reviewDays)

      // Format as YYYY-MM-DD for date input
      const formattedNextReviewDate = nextReviewDate.toISOString().split("T")[0]
      setNextReviewDate(formattedNextReviewDate)

      // Also set last assessment date to today
      setLastAssessmentDate(today.toISOString().split("T")[0])

      toast({
        title: "✓ Crisis Plan Generated",
        description: `Risk Level: ${data.riskProfile.level}. Emergency procedures populated. Next review: ${reviewDays} days.`,
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Could not generate crisis plan",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPlan(false)
    }
  }

  const handleGenerateEmergencyProcedures = async () => {
    setIsGeneratingEmergency(true)

    try {
      const response = await fetch("/api/generate-emergency-procedures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: safeClientData.name,
          age: safeClientData.age,
          diagnosis: "ASD", // Default diagnosis
          selectedRiskFactors: riskFactors.filter((r) => r.checked).map((r) => r.label),
          otherRisk: otherRisk,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate")

      const data = await response.json()
      setEmergencyProcedures(data.procedures)
      toast({
        title: "Generated Successfully",
        description: "Emergency procedures have been created based on risk factors",
      })
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Unable to generate emergency procedures. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingEmergency(false)
    }
  }

  const copyFullPlan = (plan: any) => {
    const text = `
CRISIS PLAN

RISK LEVEL: ${plan.riskProfile.level}
${plan.riskProfile.summary}

WARNING SIGNS OF ESCALATION:
${plan.warningSignsEscalation.map((s: string) => `• ${s}`).join("\n")}

DE-ESCALATION STRATEGIES:
${plan.deEscalationStrategies.map((s: any) => `${s.step}. ${s.action}: ${s.details}`).join("\n")}

EMERGENCY PROCEDURES:
Immediate Actions:
${plan.emergencyProcedures.immediateActions.map((a: string) => `• ${a}`).join("\n")}

Safety Measures:
${plan.emergencyProcedures.safetyMeasures.map((m: string) => `• ${m}`).join("\n")}

WHEN TO CALL 911:
${plan.when911.criteria.map((c: string) => `• ${c}`).join("\n")}

What to tell dispatcher: "${plan.when911.whatToSay}"

POST-CRISIS PROTOCOL:
${plan.postCrisisProtocol.map((s: string, i: number) => `${i + 1}. ${s}`).join("\n")}

PREVENTION STRATEGIES:
${plan.preventionStrategies.map((s: string) => `• ${s}`).join("\n")}
  `.trim()

    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Full crisis plan copied to clipboard",
    })
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
    <div className="space-y-8 max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <AlertTriangleIcon className="h-8 w-8 text-red-500" />
            Risk Assessment & Crisis Plan for {safeClientData.name}
          </h1>
          <p className="text-muted-foreground">Comprehensive safety evaluation and emergency planning</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={printCrisisPlan}>
            <PrinterIcon className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={exportCrisisPlan}>
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
              <Checkbox
                checked={factor.checked}
                onCheckedChange={() => handleToggleRisk(factor.id)}
                className="h-5 w-5 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
              />
              <span className={`flex-1 ${factor.checked ? "font-medium" : ""}`}>{factor.label}</span>
              {factor.severity === "high" && factor.checked && <AlertTriangleIcon className="h-5 w-5 text-red-500" />}
            </label>
          ))}

          {/* Other Risk Factor */}
          <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200">
            <Checkbox className="h-5 w-5 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]" />
            <Input
              placeholder="Other risk factor (specify)..."
              value={otherRisk}
              onChange={(e) => setOtherRisk(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        {/* AI Generate Crisis Plan button */}
        <div className="flex flex-col items-end mt-6 gap-2">
          <Button
            onClick={handleGenerateCrisisPlan}
            disabled={isGeneratingPlan || checkedCount === 0}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white gap-2"
          >
            {isGeneratingPlan ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Crisis Plan...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                AI Generate Crisis Plan
              </>
            )}
          </Button>
          {checkedCount === 0 && (
            <p className="text-sm text-muted-foreground">Select at least one risk factor to generate a crisis plan</p>
          )}
        </div>
      </Card>

      {crisisPlan && (
        <div className="space-y-6">
          {/* Risk Profile Summary */}
          <div
            className={`p-4 rounded-xl border-2 ${
              crisisPlan.riskProfile.level === "Critical"
                ? "bg-red-50 border-red-500"
                : crisisPlan.riskProfile.level === "High"
                  ? "bg-orange-50 border-orange-500"
                  : crisisPlan.riskProfile.level === "Medium"
                    ? "bg-amber-50 border-amber-500"
                    : "bg-green-50 border-green-500"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Risk Profile Analysis
              </h4>
              <span
                className={`px-3 py-1 rounded-full text-sm font-bold ${
                  crisisPlan.riskProfile.level === "Critical"
                    ? "bg-red-500 text-white"
                    : crisisPlan.riskProfile.level === "High"
                      ? "bg-orange-500 text-white"
                      : crisisPlan.riskProfile.level === "Medium"
                        ? "bg-amber-500 text-white"
                        : "bg-green-500 text-white"
                }`}
              >
                {crisisPlan.riskProfile.level} Risk
              </span>
            </div>
            <p className="text-gray-700">{crisisPlan.riskProfile.summary}</p>
          </div>

          {/* Warning Signs */}
          <Card className="bg-amber-50 border border-amber-200 p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-amber-800">
              <AlertTriangleIcon className="h-5 w-5" />
              Warning Signs of Escalation
            </h4>
            <ul className="space-y-2">
              {crisisPlan.warningSignsEscalation.map((sign: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-amber-900">
                  <Eye className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{sign}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* De-escalation Steps */}
          <Card className="bg-blue-50 border border-blue-200 p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-800">
              <ArrowDownCircle className="h-5 w-5" />
              De-escalation Strategies
            </h4>
            <div className="space-y-3">
              {crisisPlan.deEscalationStrategies.map((strategy: any) => (
                <div key={strategy.step} className="flex gap-3 bg-white p-3 rounded-lg border border-blue-100">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                    {strategy.step}
                  </div>
                  <div>
                    <div className="font-medium text-blue-900">{strategy.action}</div>
                    <div className="text-sm text-blue-700">{strategy.details}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Emergency Procedures */}
          <Card className="bg-red-50 border border-red-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Emergency Procedures</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateEmergencyProcedures}
                disabled={isGeneratingEmergency}
                className="text-purple-600 border-purple-200 hover:bg-purple-50 bg-transparent"
              >
                {isGeneratingEmergency ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Generate
                  </>
                )}
              </Button>
            </div>
            <EditableAIField
              value={emergencyProcedures}
              onChange={(value) => setEmergencyProcedures(value)}
              onGenerate={handleGenerateEmergencyProcedures}
              isGenerating={isGeneratingEmergency}
              label="Emergency Procedures"
              placeholder="Describe step-by-step emergency procedures, de-escalation strategies, when to call 911, safe places, etc."
              minHeight="200px"
            />
          </Card>

          {/* When to Call 911 */}
          <Card className="bg-red-600 text-white p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <PhoneIcon className="h-5 w-5" />
              When to Call 911
            </h4>
            <ul className="space-y-2 mb-4">
              {crisisPlan.when911.criteria.map((criterion: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{criterion}</span>
                </li>
              ))}
            </ul>
            <div className="bg-red-700 p-3 rounded-lg">
              <div className="text-sm font-medium mb-1">📞 What to Tell Dispatcher:</div>
              <p className="text-red-100 text-sm italic">&quot;{crisisPlan.when911.whatToSay}&quot;</p>
            </div>
          </Card>

          {/* Post-Crisis Protocol */}
          <Card className="bg-purple-50 border border-purple-200 p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-purple-800">
              <ClipboardCheck className="h-5 w-5" />
              Post-Crisis Protocol
            </h4>
            <ol className="space-y-2">
              {crisisPlan.postCrisisProtocol.map((step: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <span className="text-purple-900">{step}</span>
                </li>
              ))}
            </ol>
          </Card>

          {/* Prevention Strategies */}
          <Card className="bg-green-50 border border-green-200 p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-800">
              <ShieldCheck className="h-5 w-5" />
              Prevention Strategies
            </h4>
            <ul className="space-y-2">
              {crisisPlan.preventionStrategies.map((strategy: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-green-900">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
                  <span>{strategy}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Copy Button */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => copyFullPlan(crisisPlan)} className="gap-2">
              <Copy className="h-4 w-4" />
              Copy Full Plan
            </Button>
          </div>
        </div>
      )}

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
            {nextReviewDate && crisisPlan && (
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    crisisPlan.riskProfile.level === "Critical"
                      ? "bg-red-100 text-red-700"
                      : crisisPlan.riskProfile.level === "High"
                        ? "bg-orange-100 text-orange-700"
                        : crisisPlan.riskProfile.level === "Medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700"
                  }`}
                >
                  {crisisPlan.riskProfile.level === "Critical"
                    ? "14-day review (Critical)"
                    : crisisPlan.riskProfile.level === "High"
                      ? "30-day review (High Risk)"
                      : crisisPlan.riskProfile.level === "Medium"
                        ? "60-day review (Medium Risk)"
                        : "90-day review (Low Risk)"}
                </span>
              </div>
            )}
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

      <div className="flex justify-end gap-3 mt-6">
        <Button onClick={() => onSave({})} className="gap-2 bg-[#0D9488] hover:bg-[#0F766E]">
          Save & Continue
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export { RiskAssessment }
