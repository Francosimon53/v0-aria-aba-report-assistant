"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UploadIcon, ChevronRightIcon } from "@/components/icons"
import type { ClientData, AgencyData, APIIntegration } from "@/lib/types"
import { AssessmentTypeBadge } from "@/components/assessment-type-badge"

interface DataIntegrationProps {
  clientData: ClientData | null
  onDataImport: (data: AgencyData) => void
  onSkip?: () => void // Added optional onSkip prop
  onSave?: () => void // Added onSave prop to save data and navigate to next step
}

export function DataIntegration({ clientData, onDataImport, onSkip, onSave }: DataIntegrationProps) {
  const [activeTab, setActiveTab] = useState("import")
  const [integrations, setIntegrations] = useState<APIIntegration[]>([
    {
      id: "1",
      name: "Central Reach",
      type: "central-reach",
      apiKey: "",
      baseUrl: "https://api.centralreach.com",
      status: "disconnected",
      lastSync: "",
    },
    {
      id: "2",
      name: "Rethink Behavioral Health",
      type: "rethink",
      apiKey: "",
      baseUrl: "https://api.rethinkbehavioralhealth.com",
      status: "disconnected",
      lastSync: "",
    },
  ])

  const [importedData, setImportedData] = useState<AgencyData[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // In a real app, parse the file here
    }
  }

  const handleAPIConnect = (integrationId: string, apiKey: string) => {
    setIntegrations(
      integrations.map((integration) =>
        integration.id === integrationId
          ? { ...integration, apiKey, status: "connected" as const, lastSync: new Date().toISOString() }
          : integration,
      ),
    )
  }

  const handleSync = (integrationId: string) => {
    // Simulate data sync
    setIntegrations(
      integrations.map((integration) =>
        integration.id === integrationId ? { ...integration, lastSync: new Date().toISOString() } : integration,
      ),
    )
  }

  const handleGoToClientInfo = () => {
    window.location.href = "/assessment/new"
  }

  const handleSkipAndContinue = () => {
    if (onSave) {
      onSave()
    }
  }

  // Sample chart data
  const sampleProgressData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
    datasets: [
      {
        label: "Goal 1: Requesting",
        data: [45, 52, 58, 65, 72, 78],
        borderColor: "rgb(14, 165, 233)",
        backgroundColor: "rgba(14, 165, 233, 0.1)",
      },
      {
        label: "Goal 2: Social Initiations",
        data: [30, 35, 42, 48, 55, 62],
        borderColor: "rgb(168, 85, 247)",
        backgroundColor: "rgba(168, 85, 247, 0.1)",
      },
    ],
  }

  const sampleBehaviorData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        label: "Tantrums",
        data: [8, 6, 5, 4, 3],
        backgroundColor: "rgba(239, 68, 68, 0.7)",
      },
      {
        label: "Elopement",
        data: [3, 2, 1, 1, 0],
        backgroundColor: "rgba(251, 146, 60, 0.7)",
      },
    ],
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header section - fixed at top */}
      <div className="shrink-0 p-6 pb-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">Data Integration</h1>
            <AssessmentTypeBadge />
          </div>
          {onSkip && (
            <Button variant="outline" onClick={onSkip} className="gap-2 bg-transparent">
              Skip this step
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-muted-foreground max-w-3xl">
          Import client data or skip this optional step and enter information manually.
        </p>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-teal-50 flex items-center justify-center">
              <UploadIcon className="h-8 w-8 text-teal-600" />
            </div>
            <CardTitle className="text-2xl">Data Import Available</CardTitle>
            <CardDescription className="text-base mt-2">
              You can import client data using the "Import Data" button on the Client Info page. This step is optional -
              you can enter information manually throughout the assessment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleGoToClientInfo} className="w-full gap-2 bg-[#0D9488] hover:bg-[#0F766E]" size="lg">
              Go to Client Info
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button onClick={handleSkipAndContinue} variant="outline" className="w-full gap-2 bg-transparent" size="lg">
              Skip & Continue to Assessment Data
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {onSave && (
        <div className="shrink-0 p-6 border-t border-border bg-background">
          <div className="flex justify-end gap-3">
            <Button onClick={onSave} className="gap-2 bg-[#0D9488] hover:bg-[#0F766E]">
              Save & Continue
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
