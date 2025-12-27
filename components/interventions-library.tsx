"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  SearchIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ShieldIcon,
  TargetIcon,
  AlertTriangleIcon,
  DownloadIcon,
} from "@/components/icons"
import { useRAGSuggestions } from "@/hooks/useRAGSuggestions"
import { Sparkles, Loader2 } from "lucide-react"

interface Intervention {
  id: string
  title: string
  description: string
  evidenceLevel: "research-based" | "promising" | "emerging"
  category: "preventive" | "replacement" | "management" | "maladaptive"
}

const interventionsData: Record<string, Intervention[]> = {
  attention: [
    {
      id: "att-prev-1",
      title: "Attention Schedule",
      description:
        "Provide regular, predictable attention intervals (e.g., every 5 minutes) to reduce attention-seeking behaviors. Use timers as visual cues.",
      evidenceLevel: "research-based",
      category: "preventive",
    },
    {
      id: "att-prev-2",
      title: "Functional Communication Training (FCT) - Attention",
      description:
        "Teach appropriate ways to request attention (e.g., hand raising, tapping shoulder, saying 'excuse me').",
      evidenceLevel: "research-based",
      category: "replacement",
    },
    {
      id: "att-mgmt-1",
      title: "Planned Ignoring",
      description:
        "Withhold attention during inappropriate behavior while providing attention for appropriate behaviors. Must be combined with reinforcement of replacement skills.",
      evidenceLevel: "research-based",
      category: "management",
    },
    {
      id: "att-mal-1",
      title: "Response Cost for Attention-Seeking",
      description:
        "Remove earned tokens/privileges when engaging in attention-seeking problem behavior. Always pair with positive reinforcement for appropriate behavior.",
      evidenceLevel: "promising",
      category: "maladaptive",
    },
  ],
  escape: [
    {
      id: "esc-prev-1",
      title: "Task Modification",
      description:
        "Break tasks into smaller, manageable chunks. Provide choice in task order. Use visual schedules to increase predictability.",
      evidenceLevel: "research-based",
      category: "preventive",
    },
    {
      id: "esc-prev-2",
      title: "Scheduled Breaks",
      description:
        "Provide regular breaks before problem behavior occurs (e.g., 5 min work, 2 min break). Gradually increase work duration.",
      evidenceLevel: "research-based",
      category: "preventive",
    },
    {
      id: "esc-rep-1",
      title: "FCT - Escape/Break Request",
      description:
        "Teach appropriate ways to request breaks (e.g., break card, asking politely). Honor requests to build trust.",
      evidenceLevel: "research-based",
      category: "replacement",
    },
    {
      id: "esc-mgmt-1",
      title: "Escape Extinction",
      description:
        "Continue task presentation despite problem behavior. Provide assistance to ensure task completion. Use with caution and proper safety protocols.",
      evidenceLevel: "research-based",
      category: "management",
    },
    {
      id: "esc-mal-1",
      title: "Differential Reinforcement of Alternative Behavior (DRA)",
      description:
        "Reinforce compliance and task engagement while minimizing reinforcement for escape behavior. Must identify maintaining variables first.",
      evidenceLevel: "research-based",
      category: "maladaptive",
    },
  ],
  tangible: [
    {
      id: "tan-prev-1",
      title: "Non-Contingent Access",
      description:
        "Provide free access to preferred items/activities on a schedule to reduce motivation for problem behavior.",
      evidenceLevel: "research-based",
      category: "preventive",
    },
    {
      id: "tan-prev-2",
      title: "Choice-Making Opportunities",
      description:
        "Offer choices between 2-3 preferred items regularly. This increases perceived control and reduces frustration.",
      evidenceLevel: "research-based",
      category: "preventive",
    },
    {
      id: "tan-rep-1",
      title: "FCT - Item/Activity Request",
      description:
        "Teach appropriate requesting skills (e.g., using PECS, sign language, verbal requests). Provide immediate access when requested appropriately.",
      evidenceLevel: "research-based",
      category: "replacement",
    },
    {
      id: "tan-mgmt-1",
      title: "Tangible Extinction",
      description:
        "Withhold access to tangible items following problem behavior while providing access for appropriate requests. Monitor for extinction burst.",
      evidenceLevel: "research-based",
      category: "management",
    },
    {
      id: "tan-mal-1",
      title: "Response Blocking + Redirection",
      description:
        "Physically block access to tangible items during inappropriate behavior and redirect to appropriate requesting.",
      evidenceLevel: "promising",
      category: "maladaptive",
    },
  ],
  automatic: [
    {
      id: "auto-prev-1",
      title: "Environmental Enrichment",
      description:
        "Provide access to sensory-rich activities and varied materials to reduce motivation for automatically reinforced behavior.",
      evidenceLevel: "promising",
      category: "preventive",
    },
    {
      id: "auto-prev-2",
      title: "Matched Stimulation",
      description:
        "Provide alternative sources of the same sensory input (e.g., chewy toys for oral stimulation, fidgets for tactile).",
      evidenceLevel: "research-based",
      category: "preventive",
    },
    {
      id: "auto-rep-1",
      title: "Differential Reinforcement of Other Behavior (DRO)",
      description:
        "Reinforce absence of problem behavior for specified intervals. Gradually increase interval duration.",
      evidenceLevel: "research-based",
      category: "replacement",
    },
    {
      id: "auto-mgmt-1",
      title: "Response Interruption/Redirection (RIRD)",
      description:
        "Interrupt the behavior and redirect to a competing activity. Most effective for vocal/motor stereotypy.",
      evidenceLevel: "research-based",
      category: "management",
    },
    {
      id: "auto-mal-1",
      title: "Sensory Extinction",
      description:
        "Alter the environment to reduce sensory consequences of the behavior (e.g., protective equipment). Use as last resort with medical consultation.",
      evidenceLevel: "emerging",
      category: "maladaptive",
    },
  ],
}

