"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import {
  UserIcon,
  ShieldIcon,
  UsersIcon,
  ArrowRightIcon,
  SaveIcon,
  FileTextIcon,
  CheckCircle2Icon,
  PhoneIcon,
} from "@/components/icons"
import type { ClientData } from "@/lib/types"
import { insuranceTemplates } from "@/lib/data/insurance-templates"
import { useToast } from "@/hooks/use-toast"
import { ImportDialog } from "./import-dialog"
import { parseClientDataFile } from "@/lib/import-parsers"
import { DailyScheduleTable } from "./daily-schedule-table"

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
}

interface ClientFormProps {
  clientData: ClientData | null
  onSave: (data: ClientData) => void
  onNext: () => void
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

export function ClientForm({ clientData, onSave, onNext }: ClientFormProps) {
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

  const handleSaveAndNext = () => {
    handleSave()
    onNext()
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

  const isSectionComplete = (fields: string[]): boolean => {
    return fields.every((field) => {
      const value = formData[field as keyof ExtendedClientData]
      return value !== "" && value !== undefined && value !== null && (typeof value !== "boolean" || value === true)
    })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <UserIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Client Information</h2>
            <p className="text-sm text-muted-foreground">Enter client demographics and insurance details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <ImportDialog
            title="Import Client Data"
            description="Import client information from previous assessments, insurance forms, or referral documents. Supported formats: JSON, CSV, PDF, TXT"
            acceptedFormats={[".json", ".csv", ".pdf", ".txt"]}
            onImport={handleImportData}
            parseFunction={parseClientDataFile}
          />
          <Button variant="outline" onClick={handleSave}>
            <SaveIcon className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button onClick={handleSaveAndNext}>
            Continue
            <ArrowRightIcon className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <Card className="border-2 border-[#0D9488]/20">
                <CardHeader>
                  <CardTitle>Assessment Type</CardTitle>
                  <CardDescription>Select the type of assessment being conducted</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="assessmentType"
                        value="initial"
                        checked={formData.assessmentType === "initial"}
                        onChange={(e) => handleChange("assessmentType", e.target.value)}
                        className="w-4 h-4 text-[#0D9488] focus:ring-[#0D9488]"
                      />
                      <span className="text-sm font-medium">Initial Assessment</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="assessmentType"
                        value="reassessment"
                        checked={formData.assessmentType === "reassessment"}
                        onChange={(e) => handleChange("assessmentType", e.target.value)}
                        className="w-4 h-4 text-[#0D9488] focus:ring-[#0D9488]"
                      />
                      <span className="text-sm font-medium">Reassessment</span>
                    </label>
                  </div>
                </CardContent>
              </Card>

              <Card>
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

              {/* Client Demographics */}
              <Card>
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
                </CardContent>
              </Card>

              <Card>
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
                          <div
                            key={index}
                            className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm"
                          >
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

              <Card>
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
              <Card>
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
              <Card>
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Assessment Details</CardTitle>
                    {isSectionComplete(["evaluationStartDate", "bcbaName", "bcbaLicense"]) && (
                      <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <CardDescription>Information about the assessment session and responsible staff</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="evaluationStartDate">
                        Date(s) of Evaluation - Start <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="evaluationStartDate"
                        type="date"
                        value={formData.evaluationStartDate}
                        onChange={(e) => handleChange("evaluationStartDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="evaluationEndDate">End Date (if multi-day)</Label>
                      <Input
                        id="evaluationEndDate"
                        type="date"
                        value={formData.evaluationEndDate}
                        onChange={(e) => handleChange("evaluationEndDate", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Responsible Supervisor(s)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bcbaName">
                          BCBA Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="bcbaName"
                          value={formData.bcbaName}
                          onChange={(e) => handleChange("bcbaName", e.target.value)}
                          placeholder="Enter BCBA name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bcbaLicense">
                          BCBA License # <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="bcbaLicense"
                          value={formData.bcbaLicense}
                          onChange={(e) => handleChange("bcbaLicense", e.target.value)}
                          placeholder="Enter license number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bcabaName">BCaBA Name (if applicable)</Label>
                        <Input
                          id="bcabaName"
                          value={formData.bcabaName}
                          onChange={(e) => handleChange("bcabaName", e.target.value)}
                          placeholder="Enter BCaBA name"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="referralDate">Referral Date</Label>
                        <Input
                          id="referralDate"
                          type="date"
                          value={formData.referralDate}
                          onChange={(e) => handleChange("referralDate", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="referralSource">Referral Source</Label>
                        <Input
                          id="referralSource"
                          value={formData.referralSource}
                          onChange={(e) => handleChange("referralSource", e.target.value)}
                          placeholder="e.g., Pediatrician, School, Self-referred"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Daily Schedule Card */}
              <Card>
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
        </ScrollArea>
      </div>
    </div>
  )
}
