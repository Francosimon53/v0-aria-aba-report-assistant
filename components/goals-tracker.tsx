"use client"

import { useState } from "react"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"
import { useRAGSuggestions } from "@/hooks/useRAGSuggestions"
import { Sparkles, Loader2 } from "lucide-react"
import {
  TargetIcon,
  PlusIcon,
  FilterIcon,
  DownloadIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EditIcon,
  ArchiveIcon,
  XIcon,
} from "./icons"
import { cn } from "@/lib/utils"

type GoalStatus = "not-started" | "in-progress" | "mastery" | "discontinued"
type GoalType = "behavior-reduction" | "skill-acquisition" | "parent-training"

interface ShortTermObjective {
  id: string
  description: string
  baseline: string
  current: string
  masteryCriteria: string
  status: GoalStatus
  progress: number
}

interface LongTermObjective {
  id: string
  type: GoalType
  description: string
  startDate: string
  targetDate: string
  status: GoalStatus
  progress: number
  stos: ShortTermObjective[]
  expanded: boolean
}

const statusConfig = {
  "not-started": { label: "Not Started", color: "bg-gray-100 text-gray-700 border-gray-300" },
  "in-progress": { label: "In Progress", color: "bg-blue-100 text-blue-700 border-blue-300" },
  mastery: { label: "Mastery", color: "bg-green-100 text-green-700 border-green-300" },
  discontinued: { label: "Discontinued", color: "bg-red-100 text-red-700 border-red-300" },
}

