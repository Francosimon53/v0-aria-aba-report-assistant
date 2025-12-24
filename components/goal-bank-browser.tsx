"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useToast } from "@/hooks/use-toast"
import {
  TargetIcon,
  SearchIcon,
  FilterIcon,
  PlusIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DownloadIcon,
} from "@/components/icons"
import { goalBank, domains } from "@/lib/data/goal-bank"
import type { SelectedGoal } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { NoGoalsEmptyState, SearchNoResults } from "@/components/empty-states"

interface GoalBankBrowserProps {
  onGoalSelect: (goal: SelectedGoal) => void
  selectedGoals?: SelectedGoal[]
}

export function GoalBankBrowser({ onGoalSelect, selectedGoals = [] }: GoalBankBrowserProps) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDomain, setSelectedDomain] = useState<string>("all")
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({})
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedGoalForAdd, setSelectedGoalForAdd] = useState<string | null>(null)
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium")
  const [targetDate, setTargetDate] = useState("")
  const [baselineData, setBaselineData] = useState("")
  const [customizations, setCustomizations] = useState("")

  const filteredGoals = goalBank.filter((goal) => {
    const matchesSearch =
      goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDomain = selectedDomain === "all" || goal.domain === selectedDomain
    return matchesSearch && matchesDomain
  })

  const goalsByDomain = filteredGoals.reduce(
    (acc, goal) => {
      if (!acc[goal.domain]) {
        acc[goal.domain] = []
      }
      acc[goal.domain].push(goal)
      return acc
    },
    {} as Record<string, typeof goalBank>,
  )

  const toggleDomain = (domain: string) => {
    setExpandedDomains((prev) => ({
      ...prev,
      [domain]: !prev[domain],
    }))
  }

  const isGoalSelected = (goalId: string) => {
    return (selectedGoals ?? []).some((g) => g.goalId === goalId)
  }

  const handleAddGoal = () => {
    if (!selectedGoalForAdd) return

    const newGoal: SelectedGoal = {
      goalId: selectedGoalForAdd,
      priority,
      targetDate,
      baselineData,
      customizations,
    }

    onGoalSelect(newGoal)
    setShowAddDialog(false)
    setSelectedGoalForAdd(null)
    setPriority("medium")
    setTargetDate("")
    setBaselineData("")
    setCustomizations("")

    toast({
      title: "Goal Added",
      description: "The goal has been added to your assessment.",
    })
  }

  const openAddDialog = (goalId: string) => {
    setSelectedGoalForAdd(goalId)
    setShowAddDialog(true)
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[#0D9488]/10">
              <TargetIcon className="h-6 w-6 text-[#0D9488]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Goal Bank</h1>
              <p className="text-sm text-gray-600">
                Browse and select evidence-based goals for your client's treatment plan
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search goals by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <Select value={selectedDomain} onValueChange={setSelectedDomain}>
              <SelectTrigger className="w-[200px]">
                <FilterIcon className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                {domains.map((domain) => (
                  <SelectItem key={domain} value={domain}>
                    {domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-5xl mx-auto p-6 space-y-4">
            {/* Selected Goals Summary */}
            {(selectedGoals?.length ?? 0) > 0 && (
              <Card className="border-[#0D9488] bg-[#0D9488]/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckIcon className="h-5 w-5 text-[#0D9488]" />
                      <span className="font-medium text-[#0D9488]">
                        {selectedGoals?.length ?? 0} goal{(selectedGoals?.length ?? 0) !== 1 && "s"} selected
                      </span>
                    </div>
                    <Button variant="outline" size="sm">
                      <DownloadIcon className="h-4 w-4 mr-2" />
                      Export Selected
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Goals by Domain */}
            {filteredGoals.length === 0 ? (
              searchTerm ? (
                <SearchNoResults searchQuery={searchTerm} onClearSearch={() => setSearchTerm("")} />
              ) : (
                <NoGoalsEmptyState />
              )
            ) : (
              Object.entries(goalsByDomain).map(([domain, goals]) => (
                <Collapsible
                  key={domain}
                  open={expandedDomains[domain] ?? true}
                  onOpenChange={() => toggleDomain(domain)}
                >
                  <Card>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="flex flex-row items-center justify-between py-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          {(expandedDomains[domain] ?? true) ? (
                            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                          )}
                          <CardTitle className="text-lg">{domain}</CardTitle>
                          <Badge variant="secondary">{goals.length} goals</Badge>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 space-y-3">
                        {goals.map((goal) => {
                          const selected = isGoalSelected(goal.id)
                          return (
                            <div
                              key={goal.id}
                              className={`p-4 border rounded-lg transition-all duration-200 ${
                                selected
                                  ? "border-[#0D9488] bg-[#0D9488]/5"
                                  : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-gray-900">{goal.title}</h4>
                                    <Badge variant="outline" className="text-xs">
                                      {goal.subdomain}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                    <span>Criteria: {goal.criteria}</span>
                                    <span>•</span>
                                    <span>Age: {goal.ageRange}</span>
                                    <span>•</span>
                                    <span>Measurement: {goal.measurementType}</span>
                                  </div>
                                </div>
                                <div>
                                  {selected ? (
                                    <Badge className="bg-[#0D9488]">
                                      <CheckIcon className="h-3 w-3 mr-1" />
                                      Added
                                    </Badge>
                                  ) : (
                                    <Button size="sm" variant="outline" onClick={() => openAddDialog(goal.id)}>
                                      <PlusIcon className="h-4 w-4 mr-1" />
                                      Add
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Add Goal Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Goal to Assessment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Priority Level</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as "high" | "medium" | "low")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target Date</Label>
              <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Baseline Data</Label>
              <Textarea
                placeholder="Enter current baseline data..."
                value={baselineData}
                onChange={(e) => setBaselineData(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Customizations (Optional)</Label>
              <Textarea
                placeholder="Any modifications to the standard goal..."
                value={customizations}
                onChange={(e) => setCustomizations(e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddGoal} className="flex-1 bg-[#0D9488] hover:bg-[#0F766E]">
                Add Goal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
