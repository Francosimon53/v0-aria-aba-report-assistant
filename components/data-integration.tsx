"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  UploadIcon,
  LinkIcon,
  BarChart3Icon,
  TrendingUpIcon,
  CheckIcon,
  RefreshCwIcon,
  ChevronRightIcon,
} from "@/components/icons"
import type { ClientData, AgencyData, APIIntegration } from "@/lib/types"
import { LineChart } from "./charts/line-chart"
import { BarChart } from "./charts/bar-chart"

interface DataIntegrationProps {
  clientData: ClientData | null
  onDataImport: (data: AgencyData) => void
  onSkip?: () => void // Added optional onSkip prop
}

export function DataIntegration({ clientData, onDataImport, onSkip }: DataIntegrationProps) {
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
          <h1 className="text-3xl font-bold text-foreground">Data Integration</h1>
          {onSkip && (
            <Button variant="outline" onClick={onSkip} className="gap-2 bg-transparent">
              Skip this step
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-muted-foreground max-w-3xl">
          Import existing client data from your practice management system, or skip this step if you prefer to enter
          information manually.
        </p>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="import">
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Import Data
                </TabsTrigger>
                <TabsTrigger value="api">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  API Connections
                </TabsTrigger>
                <TabsTrigger value="charts">
                  <BarChart3Icon className="h-4 w-4 mr-2" />
                  Charts
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  <TrendingUpIcon className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="import" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Session Data</CardTitle>
                    <CardDescription>Import CSV, Excel, or JSON files from your agency software</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Data Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select data type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="session">Session Notes</SelectItem>
                          <SelectItem value="behavior">Behavior Data</SelectItem>
                          <SelectItem value="progress">Progress Tracking</SelectItem>
                          <SelectItem value="billing">Billing Records</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Upload File</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                        <UploadIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">Drag and drop or click to upload</p>
                        <Input
                          type="file"
                          accept=".csv,.xlsx,.json"
                          onChange={handleFileUpload}
                          className="max-w-xs mx-auto"
                        />
                      </div>
                    </div>

                    {selectedFile && (
                      <div className="flex items-center gap-2 p-3 bg-secondary rounded-md">
                        <CheckIcon className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{selectedFile.name}</span>
                        <Button size="sm" className="ml-auto">
                          Process File
                        </Button>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Recent Imports</Label>
                      <div className="space-y-2">
                        {[
                          { name: "Session Notes - January.csv", date: "2025-01-15", records: 120 },
                          { name: "Behavior Data - Week 3.xlsx", date: "2025-01-10", records: 85 },
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border border-border rounded-md"
                          >
                            <div>
                              <p className="text-sm font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.records} records • {item.date}
                              </p>
                            </div>
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="api" className="space-y-4 mt-4">
                {integrations.map((integration) => (
                  <Card key={integration.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{integration.name}</CardTitle>
                          <CardDescription>{integration.baseUrl}</CardDescription>
                        </div>
                        <Badge variant={integration.status === "connected" ? "default" : "secondary"}>
                          {integration.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {integration.status === "disconnected" ? (
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex gap-2">
                            <Input
                              type="password"
                              placeholder="Enter API key"
                              onChange={(e) => {
                                const key = e.target.value
                                if (key.length > 10) {
                                  handleAPIConnect(integration.id, key)
                                }
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Get your API key from {integration.name} settings
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Last synced:</span>
                            <span className="text-sm">
                              {integration.lastSync ? new Date(integration.lastSync).toLocaleString() : "Never"}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => handleSync(integration.id)} className="flex-1">
                              <RefreshCwIcon className="h-4 w-4 mr-2" />
                              Sync Now
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() =>
                                setIntegrations(
                                  integrations.map((i) =>
                                    i.id === integration.id ? { ...i, status: "disconnected" as const, apiKey: "" } : i,
                                  ),
                                )
                              }
                            >
                              Disconnect
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                <Card>
                  <CardHeader>
                    <CardTitle>Add Custom Integration</CardTitle>
                    <CardDescription>Connect to any REST API endpoint</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label>Integration Name</Label>
                        <Input placeholder="My Custom API" />
                      </div>
                      <div className="space-y-2">
                        <Label>Base URL</Label>
                        <Input placeholder="https://api.example.com" />
                      </div>
                      <div className="space-y-2">
                        <Label>API Key</Label>
                        <Input type="password" placeholder="Enter API key" />
                      </div>
                      <Button>Add Integration</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="charts" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Progress Tracking</CardTitle>
                    <CardDescription>Visual representation of goal achievement over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LineChart data={sampleProgressData} height={300} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Behavior Frequency</CardTitle>
                    <CardDescription>Weekly behavior occurrence data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BarChart data={sampleBehaviorData} height={300} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4 mt-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Total Sessions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">248</div>
                      <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Goals Mastered</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">18</div>
                      <p className="text-xs text-muted-foreground mt-1">+5 this quarter</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Avg Progress Rate</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">78%</div>
                      <p className="text-xs text-muted-foreground mt-1">Across all goals</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Domain Performance</CardTitle>
                    <CardDescription>Progress breakdown by skill domain</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { domain: "Communication", progress: 85, color: "bg-blue-500" },
                        { domain: "Social Skills", progress: 72, color: "bg-purple-500" },
                        { domain: "Adaptive Behavior", progress: 68, color: "bg-green-500" },
                        { domain: "Behavior Reduction", progress: 91, color: "bg-orange-500" },
                      ].map((item) => (
                        <div key={item.domain}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{item.domain}</span>
                            <span className="text-sm text-muted-foreground">{item.progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                            <div className={`h-full ${item.color}`} style={{ width: `${item.progress}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