export function GoalsTracker() {
  const [ltos, setLtos] = useState<LongTermObjective[]>([
    {
      id: "lto-1",
      type: "behavior-reduction",
      description: "Reduce physical aggression towards peers from 5x/day to 1x/week",
      startDate: "2024-01-15",
      targetDate: "2024-07-15",
      status: "in-progress",
      progress: 65,
      expanded: true,
      stos: [
        {
          id: "sto-1-1",
          description: "Use functional communication when frustrated instead of hitting",
          baseline: "0% of opportunities",
          current: "45% of opportunities",
          masteryCriteria: "80% over 3 consecutive sessions",
          status: "in-progress",
          progress: 45,
        },
        {
          id: "sto-1-2",
          description: "Request break using break card when overwhelmed",
          baseline: "0% of opportunities",
          current: "70% of opportunities",
          masteryCriteria: "90% over 5 consecutive sessions",
          status: "in-progress",
          progress: 70,
        },
      ],
    },
    {
      id: "lto-2",
      type: "skill-acquisition",
      description: "Independently complete 10-step tooth brushing routine",
      startDate: "2024-01-20",
      targetDate: "2024-06-20",
      status: "in-progress",
      progress: 40,
      expanded: false,
      stos: [
        {
          id: "sto-2-1",
          description: "Complete steps 1-3 (wet brush, apply toothpaste, start brushing)",
          baseline: "0/3 steps",
          current: "3/3 steps",
          masteryCriteria: "3/3 steps for 5 consecutive days",
          status: "mastery",
          progress: 100,
        },
        {
          id: "sto-2-2",
          description: "Complete steps 4-7 (brush all quadrants systematically)",
          baseline: "0/4 steps",
          current: "2/4 steps",
          masteryCriteria: "4/4 steps for 5 consecutive days",
          status: "in-progress",
          progress: 50,
        },
      ],
    },
  ])

  const [filterType, setFilterType] = useState<GoalType | "all">("all")
  const [filterStatus, setFilterStatus] = useState<GoalStatus | "all">("all")
  const [showAddLTO, setShowAddLTO] = useState(false)
  const [newLTO, setNewLTO] = useState({
    type: "skill-acquisition" as GoalType,
    description: "",
    targetDate: "",
  })

  // RAG Suggestions Hook
  const { suggestions, isLoading: ragLoading, getSuggestions } = useRAGSuggestions()

  const handleGetGoalSuggestions = async () => {
    await getSuggestions("ABA therapy goals behavior reduction skill acquisition insurance requirements")
  }

  const toggleLTOExpanded = (ltoId: string) => {
    setLtos(ltos.map((lto) => (lto.id === ltoId ? { ...lto, expanded: !lto.expanded } : lto)))
  }

  const updateLTOStatus = (ltoId: string, status: GoalStatus) => {
    setLtos(ltos.map((lto) => (lto.id === ltoId ? { ...lto, status } : lto)))
  }

  const updateSTOStatus = (ltoId: string, stoId: string, status: GoalStatus) => {
    setLtos(
      ltos.map((lto) =>
        lto.id === ltoId
          ? {
              ...lto,
              stos: lto.stos.map((sto) => (sto.id === stoId ? { ...sto, status } : sto)),
            }
          : lto,
      ),
    )
  }

  const filteredLtos = ltos.filter((lto) => {
    if (filterType !== "all" && lto.type !== filterType) return false
    if (filterStatus !== "all" && lto.status !== filterStatus) return false
    return true
  })

  const getTypeLabel = (type: GoalType) => {
    const labels = {
      "behavior-reduction": "Behavior Reduction",
      "skill-acquisition": "Skill Acquisition",
      "parent-training": "Parent Training",
    }
    return labels[type]
  }

  const addNewLTO = () => {
    if (!newLTO.description || !newLTO.targetDate) return

    const lto: LongTermObjective = {
      id: `lto-${Date.now()}`,
      type: newLTO.type,
      description: newLTO.description,
      startDate: new Date().toISOString().split("T")[0],
      targetDate: newLTO.targetDate,
      status: "not-started",
      progress: 0,
      expanded: true,
      stos: [],
    }

    setLtos([...ltos, lto])
    setNewLTO({ type: "skill-acquisition", description: "", targetDate: "" })
    setShowAddLTO(false)
  }

  const handleExport = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      goals: ltos,
      summary: {
        total: ltos.length,
        inProgress: ltos.filter((l) => l.status === "in-progress").length,
        mastered: ltos.filter((l) => l.status === "mastery").length,
        avgProgress: Math.round(ltos.reduce((acc, lto) => acc + lto.progress, 0) / ltos.length),
      },
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "goals_tracker_export.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const addSTO = (ltoId: string) => {
    setLtos(
      ltos.map((lto) => {
        if (lto.id === ltoId) {
          const newSto: ShortTermObjective = {
            id: `sto-${Date.now()}`,
            description: "New short-term objective",
            baseline: "0%",
            current: "0%",
            masteryCriteria: "80% over 3 sessions",
            status: "not-started",
            progress: 0,
          }
          return { ...lto, stos: [...lto.stos, newSto] }
        }
        return lto
      }),
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Goals & Objectives Tracker</h1>
          <p className="text-muted-foreground mt-2">Monitor progress across all treatment goals and objectives</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-transparent" onClick={handleExport}>
            <DownloadIcon className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2 bg-[#0D9488] hover:bg-[#0F766E]" onClick={() => setShowAddLTO(true)}>
            <PlusIcon className="h-4 w-4" />
            Add Goal
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <FilterIcon className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Goal Type</label>
              <Select value={filterType} onValueChange={(v) => setFilterType(v as GoalType | "all")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="behavior-reduction">Behavior Reduction</SelectItem>
                  <SelectItem value="skill-acquisition">Skill Acquisition</SelectItem>
                  <SelectItem value="parent-training">Parent Training</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as GoalStatus | "all")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="mastery">Mastery</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setFilterType("all")
                  setFilterStatus("all")
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Goals Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-[#0D9488]">
          <div className="text-2xl font-bold text-gray-900">{ltos.length}</div>
          <div className="text-sm text-muted-foreground">Total Goals</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="text-2xl font-bold text-gray-900">
            {ltos.filter((lto) => lto.status === "in-progress").length}
          </div>
          <div className="text-sm text-muted-foreground">In Progress</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-green-500">
          <div className="text-2xl font-bold text-gray-900">
            {ltos.filter((lto) => lto.status === "mastery").length}
          </div>
          <div className="text-sm text-muted-foreground">Mastered</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-gray-400">
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(ltos.reduce((acc, lto) => acc + lto.progress, 0) / ltos.length)}%
          </div>
          <div className="text-sm text-muted-foreground">Avg Progress</div>
        </Card>
      </div>

      {showAddLTO && (
        <Card className="p-6 border-2 border-[#0D9488] shadow-lg animate-in fade-in-0 slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Add New Goal</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowAddLTO(false)}>
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="goal-type">Goal Type</Label>
              <Select value={newLTO.type} onValueChange={(v) => setNewLTO({ ...newLTO, type: v as GoalType })}>
                <SelectTrigger id="goal-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="behavior-reduction">Behavior Reduction</SelectItem>
                  <SelectItem value="skill-acquisition">Skill Acquisition</SelectItem>
                  <SelectItem value="parent-training">Parent Training</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="goal-description">Goal Description</Label>
              <Textarea
                id="goal-description"
                value={newLTO.description}
                onChange={(e) => setNewLTO({ ...newLTO, description: e.target.value })}
                placeholder="e.g., Client will independently request items using verbal language"
                rows={3}
              />
              {/* RAG Suggestions Button */}
              <button
                type="button"
                onClick={handleGetGoalSuggestions}
                disabled={ragLoading}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all shadow-md"
              >
                {ragLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Get AI Goal Suggestions
              </button>
              {suggestions.length > 0 && (
                <div className="mt-2 space-y-2">
                  {suggestions.slice(0, 3).map((s, i) => (
                    <div
                      key={i}
                      onClick={() => setNewLTO({ ...newLTO, description: s.text })}
                      className="p-2 text-sm bg-purple-50 border border-purple-200 rounded cursor-pointer hover:bg-purple-100"
                    >
                      {s.text.substring(0, 150)}...
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="target-date">Target Date</Label>
              <Input
                id="target-date"
                type="date"
                value={newLTO.targetDate}
                onChange={(e) => setNewLTO({ ...newLTO, targetDate: e.target.value })}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={addNewLTO}
                className="flex-1 bg-[#0D9488] hover:bg-[#0F766E]"
                disabled={!newLTO.description || !newLTO.targetDate}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Goal
              </Button>
              <Button variant="outline" onClick={() => setShowAddLTO(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {filteredLtos.map((lto) => (
          <Card key={lto.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
            {/* LTO Header */}
            <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-[#0D9488]/10 flex items-center justify-center flex-shrink-0">
                  <TargetIcon className="h-6 w-6 text-[#0D9488]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {getTypeLabel(lto.type)}
                        </Badge>
                        <Badge className={cn("text-xs border", statusConfig[lto.status].color)}>
                          {statusConfig[lto.status].label}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{lto.description}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Start: {new Date(lto.startDate).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Target: {new Date(lto.targetDate).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="font-medium text-[#0D9488]">{lto.stos.length} STOs</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={lto.status} onValueChange={(v) => updateLTOStatus(lto.id, v as GoalStatus)}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not-started">Not Started</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="mastery">Mastery</SelectItem>
                          <SelectItem value="discontinued">Discontinued</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon">
                        <EditIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <ArchiveIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Overall Progress</span>
                      <span className="font-semibold text-[#0D9488]">{lto.progress}%</span>
                    </div>
                    <Progress value={lto.progress} className="h-2" />
                  </div>
                </div>
              </div>
            </div>

            {/* STOs Section */}
            <div className="border-t">
              <button
                onClick={() => toggleLTOExpanded(lto.id)}
                className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Short-Term Objectives ({lto.stos.length})</span>
                {lto.expanded ? (
                  <ChevronUpIcon className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                )}
              </button>

              {lto.expanded && (
                <div className="p-6 pt-0 space-y-3">
                  {lto.stos.map((sto, idx) => (
                    <Card key={sto.id} className="p-4 bg-gray-50 border-l-4 border-l-[#0D9488]">
                      <div className="flex items-start gap-4">
                        <div className="h-8 w-8 rounded-full bg-white border-2 border-[#0D9488] flex items-center justify-center flex-shrink-0 font-semibold text-sm text-[#0D9488]">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 mb-2">{sto.description}</p>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm mb-3">
                                <div>
                                  <span className="text-muted-foreground">Baseline: </span>
                                  <span className="font-medium">{sto.baseline}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Current: </span>
                                  <span className="font-medium text-[#0D9488]">{sto.current}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Mastery: </span>
                                  <span className="font-medium">{sto.masteryCriteria}</span>
                                </div>
                              </div>
                            </div>
                            <Select
                              value={sto.status}
                              onValueChange={(v) => updateSTOStatus(lto.id, sto.id, v as GoalStatus)}
                            >
                              <SelectTrigger className="w-[130px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="not-started">Not Started</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="mastery">Mastery</SelectItem>
                                <SelectItem value="discontinued">Discontinued</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {/* Mini Progress */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Progress</span>
                              <Badge className={cn("text-xs", statusConfig[sto.status].color)}>
                                {statusConfig[sto.status].label}
                              </Badge>
                            </div>
                            <Progress value={sto.progress} className="h-1.5" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                  <Button variant="outline" className="w-full gap-2 mt-2 bg-transparent" onClick={() => addSTO(lto.id)}>
                    <PlusIcon className="h-4 w-4" />
                    Add Short-Term Objective
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredLtos.length === 0 && (
        <Card className="p-12 text-center">
          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <TargetIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No goals found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your filters or create a new goal to get started</p>
          <Button className="bg-[#0D9488] hover:bg-[#0F766E]" onClick={() => setShowAddLTO(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create First Goal
          </Button>
        </Card>
      )}
    </div>
  )
}
