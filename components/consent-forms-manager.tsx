"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, CheckCircle2, Clock, AlertCircle, Send, Calendar, User } from "lucide-react"
import { toast } from "sonner"

interface ConsentForm {
  id: string
  name: string
  description: string
  required: boolean
  status: "pending" | "signed" | "expired" | "sent"
  signedDate?: string
  signedBy?: string
  expirationDate?: string
}

interface ConsentFormsManagerProps {
  clientData?: {
    firstName?: string
    lastName?: string
    guardianName?: string
    email?: string
  }
  onSave?: () => void
}

const defaultForms: ConsentForm[] = [
  {
    id: "informed-consent",
    name: "Informed Consent for ABA Services",
    description: "Authorization to provide Applied Behavior Analysis therapy services",
    required: true,
    status: "pending",
  },
  {
    id: "hipaa-authorization",
    name: "HIPAA Authorization",
    description: "Permission to use and disclose protected health information",
    required: true,
    status: "pending",
  },
  {
    id: "photo-video-consent",
    name: "Photo/Video Consent",
    description: "Permission to record sessions for training and supervision purposes",
    required: false,
    status: "pending",
  },
  {
    id: "emergency-contact",
    name: "Emergency Contact & Medical Release",
    description: "Authorization for emergency medical treatment and contact information",
    required: true,
    status: "pending",
  },
  {
    id: "attendance-policy",
    name: "Attendance & Cancellation Policy",
    description: "Acknowledgment of attendance requirements and cancellation procedures",
    required: true,
    status: "pending",
  },
  {
    id: "telehealth-consent",
    name: "Telehealth Consent",
    description: "Authorization for remote/virtual therapy sessions",
    required: false,
    status: "pending",
  },
]

export function ConsentFormsManager({ clientData, onSave }: ConsentFormsManagerProps) {
  const [forms, setForms] = useState<ConsentForm[]>(defaultForms)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load saved forms from localStorage
    const saved = localStorage.getItem("aria-consent-forms")
    if (saved) {
      try {
        setForms(JSON.parse(saved))
      } catch (e) {
        console.error("Error loading consent forms:", e)
      }
    }
  }, [])

  const saveToLocalStorage = (updatedForms: ConsentForm[]) => {
    localStorage.setItem("aria-consent-forms", JSON.stringify(updatedForms))
  }

  const handleMarkSigned = (formId: string) => {
    const updatedForms = forms.map((form) => {
      if (form.id === formId) {
        return {
          ...form,
          status: "signed" as const,
          signedDate: new Date().toISOString().split("T")[0],
          signedBy: clientData?.guardianName || clientData?.firstName || "Guardian/Client",
        }
      }
      return form
    })
    setForms(updatedForms)
    saveToLocalStorage(updatedForms)
    toast.success("Form marked as signed")
  }

  const handleSendForm = (formId: string) => {
    const updatedForms = forms.map((form) => {
      if (form.id === formId) {
        return {
          ...form,
          status: "sent" as const,
        }
      }
      return form
    })
    setForms(updatedForms)
    saveToLocalStorage(updatedForms)
    toast.success("Form sent to client/guardian")
  }

  const handleResetForm = (formId: string) => {
    const updatedForms = forms.map((form) => {
      if (form.id === formId) {
        return {
          ...form,
          status: "pending" as const,
          signedDate: undefined,
          signedBy: undefined,
        }
      }
      return form
    })
    setForms(updatedForms)
    saveToLocalStorage(updatedForms)
    toast.info("Form status reset")
  }

  const getStatusBadge = (status: ConsentForm["status"]) => {
    switch (status) {
      case "signed":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Signed
          </Badge>
        )
      case "sent":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Send className="h-3 w-3 mr-1" />
            Sent
          </Badge>
        )
      case "expired":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
    }
  }

  const signedCount = forms.filter((f) => f.status === "signed").length
  const requiredCount = forms.filter((f) => f.required).length
  const requiredSignedCount = forms.filter((f) => f.required && f.status === "signed").length
  const progress = Math.round((signedCount / forms.length) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Consent Forms</h2>
          <p className="text-gray-600">Manage and track client consent documentation</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-gray-500">Completion</p>
            <p className="text-2xl font-bold text-[#0D9488]">{progress}%</p>
          </div>
          <div className="w-24 h-24 relative">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="#0D9488"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${progress * 2.51} 251`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-medium">
                {signedCount}/{forms.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Required Forms Warning */}
      {requiredSignedCount < requiredCount && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">Required Forms Incomplete</p>
                <p className="text-sm text-amber-700">
                  {requiredCount - requiredSignedCount} of {requiredCount} required forms still need signatures
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Forms List */}
      <div className="grid gap-4">
        {forms.map((form) => (
          <Card
            key={form.id}
            className={`transition-all ${form.status === "signed" ? "border-green-200 bg-green-50/30" : ""}`}
          >
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${form.status === "signed" ? "bg-green-100" : "bg-gray-100"}`}>
                    <FileText className={`h-5 w-5 ${form.status === "signed" ? "text-green-600" : "text-gray-600"}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{form.name}</h3>
                      {form.required && (
                        <Badge variant="outline" className="text-xs border-red-200 text-red-600">
                          Required
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{form.description}</p>
                    {form.status === "signed" && form.signedDate && (
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Signed: {form.signedDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          By: {form.signedBy}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(form.status)}
                  {form.status === "pending" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendForm(form.id)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Send
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleMarkSigned(form.id)}
                        className="bg-[#0D9488] hover:bg-[#0B8278] text-white"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Mark Signed
                      </Button>
                    </>
                  )}
                  {form.status === "sent" && (
                    <Button
                      size="sm"
                      onClick={() => handleMarkSigned(form.id)}
                      className="bg-[#0D9488] hover:bg-[#0B8278] text-white"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Mark Signed
                    </Button>
                  )}
                  {form.status === "signed" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResetForm(form.id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button
          onClick={() => {
            saveToLocalStorage(forms)
            onSave?.()
            toast.success("Consent forms saved")
          }}
          className="bg-[#0D9488] hover:bg-[#0B8278] text-white"
        >
          Save & Continue
        </Button>
      </div>
    </div>
  )
}

export default ConsentFormsManager
