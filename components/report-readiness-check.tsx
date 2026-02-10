"use client"

import { useState } from "react"
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Shield,
  FileText,
} from "lucide-react"

interface ReadinessItem {
  id: string
  label: string
  description: string
  status: "ready" | "warning" | "missing"
  detail?: string
}

interface ReportReadinessCheckProps {
  assessmentData: any
  onGenerate: () => void
  isGenerating: boolean
}

function checkReadiness(data: any): ReadinessItem[] {
  const items: ReadinessItem[] = []
  const ci = data?.clientInfo || {}

  // Client Name
  const hasName = ci.firstName && ci.firstName !== "[First Name]"
  items.push({
    id: "name",
    label: "Client Name",
    description: "First and last name required for all sections",
    status: hasName ? "ready" : "missing",
    detail: hasName ? `${ci.firstName} ${ci.lastName || ""}`.trim() : "Not provided — enter in Client Info",
  })

  // Diagnosis / ICD-10
  const hasDiagnosis = ci.diagnosis && ci.diagnosis !== ""
  const hasICD10 = ci.icd10Code && ci.icd10Code !== ""
  items.push({
    id: "diagnosis",
    label: "Diagnosis & ICD-10",
    description: "Primary diagnosis and ICD-10 code",
    status: hasDiagnosis && hasICD10 ? "ready" : hasDiagnosis || hasICD10 ? "warning" : "missing",
    detail:
      hasDiagnosis && hasICD10
        ? `${ci.diagnosis} (${ci.icd10Code})`
        : hasDiagnosis
          ? `Diagnosis set, ICD-10 code missing`
          : "Not provided — enter in Client Info",
  })

  // Date of Birth / Age
  const hasDOB = ci.dob || ci.dateOfBirth
  items.push({
    id: "dob",
    label: "Date of Birth",
    description: "Needed for age-based service recommendations",
    status: hasDOB ? "ready" : "warning",
    detail: hasDOB ? `DOB: ${ci.dob || ci.dateOfBirth}` : "Missing — service hours will use defaults",
  })

  // Background History
  const bg = data?.background || {}
  const bgFieldCount = Object.values(bg).filter((v) => v && v !== "").length
  items.push({
    id: "background",
    label: "Background History",
    description: "Developmental, medical, and educational history",
    status: bgFieldCount >= 3 ? "ready" : bgFieldCount > 0 ? "warning" : "missing",
    detail:
      bgFieldCount >= 3
        ? `${bgFieldCount} fields completed`
        : bgFieldCount > 0
          ? `Only ${bgFieldCount} field(s) — more data improves report quality`
          : "No background data — section will use minimal content",
  })

  // ABC Observations
  const abc = data?.abcObservations || []
  items.push({
    id: "abc",
    label: "ABC Observations",
    description: "Behavioral observations with antecedents and consequences",
    status: abc.length >= 3 ? "ready" : abc.length > 0 ? "warning" : "missing",
    detail:
      abc.length >= 3
        ? `${abc.length} observations recorded`
        : abc.length > 0
          ? `Only ${abc.length} observation(s) — 3+ recommended`
          : "None recorded — behavior sections will be limited",
  })

  // Goals
  const goals = data?.goals || []
  const behaviorGoals = data?.behaviorGoals || []
  const totalGoals = goals.length + behaviorGoals.length
  items.push({
    id: "goals",
    label: "Treatment Goals",
    description: "Skill acquisition and behavior reduction goals",
    status: totalGoals >= 2 ? "ready" : totalGoals > 0 ? "warning" : "missing",
    detail:
      totalGoals >= 2
        ? `${totalGoals} goals defined`
        : totalGoals > 0
          ? `Only ${totalGoals} goal(s) — more recommended for comprehensive report`
          : "No goals defined — goal sections will be minimal",
  })

  // BCBA Credentials (required for insurance authorization)
  const provider = data?.providerInfo || {}
  const bcbaName = (provider.bcbaName || "").trim()
  const npi = (provider.npi || "").trim()
  const bcbaLicense = (provider.bcbaLicense || "").trim()
  const bcbaEmail = (provider.bcbaEmail || "").trim()

  // BCBA Name — required (missing = red)
  items.push({
    id: "bcba_name",
    label: "BCBA Name",
    description: "Supervising analyst name required on all reports",
    status: bcbaName && bcbaName !== provider.name ? "ready" : bcbaName ? "warning" : "missing",
    detail: bcbaName && bcbaName !== provider.name
      ? bcbaName
      : bcbaName
        ? "BCBA name matches agency name — confirm this is correct"
        : "Not provided — required for insurance authorization",
  })

  // NPI Number — required (missing = red)
  items.push({
    id: "npi",
    label: "NPI Number",
    description: "National Provider Identifier required by all payers",
    status: npi ? "ready" : "missing",
    detail: npi ? `NPI: ${npi}` : "Not provided — required for insurance authorization",
  })

  // BCBA License — recommended (missing = yellow)
  items.push({
    id: "bcba_license",
    label: "BCBA License",
    description: "Certification number for supervising analyst",
    status: bcbaLicense ? "ready" : "warning",
    detail: bcbaLicense ? `License: ${bcbaLicense}` : "Optional — but recommended for payer compliance",
  })

  // BCBA Email — recommended (missing = yellow)
  items.push({
    id: "bcba_email",
    label: "BCBA Email",
    description: "Contact email for the supervising analyst",
    status: bcbaEmail ? "ready" : "warning",
    detail: bcbaEmail ? bcbaEmail : "Optional — helpful for payer follow-up",
  })

  // Risk Assessment
  const risk = data?.riskAssessment || {}
  const hasRisk = risk.extinctionBurst || risk.safetyProtocols
  items.push({
    id: "risk",
    label: "Risk Assessment",
    description: "Safety protocols and crisis planning",
    status: hasRisk ? "ready" : "warning",
    detail: hasRisk ? "Risk assessment completed" : "Optional — but recommended for comprehensive reports",
  })

  return items
}

