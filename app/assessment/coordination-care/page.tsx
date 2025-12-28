"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PlusIcon,
  TrashIcon,
  UserIcon,
  PhoneIcon,
  MailIcon,
  CheckCircle,
  Clock,
  Home,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AssessmentSidebar } from "@/components/assessment-sidebar"
import { safeGetItem, safeSetItem } from "@/lib/safe-storage"

// Types
interface CareProvider {
  id: string
  type: string
  name: string
  organization: string
  phone: string
  email: string
  fax: string
  address: string
  communicationFrequency: string
  lastContact: string
  roiStatus: "pending" | "signed" | "expired" | "not-needed"
  roiExpiration: string
  notes: string
}

interface CoordinationData {
  providers: CareProvider[]
  communicationPlan: string
  teamMeetingFrequency: string
  nextTeamMeeting: string
  sharedGoals: string
  referrals: string
  coordinationNotes: string
}

const PROVIDER_TYPES = [
  "Primary Care Physician (PCP)",
  "Psychiatrist",
  "Neurologist",
  "Pediatrician",
  "School (SPED Teacher)",
  "School (General Ed Teacher)",
  "School Psychologist",
  "Speech-Language Pathologist (SLP)",
  "Occupational Therapist (OT)",
  "Physical Therapist (PT)",
  "Mental Health Counselor",
  "Social Worker",
  "Case Manager",
  "Insurance Care Coordinator",
  "Previous ABA Provider",
  "Other",
]

const COMMUNICATION_FREQUENCIES = [
  "Weekly",
  "Bi-weekly",
  "Monthly",
  "Quarterly",
  "As Needed",
  "Upon Request",
  "Initial Contact Only",
]

const DEFAULT_PROVIDER: Omit<CareProvider, "id"> = {
  type: "",
  name: "",
  organization: "",
  phone: "",
  email: "",
  fax: "",
  address: "",
  communicationFrequency: "As Needed",
  lastContact: "",
  roiStatus: "pending",
  roiExpiration: "",
  notes: "",
}

