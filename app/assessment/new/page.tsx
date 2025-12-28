"use client"

import { useState } from "react"
import { safeGetJSON } from "@/lib/safe-storage"
import type React from "react"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Home,
  User,
  FileText,
  ClipboardList,
  Activity,
  AlertTriangle,
  Target,
  Calendar,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Save,
  Plus,
  X,
  Building,
  Shield,
  Users,
} from "lucide-react"
import { EVALUATION_TYPES, type EvaluationType } from "@/lib/evaluation-type"

const STEPS = [
  {
    section: "Client Information",
    sectionNumber: 1,
    items: [
      { id: 1, name: "Client Info", description: "Demographics & insurance", icon: User },
      { id: 2, name: "Background & History", description: "Developmental & clinical history", icon: FileText },
    ],
  },
  {
    section: "Assessment",
    sectionNumber: 2,
    items: [
      { id: 3, name: "Context & Tools", description: "Settings, dates, instruments", icon: ClipboardList },
      {
        id: 4,
        name: "Domains & Functional Impact",
        description: "Communication, social, adaptive, behavior",
        icon: Activity,
      },
      { id: 5, name: "ABC Observation", description: "Key behavioral episodes", icon: FileCheck },
      { id: 6, name: "Risk Assessment", description: "Safety & supervision needs", icon: AlertTriangle },
    ],
  },
  {
    section: "Goals & Plan",
    sectionNumber: 3,
    items: [
      { id: 7, name: "Initial Goals", description: "High-level treatment targets", icon: Target },
      { id: 8, name: "Service Plan & Weekly Schedule", description: "Recommended CPT hours/week", icon: Calendar },
    ],
  },
  {
    section: "Authorization & Report",
    sectionNumber: 4,
    items: [
      { id: 9, name: "CPT Auth Request", description: "Insurance-facing summary", icon: FileText },
      { id: 10, name: "Medical Necessity", description: "Clinical justification writer", icon: FileText },
      { id: 11, name: "Generate Report", description: "Preview & export", icon: FileText },
    ],
  },
] as const