export function ReportReadinessCheck({ assessmentData, onGenerate, isGenerating }: ReportReadinessCheckProps) {
  const [expanded, setExpanded] = useState(true)
  const items = checkReadiness(assessmentData)

  const readyCount = items.filter((i) => i.status === "ready").length
  const warningCount = items.filter((i) => i.status === "warning").length
  const missingCount = items.filter((i) => i.status === "missing").length
  const percentage = Math.round((readyCount / items.length) * 100)

  const overallStatus =
    missingCount === 0 && warningCount === 0
      ? "excellent"
      : missingCount === 0
        ? "good"
        : missingCount <= 2
          ? "fair"
          : "incomplete"

  const statusConfig = {
    excellent: {
      label: "Excellent — all data ready",
      color: "from-green-500 to-emerald-500",
      bg: "from-green-50 to-emerald-50",
      border: "border-green-200",
      text: "text-green-700",
    },
    good: {
      label: "Good — some optional fields missing",
      color: "from-teal-500 to-cyan-500",
      bg: "from-teal-50 to-cyan-50",
      border: "border-teal-200",
      text: "text-teal-700",
    },
    fair: {
      label: "Fair — missing recommended data",
      color: "from-amber-500 to-orange-500",
      bg: "from-amber-50 to-orange-50",
      border: "border-amber-200",
      text: "text-amber-700",
    },
    incomplete: {
      label: "Incomplete — critical fields missing",
      color: "from-red-500 to-rose-500",
      bg: "from-red-50 to-rose-50",
      border: "border-red-200",
      text: "text-red-700",
    },
  }

  const config = statusConfig[overallStatus]

  return (
    <div className={`bg-gradient-to-br ${config.bg} rounded-2xl border ${config.border} overflow-hidden mb-6`}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 bg-gradient-to-br ${config.color} rounded-xl flex items-center justify-center shadow-md`}>
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Report Readiness Check</h3>
            <p className={`text-sm ${config.text} font-medium`}>{config.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Mini progress ring */}
          <div className="relative h-10 w-10">
            <svg className="h-10 w-10 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(0,0,0,0.1)"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${percentage}, 100`}
                strokeLinecap="round"
                className={config.text}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
              {readyCount}/{items.length}
            </span>
          </div>
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expandable checklist */}
      {expanded && (
        <div className="px-5 pb-5">
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-3 p-3 rounded-xl ${
                  item.status === "ready"
                    ? "bg-white/60"
                    : item.status === "warning"
                      ? "bg-amber-50/80 border border-amber-100"
                      : "bg-red-50/80 border border-red-100"
                }`}
              >
                <div className="mt-0.5">
                  {item.status === "ready" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : item.status === "warning" ? (
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Action */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {missingCount > 0
                ? `${missingCount} critical field(s) missing — report will use placeholders`
                : warningCount > 0
                  ? `${warningCount} optional field(s) missing — report quality may be reduced`
                  : "All data ready — your report will be comprehensive"}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onGenerate()
              }}
              disabled={isGenerating}
              className="px-5 py-2.5 bg-gradient-to-r from-[#0D9488] to-cyan-600 text-white rounded-xl font-semibold hover:from-[#0B7C7C] hover:to-cyan-700 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 text-sm"
            >
              <Sparkles className="h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate Report"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
