"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Sparkles, RepeatIcon } from "@/components/icons" // Import Sparkles icon for AI Import button and RepeatIcon for reassessment
import {
  UserIcon,
  ShieldIcon,
  UsersIcon,
  SaveIcon,
  FileTextIcon,
  CheckCircle2Icon,
  PhoneIcon,
} from "@/components/icons"
import type { ClientData } from "@/lib/types"
import { insuranceTemplates } from "@/lib/data/insurance-templates"
import { useToast } from "@/hooks/use-toast"
import { ImportDataModal } from "./import-data-modal" // Import AI Import Modal
import { DailyScheduleTable } from "./daily-schedule-table"
import { cn } from "@/lib/utils" // Import cn for conditional styling
import { AssessmentTypeBadge } from "./assessment-type-badge"

interface ExtendedClientData extends ClientData {
  assessmentType?: "initial" | "reassessment"
  providerName?: string
  providerPhone?: string
  providerFax?: string
  providerAddress?: string
  providerSuite?: string
  primaryDiagnosis?: string
  icd10Code?: string
  secondaryDiagnoses?: string[]
  diagnosisDate?: string
  documentsReviewed?: {
    mdReferral: boolean
    diagnosticEval: boolean
    iepReports: boolean
    previousABA: boolean
    otherAssessments: boolean
    other: boolean
    otherText: string
  }
  evaluationStartDate?: string
  evaluationEndDate?: string
  bcbaName?: string
  bcbaLicense?: string
  bcabaName?: string
  age?: number
  gender?: string
  address?: string
}

interface ClientFormProps {
  clientData: ClientData | null
  onSave: (data: ClientData) => void
}

const diagnosisToICD10: Record<string, string> = {
  "Autism Spectrum Disorder (F84.0)": "F84.0",
  "Autism Spectrum Disorder, requiring support (F84.0)": "F84.0",
  "Autism Spectrum Disorder, requiring substantial support (F84.0)": "F84.0",
  "Autism Spectrum Disorder, requiring very substantial support (F84.0)": "F84.0",
  "Other Specified Neurodevelopmental Disorder": "F88",
  "Unspecified Neurodevelopmental Disorder": "F89",
  "ADHD, Combined Type": "F90.2",
  "ADHD, Predominantly Inattentive Type": "F90.0",
  "Global Developmental Delay": "F88",
}