export default function CoordinationCarePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [data, setData] = useState<CoordinationData>({
    providers: [],
    communicationPlan: "",
    teamMeetingFrequency: "Quarterly",
    nextTeamMeeting: "",
    sharedGoals: "",
    referrals: "",
    coordinationNotes: "",
  })

  // Load from localStorage
  useEffect(() => {
    const saved = safeGetItem("aria_coordination_care", null)
    if (saved) {
      setData(saved)
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    safeSetItem("aria_coordination_care", data)
  }, [data])

  const addProvider = () => {
    const newProvider: CareProvider = {
      ...DEFAULT_PROVIDER,
      id: Date.now().toString(),
    }
    setData({ ...data, providers: [...data.providers, newProvider] })
    toast({ title: "Provider Added", description: "New care provider added to the team" })
  }

  const updateProvider = (id: string, updates: Partial<CareProvider>) => {
    setData({
      ...data,
      providers: data.providers.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })
  }

  const deleteProvider = (id: string) => {
    setData({
      ...data,
      providers: data.providers.filter((p) => p.id !== id),
    })
    toast({ title: "Provider Removed" })
  }

  const getRoiStatusBadge = (status: CareProvider["roiStatus"]) => {
    switch (status) {
      case "signed":
        return <Badge className="bg-green-500">ROI Signed</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            ROI Pending
          </Badge>
        )
      case "expired":
        return <Badge variant="destructive">ROI Expired</Badge>
      case "not-needed":
        return <Badge variant="secondary">ROI Not Needed</Badge>
    }
  }

  const signedRois = data.providers.filter((p) => p.roiStatus === "signed").length
  const pendingRois = data.providers.filter((p) => p.roiStatus === "pending").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex">
      <AssessmentSidebar />

      <div className="flex-1">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} className="lg:hidden">
                <Home className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/assessment/caregiver-training")}
                className="lg:hidden"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Coordination of Care</h1>
                <p className="text-sm text-muted-foreground">Step 14 of 18 - Multi-disciplinary team collaboration</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1 hidden sm:flex">
                {data.providers.length} Provider{data.providers.length !== 1 ? "s" : ""}
              </Badge>
              <Badge variant="outline" className="gap-1 text-green-600 hidden sm:flex">
                <CheckCircle className="h-3 w-3" />
                {signedRois} ROI
              </Badge>
              {pendingRois > 0 && (
                <Badge variant="outline" className="gap-1 text-yellow-600 hidden sm:flex">
                  <Clock className="h-3 w-3" />
                  {pendingRois} Pending
                </Badge>
              )}
              <Button onClick={() => router.push("/assessment/cpt-authorization")}>
                Continue
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Care Team */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Care Team Members</h2>
                  <Button onClick={addProvider}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Provider
                  </Button>
                </div>

                {data.providers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <UserIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No care team members added yet</p>
                    <p className="text-sm">Add providers to document coordination of care</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.providers.map((provider) => (
                      <Card key={provider.id} className="p-4 border-l-4 border-l-primary">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <Select
                                value={provider.type}
                                onValueChange={(v) => updateProvider(provider.id, { type: v })}
                              >
                                <SelectTrigger className="h-8 w-[250px] font-medium">
                                  <SelectValue placeholder="Select provider type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {PROVIDER_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getRoiStatusBadge(provider.roiStatus)}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => deleteProvider(provider.id)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Provider Name</Label>
                            <Input
                              value={provider.name}
                              onChange={(e) => updateProvider(provider.id, { name: e.target.value })}
                              placeholder="Dr. John Smith"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Organization</Label>
                            <Input
                              value={provider.organization}
                              onChange={(e) => updateProvider(provider.id, { organization: e.target.value })}
                              placeholder="ABC Medical Center"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Phone</Label>
                            <div className="relative">
                              <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                value={provider.phone}
                                onChange={(e) => updateProvider(provider.id, { phone: e.target.value })}
                                placeholder="(555) 123-4567"
                                className="pl-9"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Email</Label>
                            <div className="relative">
                              <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                value={provider.email}
                                onChange={(e) => updateProvider(provider.id, { email: e.target.value })}
                                placeholder="doctor@example.com"
                                className="pl-9"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Fax</Label>
                            <Input
                              value={provider.fax}
                              onChange={(e) => updateProvider(provider.id, { fax: e.target.value })}
                              placeholder="(555) 123-4568"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Communication Frequency</Label>
                            <Select
                              value={provider.communicationFrequency}
                              onValueChange={(v) => updateProvider(provider.id, { communicationFrequency: v })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {COMMUNICATION_FREQUENCIES.map((freq) => (
                                  <SelectItem key={freq} value={freq}>
                                    {freq}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">ROI Status</Label>
                            <Select
                              value={provider.roiStatus}
                              onValueChange={(v: CareProvider["roiStatus"]) =>
                                updateProvider(provider.id, { roiStatus: v })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="signed">Signed</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="expired">Expired</SelectItem>
                                <SelectItem value="not-needed">Not Needed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">ROI Expiration</Label>
                            <Input
                              type="date"
                              value={provider.roiExpiration}
                              onChange={(e) => updateProvider(provider.id, { roiExpiration: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Last Contact</Label>
                            <Input
                              type="date"
                              value={provider.lastContact}
                              onChange={(e) => updateProvider(provider.id, { lastContact: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          <Label className="text-xs text-muted-foreground">Notes</Label>
                          <Textarea
                            value={provider.notes}
                            onChange={(e) => updateProvider(provider.id, { notes: e.target.value })}
                            placeholder="Notes about coordination, communication history..."
                            rows={2}
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Communication Plan Sidebar */}
            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Communication Plan</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Team Meeting Frequency</Label>
                    <Select
                      value={data.teamMeetingFrequency}
                      onValueChange={(v) => setData({ ...data, teamMeetingFrequency: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                        <SelectItem value="Quarterly">Quarterly</SelectItem>
                        <SelectItem value="As Needed">As Needed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Next Team Meeting</Label>
                    <Input
                      type="date"
                      value={data.nextTeamMeeting}
                      onChange={(e) => setData({ ...data, nextTeamMeeting: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Communication Plan</Label>
                    <Textarea
                      value={data.communicationPlan}
                      onChange={(e) => setData({ ...data, communicationPlan: e.target.value })}
                      placeholder="Describe how and when you will communicate with team members..."
                      rows={4}
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Shared Treatment Goals</h3>
                <Textarea
                  value={data.sharedGoals}
                  onChange={(e) => setData({ ...data, sharedGoals: e.target.value })}
                  placeholder="Goals shared across providers (e.g., communication, self-regulation)..."
                  rows={4}
                />
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Referrals & Recommendations</h3>
                <Textarea
                  value={data.referrals}
                  onChange={(e) => setData({ ...data, referrals: e.target.value })}
                  placeholder="Any referrals made or recommended (e.g., OT, SLP, psychiatry)..."
                  rows={4}
                />
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Additional Notes</h3>
                <Textarea
                  value={data.coordinationNotes}
                  onChange={(e) => setData({ ...data, coordinationNotes: e.target.value })}
                  placeholder="Any other coordination notes..."
                  rows={4}
                />
              </Card>

              {/* Quick Stats */}
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
                <h3 className="font-semibold mb-4">Coordination Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Providers</span>
                    <span className="font-semibold">{data.providers.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">ROIs Signed</span>
                    <span className="font-semibold text-green-600">{signedRois}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">ROIs Pending</span>
                    <span className="font-semibold text-yellow-600">{pendingRois}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Medical Providers</span>
                    <span className="font-semibold">
                      {
                        data.providers.filter(
                          (p) =>
                            p.type.includes("Physician") ||
                            p.type.includes("Psychiatrist") ||
                            p.type.includes("Neurologist") ||
                            p.type.includes("Pediatrician"),
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">School Contacts</span>
                    <span className="font-semibold">
                      {data.providers.filter((p) => p.type.includes("School")).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Therapy Providers</span>
                    <span className="font-semibold">
                      {
                        data.providers.filter(
                          (p) =>
                            p.type.includes("SLP") ||
                            p.type.includes("OT") ||
                            p.type.includes("PT") ||
                            p.type.includes("Counselor"),
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
