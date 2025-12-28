"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useToast } from "@/components/ui/use-toast"
import {
  TargetIcon,
  SearchIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CheckCircle2Icon,
} from "@/components/icons"
import { goalBank, domains } from "@/lib/data/goal-bank"
import type { SelectedGoal } from "@/lib/types"
import { ImportDialog } from "./import-dialog"
import { parseGoalsFile } from "@/lib/import-parsers"
import { NoGoalsEmptyState, SearchNoResults } from "@/components/empty-states"

interface GoalBankBrowserProps {
  selectedGoals: SelectedGoal[]
  onGoalSelect: (goalId: string) => void
  onUpdateGoal: (goalId: string, updates: Partial<SelectedGoal>) => void
  onNext: () => void
  onBack: () => void
}

export function GoalBankBrowser({ selectedGoals, onGoalSelect, onUpdateGoal, onNext, onBack }: GoalBankBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDomain, setSelectedDomain] = useState<string>("all")
  const [expandedDomains, setExpandedDomains] = useState<string[]>(domains)
  const { toast } = useToast() // Moved useToast hook to the top level

  const filteredGoals = useMemo(() => {
    return goalBank.filter((goal) => {
      const matchesSearch =
        searchQuery === "" ||
        goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDomain = selectedDomain === "all" || goal.domain === selectedDomain
      return matchesSearch && matchesDomain
    })
  }, [searchQuery, selectedDomain])

  const goalsByDomain = useMemo(() => {
    const grouped: Record<string, typeof goalBank> = {}
    filteredGoals.forEach((goal) => {
      if (!grouped[goal.domain]) {
        grouped[goal.domain] = []
      }
      grouped[goal.domain].push(goal)
    })
    return grouped
  }, [filteredGoals])

  const toggleDomain = (domain: string) => {
    setExpandedDomains((prev) => (prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]))
  }

  const isSelected = (goalId: string) => selectedGoals.some((g) => g.goalId === goalId)

  const handleImportGoals = (importedGoals: any[]) => {
    importedGoals.forEach((importedGoal) => {
      // Find matching goal in goal bank by domain and similar description
      const matchingGoal = goalBank.find(
        (g) =>
          g.domain.toLowerCase() === importedGoal.domain?.toLowerCase() &&
          g.description.toLowerCase().includes(importedGoal.goal?.toLowerCase()),
      )

      if (matchingGoal && !selectedGoals.find((sg) => sg.goalId === matchingGoal.id)) {
        onGoalSelect(matchingGoal.id)
        // Update with imported data
        if (importedGoal.baseline || importedGoal.target) {
          onUpdateGoal(matchingGoal.id, {
            baselineData: importedGoal.baseline || "",
            customizations: importedGoal.target || "",
          })
        }
      }
    })

    toast({
      title: "Success",
      description: `Imported ${importedGoals.length} goals. Please review and adjust as needed.`,
    })
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <TargetIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Goal Bank</h2>
            <p className="text-sm text-muted-foreground">Select treatment goals for the client</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ImportDialog
            title="Import Treatment Goals"
            description="Import goals from previous treatment plans or IEPs. The system will match imported goals to the standardized goal bank. Supported formats: JSON, CSV"
            acceptedFormats={[".json", ".csv"]}
            onImport={handleImportGoals}
            parseFunction={parseGoalsFile}
          />
          <Badge variant="secondary" className="text-sm">
            {selectedGoals.length} goals selected
          </Badge>
          <Button variant="outline" onClick={onBack}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={onNext} disabled={selectedGoals.length === 0}>
            Continue
            <ArrowRightIcon className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Goal Browser */}
        <div className="flex-1 flex flex-col border-r border-border overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-border bg-muted/30 space-y-3">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search goals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All domains" />
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

          {/* Goals List */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                {filteredGoals.length === 0 ? (
                  <SearchNoResults
                    searchQuery={searchQuery}
                    onClearSearch={() => {
                      setSearchQuery("")
                      setSelectedDomain("all")
                    }}
                  />
                ) : (
                  Object.entries(goalsByDomain).map(([domain, goals]) => (
                    <Collapsible
                      key={domain}
                      open={expandedDomains.includes(domain)}
                      onOpenChange={() => toggleDomain(domain)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between h-auto py-3 px-4">
                          <div className="flex items-center gap-2">
                            {expandedDomains.includes(domain) ? (
                              <ChevronDownIcon className="h-4 w-4" />
                            ) : (
                              <ChevronRightIcon className="h-4 w-4" />
                            )}
                            <span className="font-semibold">{domain}</span>
                          </div>
                          <Badge variant="secondary">{goals.length} goals</Badge>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2 pl-6 pr-2 pb-2">
                        {goals.map((goal) => {
                          const selected = isSelected(goal.id)
                          return (
                            <Card
                              key={goal.id}
                              className={`cursor-pointer transition-all ${
                                selected ? "border-primary bg-primary/5" : "hover:border-primary/50"
                              }`}
                              onClick={() => onGoalSelect(goal.id)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <Checkbox
                                    checked={selected}
                                    className="mt-1"
                                    onCheckedChange={() => onGoalSelect(goal.id)}
                                  />
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-medium text-sm">{goal.title}</h4>
                                      <Badge variant="outline" className="text-xs">
                                        {goal.subdomain}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                                    <div className="flex gap-2 mt-2">
                                      <Badge variant="secondary" className="text-xs">
                                        {goal.criteria}
                                      </Badge>
                                      <Badge variant="secondary" className="text-xs">
                                        {goal.ageRange}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Selected Goals Panel */}
        <div className="w-96 flex flex-col bg-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold flex items-center gap-2">
              <CheckCircle2Icon className="h-5 w-5 text-primary" />
              Selected Goals ({selectedGoals.length})
            </h3>
          </div>
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4">
                {selectedGoals.length === 0 ? (
                  <NoGoalsEmptyState />
                ) : (
                  <div className="space-y-4">
                    {selectedGoals.map((selected) => {
                      const goal = goalBank.find((g) => g.id === selected.goalId)
                      if (!goal) return null
                      return (
                        <Card key={selected.goalId}>
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-sm">{goal.title}</CardTitle>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => onGoalSelect(goal.id)}
                              >
                                Remove
                              </Button>
                            </div>
                            <CardDescription className="text-xs">
                              {goal.domain} - {goal.subdomain}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Priority</Label>
                              <Select
                                value={selected.priority}
                                onValueChange={(value) =>
                                  onUpdateGoal(selected.goalId, {
                                    priority: value as "high" | "medium" | "low",
                                  })
                                }
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="high">High Priority</SelectItem>
                                  <SelectItem value="medium">Medium Priority</SelectItem>
                                  <SelectItem value="low">Low Priority</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Target Date</Label>
                              <Input
                                type="date"
                                className="h-8 text-xs"
                                value={selected.targetDate}
                                onChange={(e) =>
                                  onUpdateGoal(selected.goalId, {
                                    targetDate: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Baseline Data</Label>
                              <Textarea
                                className="text-xs min-h-[60px]"
                                placeholder="Enter baseline data..."
                                value={selected.baselineData}
                                onChange={(e) =>
                                  onUpdateGoal(selected.goalId, {
                                    baselineData: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
}