export function ClientForm({ clientData, onSave }: ClientFormProps) {
  const { toast } = useToast()

  const getDefaultFormData = (): ExtendedClientData => ({
    id: crypto.randomUUID(),
    assessmentType: "initial",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    diagnosis: "Autism Spectrum Disorder (F84.0)",
    insuranceProvider: "",
    insuranceId: "",
    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",
    referralSource: "",
    referralDate: "",
    assessmentDate: new Date().toISOString().split("T")[0],
    assessor: "",
    supervisingBCBA: "",
    providerName: "",
    providerPhone: "",
    providerFax: "",
    providerAddress: "",
    providerSuite: "",
    primaryDiagnosis: "Autism Spectrum Disorder (F84.0)",
    icd10Code: "F84.0",
    secondaryDiagnoses: [],
    diagnosisDate: "",
    documentsReviewed: {
      mdReferral: false,
      diagnosticEval: false,
      iepReports: false,
      previousABA: false,
      otherAssessments: false,
      other: false,
      otherText: "",
    },
    evaluationStartDate: new Date().toISOString().split("T")[0],
    evaluationEndDate: "",
    bcbaName: "",
    bcbaLicense: "",
    bcabaName: "",
    age: undefined,
    gender: undefined,
    address: undefined,
  })

  const [formData, setFormData] = useState<ExtendedClientData>(
    clientData
      ? {
          ...getDefaultFormData(),
          ...clientData,
          // Ensure critical fields always have values
          name: clientData.name || "",
          firstName: clientData.firstName || "",
          lastName: clientData.lastName || "",
          dateOfBirth: clientData.dateOfBirth || "",
          diagnosis: clientData.diagnosis || "",
        }
      : getDefaultFormData(),
  )

  useEffect(() => {
    if (clientData) {
      setFormData((prev) => ({
        ...getDefaultFormData(),
        ...prev,
        ...clientData,
      }))
    }
  }, [clientData])

  const [secondaryDiagnosisInput, setSecondaryDiagnosisInput] = useState("")
  const [isImportModalOpen, setIsImportModalOpen] = useState(false) // State for AI-powered import modal

  const handleChange = (field: keyof ExtendedClientData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleDiagnosisChange = (diagnosis: string) => {
    const icd10 = diagnosisToICD10[diagnosis] || ""
    setFormData((prev) => ({
      ...prev,
      primaryDiagnosis: diagnosis,
      diagnosis: diagnosis,
      icd10Code: icd10,
    }))
  }

  const handleDocumentCheckChange = (field: keyof typeof formData.documentsReviewed, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      documentsReviewed: {
        ...prev.documentsReviewed!,
        [field]: checked,
      },
    }))
  }

  const addSecondaryDiagnosis = () => {
    if (secondaryDiagnosisInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        secondaryDiagnoses: [...(prev.secondaryDiagnoses || []), secondaryDiagnosisInput.trim()],
      }))
      setSecondaryDiagnosisInput("")
    }
  }

  const removeSecondaryDiagnosis = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      secondaryDiagnoses: prev.secondaryDiagnoses?.filter((_, i) => i !== index) || [],
    }))
  }

  const handleSave = () => {
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth) {
      toast({ title: "Error", description: "Please fill in required fields", variant: "destructive" })
      return
    }
    onSave(formData as ClientData)
    toast({ title: "Success", description: "Client information saved" })
  }

  const handleImportData = (importedData: Partial<ClientData>) => {
    const newFormData = {
      ...formData,
      ...importedData,
    }
    setFormData(newFormData)

    onSave(newFormData as ClientData)

    toast({
      title: "Data Imported",
      description: "Client information has been imported and saved successfully",
    })
  }

  const handleAIDataExtracted = (data: any) => {
    const updates: Partial<ExtendedClientData> = {}

    // Map AI-extracted fields to form fields
    if (data.firstName) updates.firstName = data.firstName
    if (data.lastName) updates.lastName = data.lastName
    if (data.dateOfBirth) updates.dateOfBirth = data.dateOfBirth
    if (data.age) updates.age = data.age
    if (data.gender) updates.gender = data.gender
    if (data.diagnosis) updates.diagnosis = data.diagnosis
    if (data.diagnosisCode) updates.diagnosisCode = data.diagnosisCode
    if (data.insuranceProvider) updates.insuranceProvider = data.insuranceProvider
    if (data.insuranceId) updates.insuranceId = data.insuranceId
    if (data.guardianName) updates.guardianName = data.guardianName
    if (data.guardianPhone) updates.guardianPhone = data.guardianPhone
    if (data.guardianEmail) updates.guardianEmail = data.guardianEmail
    if (data.address) updates.address = data.address
    if (data.referralSource) updates.referralSource = data.referralSource
    if (data.referralDate) updates.referralDate = data.referralDate

    const newFormData = {
      ...formData,
      ...updates,
    }

    setFormData(newFormData)
    onSave(newFormData as ClientData)

    toast({
      title: "Import Complete!",
      description: "Client information has been populated from the document",
    })
  }

  const isSectionComplete = (fields: string[]): boolean => {
    return fields.every((field) => {
      const value = formData[field as keyof ExtendedClientData]
      return value !== "" && value !== undefined && value !== null && (typeof value !== "boolean" || value === true)
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-[#0D9488]/5 to-[#0D9488]/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <UserIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Client Information</h2>
              <p className="text-sm text-muted-foreground">Enter client demographics and insurance details</p>
            </div>
            {/* Assessment Type Badge */}
            <AssessmentTypeBadge assessmentType={formData.assessmentType} />
          </div>
          <div className="flex gap-2">
            {/* AI Import button */}
            <Button variant="outline" onClick={() => setIsImportModalOpen(true)} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Import Data
            </Button>
            <Button variant="outline" onClick={handleSave}>
              <SaveIcon className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Assessment Type */}
            <Card className="border-2 border-[#0D9488]/30 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Select Assessment Type</CardTitle>
                <CardDescription className="text-base">
                  Choose whether this is a new client evaluation or a 6-month review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => handleChange("assessmentType", "initial")}
                    className={cn(
                      "p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md",
                      formData.assessmentType === "initial"
                        ? "border-[#0D9488] bg-[#0D9488]/10 shadow-md"
                        : "border-gray-200 hover:border-gray-300",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <FileTextIcon className="h-8 w-8 text-[#0D9488]" />
                      <div>
                        <h3 className="font-semibold text-lg">Initial Assessment</h3>
                        <p className="text-sm text-gray-500">New client, first evaluation</p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => handleChange("assessmentType", "reassessment")}
                    className={cn(
                      "p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md",
                      formData.assessmentType === "reassessment"
                        ? "border-[#0D9488] bg-[#0D9488]/10 shadow-md"
                        : "border-gray-200 hover:border-gray-300",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <RepeatIcon className="h-8 w-8 text-[#0D9488]" />
                      <div>
                        <h3 className="font-semibold text-lg">Reassessment</h3>
                        <p className="text-sm text-gray-500">6-month review, renew authorization</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card className="border-2 border-[#0D9488]/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-[#0D9488]" />
                    <CardTitle>Client Demographics</CardTitle>
                  </div>
                  {isSectionComplete(["firstName", "lastName", "dateOfBirth"]) && (
                    <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <CardDescription>Basic information about the client</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">
                    Date of Birth <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleChange("age", Number.parseInt(e.target.value))}
                    placeholder="Enter age"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Input
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    placeholder="Enter gender"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Provider Information */}
            <Card className="border-2 border-[#0D9488]/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="h-5 w-5 text-[#0D9488]" />
                    <CardTitle>Provider Information</CardTitle>
                  </div>
                  {isSectionComplete(["providerName", "providerPhone", "providerAddress"]) && (
                    <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <CardDescription>Agency and provider contact information</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="providerName">
                    Provider/Agency Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="providerName"
                    value={formData.providerName}
                    onChange={(e) => handleChange("providerName", e.target.value)}
                    placeholder="Enter provider or agency name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="providerPhone">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="providerPhone"
                    type="tel"
                    value={formData.providerPhone}
                    onChange={(e) => handleChange("providerPhone", e.target.value)}
                    placeholder="(555) 555-5555"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="providerFax">Fax Number</Label>
                  <Input
                    id="providerFax"
                    type="tel"
                    value={formData.providerFax}
                    onChange={(e) => handleChange("providerFax", e.target.value)}
                    placeholder="(555) 555-5556"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="providerAddress">
                    Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="providerAddress"
                    value={formData.providerAddress}
                    onChange={(e) => handleChange("providerAddress", e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="providerSuite">Suite/Unit</Label>
                  <Input
                    id="providerSuite"
                    value={formData.providerSuite}
                    onChange={(e) => handleChange("providerSuite", e.target.value)}
                    placeholder="Suite 100"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Medical Diagnosis */}
            <Card className="border-2 border-[#0D9488]/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileTextIcon className="h-5 w-5 text-[#0D9488]" />
                    <CardTitle>Medical Diagnosis</CardTitle>
                  </div>
                  {isSectionComplete(["primaryDiagnosis", "icd10Code", "diagnosisDate"]) && (
                    <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <CardDescription>Clinical diagnoses and ICD-10 codes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryDiagnosis">
                      Primary Diagnosis <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.primaryDiagnosis} onValueChange={handleDiagnosisChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select primary diagnosis" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Autism Spectrum Disorder (F84.0)">Autism Spectrum Disorder</SelectItem>
                        <SelectItem value="Autism Spectrum Disorder, requiring support (F84.0)">
                          ASD - Level 1 (Requiring Support)
                        </SelectItem>
                        <SelectItem value="Autism Spectrum Disorder, requiring substantial support (F84.0)">
                          ASD - Level 2 (Requiring Substantial Support)
                        </SelectItem>
                        <SelectItem value="Autism Spectrum Disorder, requiring very substantial support (F84.0)">
                          ASD - Level 3 (Requiring Very Substantial Support)
                        </SelectItem>
                        <SelectItem value="Other Specified Neurodevelopmental Disorder">
                          Other Specified Neurodevelopmental Disorder
                        </SelectItem>
                        <SelectItem value="Unspecified Neurodevelopmental Disorder">
                          Unspecified Neurodevelopmental Disorder
                        </SelectItem>
                        <SelectItem value="ADHD, Combined Type">ADHD, Combined Type</SelectItem>
                        <SelectItem value="ADHD, Predominantly Inattentive Type">
                          ADHD, Predominantly Inattentive Type
                        </SelectItem>
                        <SelectItem value="Global Developmental Delay">Global Developmental Delay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="icd10Code">
                      ICD-10 Code <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="icd10Code"
                      value={formData.icd10Code}
                      onChange={(e) => handleChange("icd10Code", e.target.value)}
                      placeholder="Auto-populated"
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diagnosisDate">
                      Date of Diagnosis <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="diagnosisDate"
                      type="date"
                      value={formData.diagnosisDate}
                      onChange={(e) => handleChange("diagnosisDate", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Secondary Diagnoses</Label>
                  <div className="flex gap-2">
                    <Input
                      value={secondaryDiagnosisInput}
                      onChange={(e) => setSecondaryDiagnosisInput(e.target.value)}
                      placeholder="Enter additional diagnosis"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addSecondaryDiagnosis()
                        }
                      }}
                    />
                    <Button type="button" onClick={addSecondaryDiagnosis} variant="outline">
                      Add
                    </Button>
                  </div>
                  {formData.secondaryDiagnoses && formData.secondaryDiagnoses.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.secondaryDiagnoses.map((diag, index) => (
                        <div key={index} className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm">
                          <span>{diag}</span>
                          <button
                            type="button"
                            onClick={() => removeSecondaryDiagnosis(index)}
                            className="text-gray-500 hover:text-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Documents Reviewed */}
            <Card className="border-2 border-[#0D9488]/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileTextIcon className="h-5 w-5 text-[#0D9488]" />
                  <CardTitle>Documents Reviewed</CardTitle>
                </div>
                <CardDescription>Check all documents that were reviewed for this assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mdReferral"
                    checked={formData.documentsReviewed?.mdReferral}
                    onCheckedChange={(checked) => handleDocumentCheckChange("mdReferral", checked as boolean)}
                  />
                  <Label htmlFor="mdReferral" className="font-normal cursor-pointer">
                    MD Referral, Doctor's notes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="diagnosticEval"
                    checked={formData.documentsReviewed?.diagnosticEval}
                    onCheckedChange={(checked) => handleDocumentCheckChange("diagnosticEval", checked as boolean)}
                  />
                  <Label htmlFor="diagnosticEval" className="font-normal cursor-pointer">
                    Comprehensive Diagnostic Evaluation
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="iepReports"
                    checked={formData.documentsReviewed?.iepReports}
                    onCheckedChange={(checked) => handleDocumentCheckChange("iepReports", checked as boolean)}
                  />
                  <Label htmlFor="iepReports" className="font-normal cursor-pointer">
                    IEP, School Reports
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="previousABA"
                    checked={formData.documentsReviewed?.previousABA}
                    onCheckedChange={(checked) => handleDocumentCheckChange("previousABA", checked as boolean)}
                  />
                  <Label htmlFor="previousABA" className="font-normal cursor-pointer">
                    Previous ABA reports
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="otherAssessments"
                    checked={formData.documentsReviewed?.otherAssessments}
                    onCheckedChange={(checked) => handleDocumentCheckChange("otherAssessments", checked as boolean)}
                  />
                  <Label htmlFor="otherAssessments" className="font-normal cursor-pointer">
                    Other assessments (BIP, psychological eval)
                  </Label>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="other"
                      checked={formData.documentsReviewed?.other}
                      onCheckedChange={(checked) => handleDocumentCheckChange("other", checked as boolean)}
                    />
                    <Label htmlFor="other" className="font-normal cursor-pointer">
                      Other:
                    </Label>
                  </div>
                  {formData.documentsReviewed?.other && (
                    <Input
                      value={formData.documentsReviewed?.otherText}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          documentsReviewed: {
                            ...prev.documentsReviewed!,
                            otherText: e.target.value,
                          },
                        }))
                      }
                      placeholder="Specify other documents"
                      className="ml-6"
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Insurance Information */}
            <Card className="border-2 border-[#0D9488]/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldIcon className="h-5 w-5 text-[#0D9488]" />
                    <CardTitle>Insurance Information</CardTitle>
                  </div>
                  {isSectionComplete(["insuranceProvider", "insuranceId"]) && (
                    <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <CardDescription>Insurance provider and policy details</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="insurance">Insurance Provider</Label>
                  <Select
                    value={formData.insuranceProvider}
                    onValueChange={(value) => handleChange("insuranceProvider", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select insurance" />
                    </SelectTrigger>
                    <SelectContent>
                      {insuranceTemplates.map((ins) => (
                        <SelectItem key={ins.id} value={ins.code}>
                          {ins.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceId">Insurance ID / Policy Number</Label>
                  <Input
                    id="insuranceId"
                    value={formData.insuranceId}
                    onChange={(e) => handleChange("insuranceId", e.target.value)}
                    placeholder="Enter policy number"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Guardian Information */}
            <Card className="border-2 border-[#0D9488]/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-5 w-5 text-[#0D9488]" />
                    <CardTitle>Guardian / Caregiver Information</CardTitle>
                  </div>
                  {isSectionComplete(["guardianName", "guardianPhone"]) && (
                    <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <CardDescription>Primary contact for the client</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guardianName">Guardian Name</Label>
                  <Input
                    id="guardianName"
                    value={formData.guardianName}
                    onChange={(e) => handleChange("guardianName", e.target.value)}
                    placeholder="Enter guardian name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardianPhone">Phone Number</Label>
                  <Input
                    id="guardianPhone"
                    type="tel"
                    value={formData.guardianPhone}
                    onChange={(e) => handleChange("guardianPhone", e.target.value)}
                    placeholder="(555) 555-5555"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="guardianEmail">Email Address</Label>
                  <Input
                    id="guardianEmail"
                    type="email"
                    value={formData.guardianEmail}
                    onChange={(e) => handleChange("guardianEmail", e.target.value)}
                    placeholder="guardian@email.com"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="Enter address"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Daily Schedule Card */}
            <Card className="border-2 border-[#0D9488]/20">
              <CardHeader>
                <CardTitle>Daily Schedule</CardTitle>
                <CardDescription>Document the client's typical daily routine and activities</CardDescription>
              </CardHeader>
              <CardContent>
                <DailyScheduleTable onSave={(scheduleData) => console.log("Schedule saved:", scheduleData)} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Import Modal */}
      <ImportDataModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        targetSection="clientInfo"
        onDataExtracted={handleAIDataExtracted}
      />
    </div>
  )
}
