"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Copy, FileDown, Edit, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ProgressSection {
  id: number
  title: string
  words: string
  description: string
  content: string
  generating: boolean
}

export default function ProgressReportPage() {
  const { toast } = useToast()
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [reportType, setReportType] = useState("progress")
  const [goalsTrackerData, setGoalsTrackerData] = useState<any>(null)
  const [sections, setSections] = useState<ProgressSection[]>([
    {
      id: 1,
      title: "Client Summary",
      words: "100-150",
      description: "Name, diagnosis, treatment start date, authorized hours",
      content: "",
      generating: false,
    },
    {
      id: 2,
      title: "Reporting Period",
      words: "50-100",
      description: "Date range, total sessions, hours completed",
      content: "",
      generating: false,
    },
    {
      id: 3,
      title: "Treatment Goals Summary",
      words: "200-300",
      description: "List of goals with % progress current",
      content: "",
      generating: false,
    },
    {
      id: 4,
      title: "Progress Narrative",
      words: "400-600",
      description: "Detailed progress narrative by domain",
      content: "",
      generating: false,
    },
    {
      id: 5,
      title: "Data Summary",
      words: "150-200",
      description: "Table of data: baseline vs current for each goal",
      content: "",
      generating: false,
    },
    {
      id: 6,
      title: "Barriers & Challenges",
      words: "100-150",
      description: "Obstacles encountered during the period",
      content: "",
      generating: false,
    },
    {
      id: 7,
      title: "Recommendations",
      words: "150-200",
      description: "Continue, modify, or discontinue treatment",
      content: "",
      generating: false,
    },
    {
      id: 8,
      title: "Continued Medical Necessity",
      words: "200-300",
      description: "Justification for continuing services",
      content: "",
      generating: false,
    },
  ])

  // Load Goals Tracker data
  useEffect(() => {
    const storedData = localStorage.getItem("goalsTrackerData")
    if (storedData) {
      setGoalsTrackerData(JSON.parse(storedData))
    }
  }, [])

  // Calculate stats from Goals Tracker data
  const stats = {
    activeGoals: goalsTrackerData?.length || 0,
    avgProgress: goalsTrackerData
      ? Math.round(
          goalsTrackerData.reduce((sum: number, goal: any) => {
            const progress = goal.currentData ? Number.parseFloat(goal.currentData) : 0
            return sum + progress
          }, 0) / goalsTrackerData.length,
        )
      : 0,
    sessionsCompleted: 24, // This would come from session data
    hoursDelivered: 36, // This would come from session data
  }

  const handleGenerateSection = async (sectionId: number) => {
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, generating: true } : s)))

    try {
      const section = sections.find((s) => s.id === sectionId)
      if (!section) return

      const response = await fetch("/api/generate-progress-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionTitle: section.title,
          sectionDescription: section.description,
          dateFrom,
          dateTo,
          reportType,
          goalsData: goalsTrackerData,
          clientData: JSON.parse(localStorage.getItem("clientData") || "{}"),
        }),
      })

      if (!response.ok) throw new Error("Failed to generate section")

      const data = await response.json()

      setSections((prev) =>
        prev.map((s) => (s.id === sectionId ? { ...s, content: data.content, generating: false } : s)),
      )

      toast({
        title: "Section Generated",
        description: `${section.title} has been generated successfully.`,
      })
    } catch (error) {
      console.error("Error generating section:", error)
      toast({
        title: "Generation Failed",
        description: "Failed to generate section. Please try again.",
        variant: "destructive",
      })
      setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, generating: false } : s)))
    }
  }

  const handleGenerateAll = async () => {
    toast({
      title: "Generating Progress Report",
      description: "Generating all sections...",
    })

    for (const section of sections) {
      await handleGenerateSection(section.id)
    }
  }

  const handleCopySection = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: "Copied",
      description: "Section content copied to clipboard.",
    })
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Progress Report</h1>
          <p className="text-gray-600">Generate progress updates for insurance re-authorization</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleGenerateAll}>
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Full Progress Report
        </Button>
      </div>

      {/* Date Range Selector */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <Label>Reporting Period</Label>
              <div className="flex gap-2 mt-1">
                <Input type="date" placeholder="From" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                <span className="self-center text-muted-foreground">to</span>
                <Input type="date" placeholder="To" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-48 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="progress">Progress Update</SelectItem>
                  <SelectItem value="reauth">Re-Authorization Request</SelectItem>
                  <SelectItem value="discharge">Discharge Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-teal-600">{stats.activeGoals}</div>
            <div className="text-sm text-gray-600">Active Goals</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-teal-600">{stats.avgProgress}%</div>
            <div className="text-sm text-gray-600">Avg Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-teal-600">{stats.sessionsCompleted}</div>
            <div className="text-sm text-gray-600">Sessions Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-teal-600">{stats.hoursDelivered}</div>
            <div className="text-sm text-gray-600">Hours Delivered</div>
          </CardContent>
        </Card>
      </div>

      {/* Report Sections */}
      <div className="space-y-3">
        {sections.map((section) => (
          <Card key={section.id}>
            {section.content ? (
              // Section with content
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-medium text-sm">
                      {section.id}
                    </div>
                    <div>
                      <h3 className="font-medium">{section.title}</h3>
                      <p className="text-sm text-gray-500">{section.content.split(" ").length} words</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleCopySection(section.content)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateSection(section.id)}
                      disabled={section.generating}
                    >
                      {section.generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{section.content}</p>
                </div>
              </div>
            ) : (
              // Section without content
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-medium text-sm">
                    {section.id}
                  </div>
                  <div>
                    <h3 className="font-medium">{section.title}</h3>
                    <p className="text-sm text-gray-500">
                      Est. {section.words} words • {section.description}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 bg-transparent"
                  onClick={() => handleGenerateSection(section.id)}
                  disabled={section.generating}
                >
                  {section.generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Export Button */}
      <div className="mt-6 flex justify-end">
        <Button variant="outline" size="lg" className="gap-2 bg-transparent">
          <FileDown className="h-4 w-4" />
          Export Progress Report
        </Button>
      </div>
    </div>
  )
}