interface SidebarProps {
  currentStep: number
  onStepClick?: (step: number) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

function Sidebar({ currentStep = 1, onStepClick, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const totalSteps = 18
  const safeCurrentStep = Math.max(1, Math.min(currentStep, totalSteps))
  const progress = Math.round((safeCurrentStep / totalSteps) * 100)

  const canAccessStep = (stepId: number) => stepId <= safeCurrentStep

  return (
    <div
      className={`flex flex-col h-screen border-r border-slate-200 bg-white transition-all duration-300 overflow-hidden ${isCollapsed ? "w-16" : "w-72"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0D9488] text-white font-bold text-sm">
              A
            </div>
            <div>
              <h1 className="font-semibold text-slate-800">ARIA</h1>
              <p className="text-xs text-slate-500">Assessment Wizard</p>
            </div>
          </Link>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-700"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Progress */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Progress</span>
            <span className="text-xs font-bold text-[#0D9488]">{progress}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0D9488] to-cyan-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2">
        {!isCollapsed && (
          <>
            <div className="px-2 mb-2">
              <Link href="/dashboard">
                <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
                  <Home className="h-4 w-4" />
                  <span className="text-sm">Back to Dashboard</span>
                </button>
              </Link>
            </div>

            {STEPS.map((section) => (
              <div key={section.section} className="mb-1">
                <div className="flex items-center gap-2 px-4 py-2 mt-2">
                  <div
                    className={`flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold ${
                      safeCurrentStep >= (section.items[0]?.id ?? 1)
                        ? "bg-[#0D9488]/20 text-[#0D9488]"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {section.sectionNumber}
                  </div>
                  <span
                    className={`text-xs font-semibold uppercase tracking-wide ${
                      safeCurrentStep >= (section.items[0]?.id ?? 1) ? "text-[#0D9488]" : "text-slate-500"
                    }`}
                  >
                    {section.section}
                  </span>
                </div>

                <div className="px-2 space-y-0.5">
                  {(section.items ?? []).map((item) => {
                    const Icon = item.icon
                    const isActive = item.id === safeCurrentStep
                    const isCompleted = item.id < safeCurrentStep
                    const isLocked = !canAccessStep(item.id)

                    return (
                      <button
                        key={item.id}
                        onClick={() => !isLocked && onStepClick?.(item.id)}
                        disabled={isLocked}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-300 ${
                          isActive
                            ? "bg-[#0D9488]/10 border-l-2 border-[#0D9488]"
                            : isLocked
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-slate-100"
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-medium ${
                            isActive
                              ? "bg-white border-2 border-[#0D9488] text-[#0D9488]"
                              : isCompleted
                                ? "bg-[#0D9488] text-white"
                                : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div
                            className={`text-sm font-medium truncate ${isActive ? "text-[#0D9488]" : "text-slate-700"}`}
                          >
                            {item.name}
                          </div>
                          <div className="text-xs text-slate-500 truncate">{item.description}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Step</span>
            <span className="font-bold text-[#0D9488]">
              {safeCurrentStep} / {totalSteps}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

interface ScheduleRow {
  id: string
  activity: string
  startTime: string
  description: string
}

interface DocumentsReviewed {
  mdReferral: boolean
  diagnosticEval: boolean
  iepReports: boolean
  previousABA: boolean
  otherAssessments: boolean
  other: boolean
  otherText: string
}

interface FormData {
  assessmentType: EvaluationType
  providerName: string
  providerPhone: string
  providerFax: string
  providerAddress: string
  providerSuite: string
  firstName: string
  lastName: string
  dob: string
  primaryDiagnosis: string
  icd10Code: string
  diagnosisDate: string
  secondaryDiagnoses: string[]
  newSecondaryDiagnosis: string
  documentsReviewed: DocumentsReviewed
  insuranceProvider: string
  insuranceId: string
  guardianName: string
  guardianPhone: string
  guardianEmail: string
  evaluationStartDate: string
  evaluationEndDate: string
  bcbaName: string
  bcbaLicense: string
  bcabaName: string
  referralDate: string
  referralSource: string
  dailySchedule: ScheduleRow[]
}

const DIAGNOSIS_OPTIONS = [
  { value: "", label: "Select primary diagnosis" },
  { value: "Autism Spectrum Disorder", label: "Autism Spectrum Disorder", icd10: "F84.0" },
  { value: "Autism Spectrum Disorder - Level 1", label: "Autism Spectrum Disorder - Level 1", icd10: "F84.0" },
  { value: "Autism Spectrum Disorder - Level 2", label: "Autism Spectrum Disorder - Level 2", icd10: "F84.0" },
  { value: "Autism Spectrum Disorder - Level 3", label: "Autism Spectrum Disorder - Level 3", icd10: "F84.0" },
  { value: "ADHD - Combined Type", label: "ADHD - Combined Type", icd10: "F90.2" },
  { value: "ADHD - Predominantly Inattentive", label: "ADHD - Predominantly Inattentive", icd10: "F90.0" },
  { value: "Intellectual Disability - Mild", label: "Intellectual Disability - Mild", icd10: "F70" },
  { value: "Global Developmental Delay", label: "Global Developmental Delay", icd10: "F88" },
  { value: "Other", label: "Other (specify ICD-10 manually)", icd10: "" },
] as const

const INSURANCE_OPTIONS = [
  { value: "", label: "Select insurance provider" },
  { value: "aetna", label: "Aetna" },
  { value: "anthem", label: "Anthem" },
  { value: "bcbs", label: "Blue Cross Blue Shield" },
  { value: "cigna", label: "Cigna" },
  { value: "humana", label: "Humana" },
  { value: "magellan", label: "Magellan" },
  { value: "medicaid", label: "Medicaid" },
  { value: "medicare", label: "Medicare" },
  { value: "optum", label: "Optum" },
  { value: "tricare", label: "Tricare" },
  { value: "uhc", label: "UnitedHealthcare" },
  { value: "other", label: "Other" },
] as const

const DEFAULT_SCHEDULE: ScheduleRow[] = [
  { id: "1", activity: "", startTime: "", description: "" },
  { id: "2", activity: "", startTime: "", description: "" },
  { id: "3", activity: "", startTime: "", description: "" },
  { id: "4", activity: "", startTime: "", description: "" },
  { id: "5", activity: "", startTime: "", description: "" },
  { id: "6", activity: "", startTime: "", description: "" },
  { id: "7", activity: "", startTime: "", description: "" },
  { id: "8", activity: "", startTime: "", description: "" },
]

const SCHEDULE_PLACEHOLDERS = [
  "e.g., Wake up, morning routine",
  "e.g., School, daycare",
  "e.g., Lunch",
  "e.g., School pickup, arriving home",
  "e.g., ABA therapy, homework",
  "e.g., Dinner",
  "e.g., Free play, bath time",
  "e.g., Bedtime routine",
]

const createDefaultFormData = (): FormData => ({
  assessmentType: EVALUATION_TYPES.INITIAL,
  providerName: "",
  providerPhone: "",
  providerFax: "",
  providerAddress: "",
  providerSuite: "",
  firstName: "",
  lastName: "",
  dob: "",
  primaryDiagnosis: "",
  icd10Code: "",
  diagnosisDate: "",
  secondaryDiagnoses: [],
  newSecondaryDiagnosis: "",
  documentsReviewed: {
    mdReferral: false,
    diagnosticEval: false,
    iepReports: false,
    previousABA: false,
    otherAssessments: false,
    other: false,
    otherText: "",
  },
  insuranceProvider: "",
  insuranceId: "",
  guardianName: "",
  guardianPhone: "",
  guardianEmail: "",
  evaluationStartDate: new Date().toISOString().split("T")[0],
  evaluationEndDate: "",
  bcbaName: "",
  bcbaLicense: "",
  bcabaName: "",
  referralDate: "",
  referralSource: "",
  dailySchedule: [...DEFAULT_SCHEDULE],
})

function FormCard({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-[#0D9488]" />}
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function FormInput({
  label,
  required,
  ...props
}: {
  label: string
  required?: boolean
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        {...props}
        className="w-full h-9 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent transition-shadow"
      />
    </div>
  )
}

function FormSelect({
  label,
  required,
  options,
  ...props
}: {
  label: string
  required?: boolean
  options: readonly { value: string; label: string }[]
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        {...props}
        className="w-full h-9 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent transition-shadow bg-white"
      >
        {(options ?? []).map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function FormCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-[#0D9488] focus:ring-[#0D9488]"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}

function ClientInfoForm({
  formData,
  setFormData,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
}) {
  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateDocument = (key: keyof DocumentsReviewed, value: boolean | string) => {
    setFormData((prev) => ({
      ...prev,
      documentsReviewed: { ...prev.documentsReviewed, [key]: value },
    }))
  }

  const handleDiagnosisChange = (diagnosis: string) => {
    const selected = DIAGNOSIS_OPTIONS.find((d) => d.value === diagnosis)
    updateField("primaryDiagnosis", diagnosis)
    updateField("icd10Code", selected?.icd10 ?? "")
  }

  const addSecondaryDiagnosis = () => {
    const newDiag = formData.newSecondaryDiagnosis.trim()
    if (newDiag && (formData.secondaryDiagnoses?.length ?? 0) < 5) {
      updateField("secondaryDiagnoses", [...(formData.secondaryDiagnoses ?? []), newDiag])
      updateField("newSecondaryDiagnosis", "")
    }
  }

  const removeSecondaryDiagnosis = (index: number) => {
    updateField(
      "secondaryDiagnoses",
      (formData.secondaryDiagnoses ?? []).filter((_, i) => i !== index),
    )
  }

  const updateScheduleRow = (id: string, field: keyof ScheduleRow, value: string) => {
    updateField(
      "dailySchedule",
      (formData.dailySchedule ?? []).map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    )
  }

  const addScheduleRow = () => {
    if ((formData.dailySchedule?.length ?? 0) < 20) {
      updateField("dailySchedule", [
        ...(formData.dailySchedule ?? []),
        { id: crypto.randomUUID(), activity: "", startTime: "", description: "" },
      ])
    }
  }

  const removeScheduleRow = (id: string) => {
    if ((formData.dailySchedule?.length ?? 0) > 1) {
      updateField(
        "dailySchedule",
        (formData.dailySchedule ?? []).filter((row) => row.id !== id),
      )
    }
  }

  return (
    <div className="space-y-6">
      <FormCard title="Assessment Type" description="Select the type of assessment being conducted">
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="assessmentType"
              value={EVALUATION_TYPES.INITIAL}
              checked={formData.assessmentType === EVALUATION_TYPES.INITIAL}
              onChange={() => updateField("assessmentType", EVALUATION_TYPES.INITIAL)}
              className="h-4 w-4 text-[#0D9488] focus:ring-[#0D9488]"
            />
            <span className="text-sm font-medium">Initial Assessment</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="assessmentType"
              value={EVALUATION_TYPES.REASSESSMENT}
              checked={formData.assessmentType === EVALUATION_TYPES.REASSESSMENT}
              onChange={() => updateField("assessmentType", EVALUATION_TYPES.REASSESSMENT)}
              className="h-4 w-4 text-[#0D9488] focus:ring-[#0D9488]"
            />
            <span className="text-sm font-medium">Reassessment</span>
          </label>
        </div>
      </FormCard>

      <FormCard title="Provider Information" description="Agency and provider contact information" icon={Building}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <FormInput
              label="Provider/Agency Name"
              required
              placeholder="Enter provider or agency name"
              value={formData.providerName}
              onChange={(e) => updateField("providerName", e.target.value)}
            />
          </div>
          <FormInput
            label="Phone Number"
            required
            type="tel"
            placeholder="(555) 555-5555"
            value={formData.providerPhone}
            onChange={(e) => updateField("providerPhone", e.target.value)}
          />
          <FormInput
            label="Fax Number"
            type="tel"
            placeholder="(555) 555-5556"
            value={formData.providerFax}
            onChange={(e) => updateField("providerFax", e.target.value)}
          />
          <FormInput
            label="Address"
            required
            placeholder="123 Main Street"
            value={formData.providerAddress}
            onChange={(e) => updateField("providerAddress", e.target.value)}
          />
          <FormInput
            label="Suite/Unit"
            placeholder="Suite 100"
            value={formData.providerSuite}
            onChange={(e) => updateField("providerSuite", e.target.value)}
          />
        </div>
      </FormCard>

      <FormCard title="Client Demographics" description="Basic information about the client" icon={User}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="First Name"
            required
            placeholder="Enter first name"
            value={formData.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
          />
          <FormInput
            label="Last Name"
            required
            placeholder="Enter last name"
            value={formData.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
          />
          <FormInput
            label="Date of Birth"
            required
            type="date"
            value={formData.dob}
            onChange={(e) => updateField("dob", e.target.value)}
          />
        </div>
      </FormCard>

      <FormCard title="Medical Diagnosis" description="Clinical diagnoses and ICD-10 codes" icon={FileText}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Primary Diagnosis"
              required
              options={DIAGNOSIS_OPTIONS}
              value={formData.primaryDiagnosis}
              onChange={(e) => handleDiagnosisChange(e.target.value)}
            />
            <FormInput
              label="ICD-10 Code"
              required
              placeholder="Auto-populated"
              value={formData.icd10Code}
              onChange={(e) => updateField("icd10Code", e.target.value)}
              readOnly={formData.primaryDiagnosis !== "Other"}
              className={formData.primaryDiagnosis !== "Other" ? "bg-gray-50" : ""}
            />
            <FormInput
              label="Date of Diagnosis"
              required
              type="date"
              value={formData.diagnosisDate}
              onChange={(e) => updateField("diagnosisDate", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Secondary Diagnoses</label>
            <div className="flex gap-2">
              <input
                placeholder="Enter additional diagnosis"
                value={formData.newSecondaryDiagnosis}
                onChange={(e) => updateField("newSecondaryDiagnosis", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSecondaryDiagnosis()}
                className="flex-1 h-9 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
              />
              <button
                type="button"
                onClick={addSecondaryDiagnosis}
                disabled={(formData.secondaryDiagnoses?.length ?? 0) >= 5}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Add
              </button>
            </div>
            {(formData.secondaryDiagnoses?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {(formData.secondaryDiagnoses ?? []).map((diag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {diag}
                    <button onClick={() => removeSecondaryDiagnosis(index)} className="hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500">{formData.secondaryDiagnoses?.length ?? 0} of 5 diagnoses added</p>
          </div>
        </div>
      </FormCard>

      <FormCard
        title="Documents Reviewed"
        description="Check all documents that were reviewed for this assessment"
        icon={FileCheck}
      >
        <div className="space-y-3">
          <FormCheckbox
            label="MD Referral, Doctor's notes"
            checked={formData.documentsReviewed?.mdReferral ?? false}
            onChange={(v) => updateDocument("mdReferral", v)}
          />
          <FormCheckbox
            label="Comprehensive Diagnostic Evaluation"
            checked={formData.documentsReviewed?.diagnosticEval ?? false}
            onChange={(v) => updateDocument("diagnosticEval", v)}
          />
          <FormCheckbox
            label="IEP, School Reports"
            checked={formData.documentsReviewed?.iepReports ?? false}
            onChange={(v) => updateDocument("iepReports", v)}
          />
          <FormCheckbox
            label="Previous ABA reports"
            checked={formData.documentsReviewed?.previousABA ?? false}
            onChange={(v) => updateDocument("previousABA", v)}
          />
          <FormCheckbox
            label="Other assessments (BIP, psychological eval)"
            checked={formData.documentsReviewed?.otherAssessments ?? false}
            onChange={(v) => updateDocument("otherAssessments", v)}
          />
          <div className="space-y-2">
            <FormCheckbox
              label="Other:"
              checked={formData.documentsReviewed?.other ?? false}
              onChange={(v) => updateDocument("other", v)}
            />
            {formData.documentsReviewed?.other && (
              <input
                placeholder="Specify other documents"
                value={formData.documentsReviewed?.otherText ?? ""}
                onChange={(e) => updateDocument("otherText", e.target.value)}
                className="ml-6 w-full h-9 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
              />
            )}
          </div>
        </div>
      </FormCard>

      <FormCard title="Insurance Information" description="Insurance provider and policy details" icon={Shield}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            label="Insurance Provider"
            options={INSURANCE_OPTIONS}
            value={formData.insuranceProvider}
            onChange={(e) => updateField("insuranceProvider", e.target.value)}
          />
          <FormInput
            label="Insurance ID / Policy Number"
            placeholder="Enter policy number"
            value={formData.insuranceId}
            onChange={(e) => updateField("insuranceId", e.target.value)}
          />
        </div>
      </FormCard>

      <FormCard title="Guardian / Caregiver Information" description="Primary contact for the client" icon={Users}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Guardian Name"
            placeholder="Enter guardian name"
            value={formData.guardianName}
            onChange={(e) => updateField("guardianName", e.target.value)}
          />
          <FormInput
            label="Phone Number"
            type="tel"
            placeholder="(555) 555-5555"
            value={formData.guardianPhone}
            onChange={(e) => updateField("guardianPhone", e.target.value)}
          />
          <div className="md:col-span-2">
            <FormInput
              label="Email Address"
              type="email"
              placeholder="guardian@email.com"
              value={formData.guardianEmail}
              onChange={(e) => updateField("guardianEmail", e.target.value)}
            />
          </div>
        </div>
      </FormCard>

      <FormCard title="Assessment Details" description="Information about the assessment session and responsible staff">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Date(s) of Evaluation - Start"
              required
              type="date"
              value={formData.evaluationStartDate}
              onChange={(e) => updateField("evaluationStartDate", e.target.value)}
            />
            <FormInput
              label="End Date (if multi-day)"
              type="date"
              value={formData.evaluationEndDate}
              onChange={(e) => updateField("evaluationEndDate", e.target.value)}
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Responsible Supervisor(s)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="BCBA Name"
                required
                placeholder="Enter BCBA name"
                value={formData.bcbaName}
                onChange={(e) => updateField("bcbaName", e.target.value)}
              />
              <FormInput
                label="BCBA License #"
                required
                placeholder="Enter license number"
                value={formData.bcbaLicense}
                onChange={(e) => updateField("bcbaLicense", e.target.value)}
              />
              <FormInput
                label="BCaBA Name (if applicable)"
                placeholder="Enter BCaBA name"
                value={formData.bcabaName}
                onChange={(e) => updateField("bcabaName", e.target.value)}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Referral Date"
                type="date"
                value={formData.referralDate}
                onChange={(e) => updateField("referralDate", e.target.value)}
              />
              <FormInput
                label="Referral Source"
                placeholder="e.g., Pediatrician, School, Self-referred"
                value={formData.referralSource}
                onChange={(e) => updateField("referralSource", e.target.value)}
              />
            </div>
          </div>
        </div>
      </FormCard>

      <FormCard
        title="Daily Schedule"
        description="Document the client's typical daily routine and activities"
        icon={Calendar}
      >
        <div className="space-y-4">
          <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-[#0D9488] text-white">
                  <th className="px-4 py-3 text-left text-sm font-semibold">Activity</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Start Time</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(formData.dailySchedule ?? []).map((row, index) => (
                  <tr key={row.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 border-b border-gray-200">
                      <input
                        placeholder={SCHEDULE_PLACEHOLDERS[index] ?? "Enter activity"}
                        value={row.activity}
                        onChange={(e) => updateScheduleRow(row.id, "activity", e.target.value)}
                        className="w-full h-9 px-3 rounded-md border-0 focus:ring-2 focus:ring-[#0D9488] bg-transparent"
                      />
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200">
                      <input
                        type="time"
                        value={row.startTime}
                        onChange={(e) => updateScheduleRow(row.id, "startTime", e.target.value)}
                        className="w-full h-9 px-3 rounded-md border-0 focus:ring-2 focus:ring-[#0D9488] bg-transparent"
                      />
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200">
                      <input
                        placeholder="Enter description"
                        value={row.description}
                        onChange={(e) => updateScheduleRow(row.id, "description", e.target.value)}
                        className="w-full h-9 px-3 rounded-md border-0 focus:ring-2 focus:ring-[#0D9488] bg-transparent"
                      />
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200 text-center">
                      <button
                        onClick={() => removeScheduleRow(row.id)}
                        disabled={(formData.dailySchedule?.length ?? 0) <= 1}
                        className="p-2 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors disabled:opacity-50"
                        aria-label="Remove activity row"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {(formData.dailySchedule ?? []).map((row, index) => (
              <div
                key={row.id}
                className={`p-4 rounded-xl border border-gray-200 space-y-3 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Activity {index + 1}</span>
                  <button
                    onClick={() => removeScheduleRow(row.id)}
                    disabled={(formData.dailySchedule?.length ?? 0) <= 1}
                    className="p-2 hover:bg-red-50 hover:text-red-600 rounded-md disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <input
                  placeholder={SCHEDULE_PLACEHOLDERS[index] ?? "Enter activity"}
                  value={row.activity}
                  onChange={(e) => updateScheduleRow(row.id, "activity", e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-gray-300 text-sm"
                />
                <input
                  type="time"
                  value={row.startTime}
                  onChange={(e) => updateScheduleRow(row.id, "startTime", e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-gray-300 text-sm"
                />
                <input
                  placeholder="Enter description"
                  value={row.description}
                  onChange={(e) => updateScheduleRow(row.id, "description", e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-gray-300 text-sm"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={addScheduleRow}
              disabled={(formData.dailySchedule?.length ?? 0) >= 20}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add Row
            </button>
          </div>
        </div>
      </FormCard>
    </div>
  )
}

export default function AssessmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isClient, setIsClient] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<FormData>(createDefaultFormData())

  useEffect(() => {
    setIsClient(true)
    // Load saved data from localStorage
    if (typeof window !== "undefined") {
      const saved = safeGetJSON("aria-client-info", null)
      if (saved) {
        setFormData((prev) => ({ ...prev, ...saved }))
      }
    }
  }, [])

  useEffect(() => {
    // Preserve any query parameters (like ?type=reassessment)
    const type = searchParams.get("type")

    // Redirect to the modern client-info page
    const targetUrl = type ? `/assessment/client-info?type=${type}` : "/assessment/client-info"

    router.replace(targetUrl)
  }, [router, searchParams])

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D9488]"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        currentStep={1}
        onStepClick={(step) => {
          // Navigate to corresponding step
          router.push(`/assessment/step${step}`)
        }}
        isCollapsed={false}
        onToggleCollapse={() => {}}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0D9488]/10">
              <User className="h-5 w-5 text-[#0D9488]" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Client Information</h2>
              <p className="text-sm text-gray-500">Step 1 of 18 - Enter client demographics and insurance details</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsSaving(true)} disabled={isSaving}>
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button
              type="button"
              onClick={() => router.push("/assessment/background-history")}
              className="bg-[#0D9488] hover:bg-[#0B7C7C]"
            >
              Continue
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <ClientInfoForm formData={formData} setFormData={setFormData} />
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button
            type="button"
            onClick={() => router.push("/assessment/background-history")}
            className="bg-[#0D9488] hover:bg-[#0B7C7C]"
          >
            Next: Background & History
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </main>
    </div>
  )
}
