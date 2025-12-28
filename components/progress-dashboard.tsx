"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  BarChart3Icon,
  TrendingUpIcon,
  DownloadIcon,
  PrinterIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
} from "@/components/icons"
import type { ClientData, AssessmentData, ReassessmentData } from "@/lib/types"

interface ProgressDashboardProps {
  clientData: ClientData | null
  assessmentData: AssessmentData | null
  reassessmentData: ReassessmentData | null
}

export function ProgressDashboard({ clientData, assessmentData, reassessmentData }: ProgressDashboardProps) {
  const [dateRange, setDateRange] = useState("6-months")
  const [clinicalNotes, setClinicalNotes] = useState("")

  const handlePrint = () => {
    window.print()
  }

  const handleExportPDF = () => {
    // Create a printable version and trigger print dialog
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Progress Dashboard Report</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #0D9488; }
              .section { margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; }
              table { width: 100%; border-collapse: collapse; }
              td, th { padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            </style>
          </head>
          <body>
            <h1>Progress Dashboard Report</h1>
            <p>Generated: ${new Date().toLocaleDateString()}</p>
            <div class="section">
              <h2>Client: ${clientData?.firstName || "N/A"} ${clientData?.lastName || ""}</h2>
              <p>Date Range: ${dateRange}</p>
            </div>
            <div class="section">
              <h2>Clinical Notes</h2>
              <p>${clinicalNotes || "No notes recorded"}</p>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  // Mock data for demonstration
  const servicePeriod = {
    startDate: "2024-06-01",
    endDate: "2024-12-01",
    authorizedHours: 240,
    deliveredHours: 218,
    rbtHours: 180,
    bcbaHours: 30,
    parentTrainingHours: 8,
    gaps: [
      { date: "2024-08-15", reason: "Client illness", duration: 5 },
      { date: "2024-10-22", reason: "Therapist unavailable", duration: 3 },
    ],
  }

  const behaviors = [
    {
      name: "Physical Aggression",
      baseline: 12.5,
      current: 2.1,
      reduction: 83,
      trend: "improving",
      clinicallySignificant: true,
    },
    {
      name: "Tantrums",
      baseline: 8.3,
      current: 3.2,
      reduction: 61,
      trend: "improving",
      clinicallySignificant: true,
    },
    {
      name: "Self-Injury",
      baseline: 5.2,
      current: 4.8,
      reduction: 8,
      trend: "plateaued",
      clinicallySignificant: false,
    },
  ]

  const skills = [
    {
      name: "Following 2-Step Directions",
      progress: 85,
      promptLevel: { previous: "Full Physical", current: "Gestural" },
      generalized: true,
      maintenance: 90,
    },
    {
      name: "Requesting with Words",
      progress: 72,
      promptLevel: { previous: "Verbal", current: "Independent" },
      generalized: true,
      maintenance: 85,
    },
    {
      name: "Toilet Training",
      progress: 45,
      promptLevel: { previous: "Full Physical", current: "Partial Physical" },
      generalized: false,
      maintenance: 0,
    },
  ]

  const parentFidelity = {
    overall: 78,
    byType: [
      { type: "Reinforcement", score: 85 },
      { type: "Prompting", score: 72 },
      { type: "Data Collection", score: 68 },
      { type: "Crisis Prevention", score: 90 },
    ],
    trainingHours: 8,
    scores: [
      { date: "Jul", score: 45 },
      { date: "Aug", score: 58 },
      { date: "Sep", score: 65 },
      { date: "Oct", score: 72 },
      { date: "Nov", score: 78 },
    ],
  }

  const utilizationPercent = Math.round((servicePeriod.deliveredHours / servicePeriod.authorizedHours) * 100)

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-[#0D9488]/10 via-cyan-50/50 to-blue-50/50 border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Progress Dashboard</h2>
            <p className="text-sm text-muted-foreground mt-1">Visual progress report for reassessment period</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3-months">Last 3 Months</SelectItem>
                <SelectItem value="6-months">Last 6 Months</SelectItem>
                <SelectItem value="12-months">Last 12 Months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handlePrint}>
              <PrinterIcon className="h-4 w-4" />
              Print
            </Button>
            <Button size="sm" className="gap-2 bg-[#0D9488] hover:bg-[#0F766E]" onClick={handleExportPDF}>
              <DownloadIcon className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Service Period Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3Icon className="h-5 w-5 text-[#0D9488]" />
              Service Period Summary
            </CardTitle>
            <CardDescription>
              Authorization period: {new Date(servicePeriod.startDate).toLocaleDateString()} -{" "}
              {new Date(servicePeriod.endDate).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Hours Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Authorized Hours</div>
                <div className="text-3xl font-bold text-foreground">{servicePeriod.authorizedHours}</div>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Delivered Hours</div>
                <div className="text-3xl font-bold text-[#0D9488]">{servicePeriod.deliveredHours}</div>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Utilization Rate</div>
                <div className="text-3xl font-bold text-blue-600">{utilizationPercent}%</div>
              </div>
            </div>

            {/* Service Mix Pie Chart (Visual representation) */}
            <div>
              <h4 className="font-medium mb-3">Service Mix</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-32 text-sm text-muted-foreground">RBT Services</div>
                  <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0D9488] flex items-center justify-end pr-3"
                      style={{ width: `${(servicePeriod.rbtHours / servicePeriod.deliveredHours) * 100}%` }}
                    >
                      <span className="text-xs font-medium text-white">{servicePeriod.rbtHours}h</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium w-12 text-right">
                    {Math.round((servicePeriod.rbtHours / servicePeriod.deliveredHours) * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 text-sm text-muted-foreground">BCBA Supervision</div>
                  <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 flex items-center justify-end pr-3"
                      style={{ width: `${(servicePeriod.bcbaHours / servicePeriod.deliveredHours) * 100}%` }}
                    >
                      <span className="text-xs font-medium text-white">{servicePeriod.bcbaHours}h</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium w-12 text-right">
                    {Math.round((servicePeriod.bcbaHours / servicePeriod.deliveredHours) * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 text-sm text-muted-foreground">Parent Training</div>
                  <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 flex items-center justify-end pr-3"
                      style={{ width: `${(servicePeriod.parentTrainingHours / servicePeriod.deliveredHours) * 100}%` }}
                    >
                      <span className="text-xs font-medium text-white">{servicePeriod.parentTrainingHours}h</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium w-12 text-right">
                    {Math.round((servicePeriod.parentTrainingHours / servicePeriod.deliveredHours) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Gap Alerts */}
            {servicePeriod.gaps.length > 0 && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircleIcon className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-orange-900 mb-2">Service Gaps Detected</h4>
                    <div className="space-y-1">
                      {servicePeriod.gaps.map((gap, idx) => (
                        <div key={idx} className="text-sm text-orange-800">
                          {new Date(gap.date).toLocaleDateString()}: {gap.reason} ({gap.duration} days)
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="behaviors" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="behaviors">Behavior Reduction</TabsTrigger>
            <TabsTrigger value="skills">Skill Acquisition</TabsTrigger>
            <TabsTrigger value="fidelity">Parent Fidelity</TabsTrigger>
            <TabsTrigger value="comparison">Comparison View</TabsTrigger>
          </TabsList>

          {/* Behavior Reduction Progress */}
          <TabsContent value="behaviors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Behavior Reduction Progress</CardTitle>
                <CardDescription>Baseline frequency vs current performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {behaviors.map((behavior, idx) => (
                  <div key={idx} className="p-4 border border-border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-foreground">{behavior.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            behavior.reduction >= 70 ? "default" : behavior.reduction >= 30 ? "secondary" : "outline"
                          }
                          className={
                            behavior.reduction >= 70
                              ? "bg-green-500"
                              : behavior.reduction >= 30
                                ? "bg-yellow-500"
                                : "bg-red-500 text-white"
                          }
                        >
                          {behavior.reduction}% Reduction
                        </Badge>
                        {behavior.clinicallySignificant && (
                          <Badge variant="outline" className="border-[#0D9488] text-[#0D9488]">
                            Clinically Significant
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Visual Graph */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Baseline</span>
                        <span className="font-medium">{behavior.baseline} per hour</span>
                      </div>
                      <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500/30" style={{ width: "100%" }} />
                      </div>

                      <div className="flex items-center justify-between text-sm mt-3">
                        <span className="text-muted-foreground">Current</span>
                        <span className="font-medium">{behavior.current} per hour</span>
                      </div>
                      <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${(behavior.current / behavior.baseline) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Trend Indicator */}
                    <div className="flex items-center gap-2 pt-2">
                      <TrendingUpIcon
                        className={`h-4 w-4 ${
                          behavior.trend === "improving"
                            ? "text-green-500 rotate-0"
                            : behavior.trend === "plateaued"
                              ? "text-gray-400 rotate-90"
                              : "text-red-500 rotate-180"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          behavior.trend === "improving"
                            ? "text-green-600"
                            : behavior.trend === "plateaued"
                              ? "text-gray-600"
                              : "text-red-600"
                        }`}
                      >
                        {behavior.trend.charAt(0).toUpperCase() + behavior.trend.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Skill Acquisition Progress */}
          <TabsContent value="skills" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Skill Acquisition Progress</CardTitle>
                <CardDescription>Progress toward mastery and independence</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {skills.map((skill, idx) => (
                  <div key={idx} className="p-4 border border-border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-foreground">{skill.name}</h4>
                      <span className="text-2xl font-bold text-[#0D9488]">{skill.progress}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress to Mastery</span>
                        <span>{skill.progress}/100</span>
                      </div>
                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#0D9488] to-[#0F766E] transition-all duration-500"
                          style={{ width: `${skill.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Prompting Level Changes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Previous Prompt Level</div>
                        <div className="text-sm font-medium text-gray-600">{skill.promptLevel.previous}</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Current Prompt Level</div>
                        <div className="text-sm font-medium text-green-700">{skill.promptLevel.current}</div>
                      </div>
                    </div>

                    {/* Generalization & Maintenance */}
                    <div className="flex items-center gap-4 pt-2 border-t border-border">
                      <div className="flex items-center gap-2">
                        {skill.generalized ? (
                          <CheckCircle2Icon className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                        )}
                        <span className="text-sm text-muted-foreground">Generalized Across Settings</span>
                      </div>
                      {skill.maintenance > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          Maintenance: {skill.maintenance}%
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Parent Fidelity Tracking */}
          <TabsContent value="fidelity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Parent Fidelity Tracking</CardTitle>
                <CardDescription>Training completion and implementation accuracy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall Score */}
                <div className="text-center p-6 bg-gradient-to-br from-[#0D9488]/10 to-cyan-50 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">Overall Fidelity Score</div>
                  <div className="text-5xl font-bold text-[#0D9488] mb-2">{parentFidelity.overall}%</div>
                  <Badge variant="secondary">Based on {parentFidelity.trainingHours} training hours</Badge>
                </div>

                {/* Fidelity Over Time - Line Graph */}
                <div>
                  <h4 className="font-medium mb-4">Fidelity Scores Over Time</h4>
                  <div className="flex items-end justify-between gap-2 h-48 pb-6">
                    {parentFidelity.scores.map((point, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                        <div className="text-xs font-medium text-[#0D9488]">{point.score}%</div>
                        <div
                          className="w-full bg-[#0D9488] rounded-t-lg transition-all duration-500 hover:bg-[#0F766E]"
                          style={{ height: `${(point.score / 100) * 100}%` }}
                        />
                        <div className="text-xs text-muted-foreground">{point.date}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Competency by Type */}
                <div>
                  <h4 className="font-medium mb-4">Competency by Intervention Type</h4>
                  <div className="space-y-3">
                    {parentFidelity.byType.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-40 text-sm text-muted-foreground">{item.type}</div>
                        <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-[#0D9488] flex items-center justify-end pr-3 transition-all duration-500"
                            style={{ width: `${item.score}%` }}
                          >
                            <span className="text-xs font-medium text-white">{item.score}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comparison View */}
          <TabsContent value="comparison" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Last Assessment vs Current</CardTitle>
                <CardDescription>Side-by-side progress comparison</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Domain Scores Comparison */}
                <div>
                  <h4 className="font-medium mb-4">Domain Score Changes</h4>
                  <div className="space-y-3">
                    {[
                      { domain: "Communication", previous: 45, current: 72, change: 27 },
                      { domain: "Social Skills", previous: 38, current: 65, change: 27 },
                      { domain: "Daily Living", previous: 52, current: 68, change: 16 },
                      { domain: "Motor Skills", previous: 70, current: 85, change: 15 },
                      { domain: "Cognitive", previous: 55, current: 62, change: 7 },
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 border border-border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium">{item.domain}</span>
                          <Badge
                            variant={item.change >= 20 ? "default" : item.change >= 10 ? "secondary" : "outline"}
                            className={
                              item.change >= 20 ? "bg-green-500" : item.change >= 10 ? "bg-blue-500" : "bg-gray-400"
                            }
                          >
                            +{item.change} points
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Previous</div>
                            <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gray-400 flex items-center justify-center"
                                style={{ width: `${item.previous}%` }}
                              >
                                <span className="text-xs font-medium text-white">{item.previous}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Current</div>
                            <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 flex items-center justify-center"
                                style={{ width: `${item.current}%` }}
                              >
                                <span className="text-xs font-medium text-white">{item.current}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clinical Notes Section */}
                <div className="pt-4 border-t border-border">
                  <Label htmlFor="clinicalNotes" className="text-sm font-medium mb-2 block">
                    Clinical Notes & Observations
                  </Label>
                  <Textarea
                    id="clinicalNotes"
                    placeholder="Add clinical notes about progress patterns, recommendations, or concerns..."
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