export function InterventionsLibrary() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedInterventions, setSelectedInterventions] = useState<Set<string>>(new Set())
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

  // RAG Suggestions Hook
  const { suggestions, isLoading: ragLoading, getSuggestions } = useRAGSuggestions()

  const handleGetInterventionSuggestions = async () => {
    await getSuggestions("ABA therapy interventions FCT DRA NCR insurance approved evidence-based")
  }

  const toggleIntervention = (id: string) => {
    const newSelected = new Set(selectedInterventions)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedInterventions(newSelected)
  }

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryKey]: !prev[categoryKey],
    }))
  }

  const filterInterventions = (interventions: Intervention[]) => {
    if (!searchTerm) return interventions
    return interventions.filter(
      (i) =>
        i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "preventive":
        return <ShieldIcon className="h-4 w-4" />
      case "replacement":
        return <TargetIcon className="h-4 w-4" />
      case "management":
        return <CheckIcon className="h-4 w-4" />
      case "maladaptive":
        return <AlertTriangleIcon className="h-4 w-4" />
      default:
        return null
    }
  }

  const getEvidenceBadge = (level: string) => {
    const styles = {
      "research-based": "bg-green-100 text-green-800 border-green-200",
      promising: "bg-blue-100 text-blue-800 border-blue-200",
      emerging: "bg-yellow-100 text-yellow-800 border-yellow-200",
    }
    return (
      <Badge variant="outline" className={styles[level as keyof typeof styles]}>
        {level}
      </Badge>
    )
  }

  const renderInterventionsByCategory = (interventions: Intervention[]) => {
    const categories = {
      preventive: interventions.filter((i) => i.category === "preventive"),
      replacement: interventions.filter((i) => i.category === "replacement"),
      management: interventions.filter((i) => i.category === "management"),
      maladaptive: interventions.filter((i) => i.category === "maladaptive"),
    }

    return (
      <div className="space-y-3">
        {Object.entries(categories).map(([category, items]) => {
          if (items.length === 0) return null
          const categoryKey = `${category}`
          const isExpanded = expandedCategories[categoryKey] ?? true

          return (
            <div key={category} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(categoryKey)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  {getCategoryIcon(category)}
                  <span className="font-semibold text-sm capitalize">
                    {category === "maladaptive" ? "Maladaptive Behavior Strategies" : `${category} Strategies`}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {items.length}
                  </Badge>
                </div>
                {isExpanded ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
              </button>

              {isExpanded && (
                <div className="p-3 space-y-2 bg-white">
                  {items.map((intervention) => (
                    <div
                      key={intervention.id}
                      className={`p-4 border rounded-lg transition-all duration-300 ease-out hover:shadow-md cursor-pointer ${
                        selectedInterventions.has(intervention.id)
                          ? "border-[#0D9488] bg-[#0D9488]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => toggleIntervention(intervention.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <div
                            className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                              selectedInterventions.has(intervention.id)
                                ? "bg-[#0D9488] border-[#0D9488]"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedInterventions.has(intervention.id) && <CheckIcon className="h-3 w-3 text-white" />}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-medium text-sm text-gray-900">{intervention.title}</h4>
                            {getEvidenceBadge(intervention.evidenceLevel)}
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">{intervention.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Intervention Library</h1>
          <p className="text-sm text-gray-600 mb-4">
            Evidence-based interventions organized by behavioral function. Select interventions to add to your client's
            treatment plan.
          </p>

          {/* AI Suggestions Button */}
          <button
            type="button"
            onClick={handleGetInterventionSuggestions}
            disabled={ragLoading}
            className="mb-4 w-full flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all shadow-md"
          >
            {ragLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Get AI Intervention Suggestions
          </button>
          {suggestions.length > 0 && (
            <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded">
              <p className="text-sm font-medium text-purple-800 mb-2">AI Suggestions:</p>
              <p className="text-sm text-purple-700">{suggestions[0]?.text?.substring(0, 200)}...</p>
            </div>
          )}

          {/* Search Bar */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search interventions by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-5xl mx-auto p-6">
            <Tabs defaultValue="attention" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-white border border-gray-200">
                <TabsTrigger
                  value="attention"
                  className="data-[state=active]:bg-[#0D9488] data-[state=active]:text-white py-3"
                >
                  <div className="text-center">
                    <div className="font-semibold">Attention</div>
                    <div className="text-xs opacity-80">Function</div>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="escape"
                  className="data-[state=active]:bg-[#0D9488] data-[state=active]:text-white py-3"
                >
                  <div className="text-center">
                    <div className="font-semibold">Escape</div>
                    <div className="text-xs opacity-80">Function</div>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="tangible"
                  className="data-[state=active]:bg-[#0D9488] data-[state=active]:text-white py-3"
                >
                  <div className="text-center">
                    <div className="font-semibold">Tangible</div>
                    <div className="text-xs opacity-80">Function</div>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="automatic"
                  className="data-[state=active]:bg-[#0D9488] data-[state=active]:text-white py-3"
                >
                  <div className="text-center">
                    <div className="font-semibold">Automatic</div>
                    <div className="text-xs opacity-80">Reinforcement</div>
                  </div>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="attention" className="space-y-4">
                {renderInterventionsByCategory(filterInterventions(interventionsData.attention))}
              </TabsContent>

              <TabsContent value="escape" className="space-y-4">
                {renderInterventionsByCategory(filterInterventions(interventionsData.escape))}
              </TabsContent>

              <TabsContent value="tangible" className="space-y-4">
                {renderInterventionsByCategory(filterInterventions(interventionsData.tangible))}
              </TabsContent>

              <TabsContent value="automatic" className="space-y-4">
                {renderInterventionsByCategory(filterInterventions(interventionsData.automatic))}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </div>

      {/* Footer Actions */}
      {selectedInterventions.size > 0 && (
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-[#0D9488]">{selectedInterventions.size}</span> intervention
              {selectedInterventions.size !== 1 && "s"} selected
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedInterventions(new Set())}>
                Clear Selection
              </Button>
              <Button className="bg-[#0D9488] hover:bg-[#0F766E] text-white">
                <DownloadIcon className="h-4 w-4 mr-2" />
                Add to Plan ({selectedInterventions.size})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
