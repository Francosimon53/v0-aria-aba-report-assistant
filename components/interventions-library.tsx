"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  SearchIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ShieldIcon,
  TargetIcon,
  AlertTriangleIcon,
  DownloadIcon,
  Sparkles,
  Loader2,
  X,
} from "@/components/icons"

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
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("attention")
  const { toast } = useToast()

  const handleAISuggest = async () => {
    setIsSuggesting(true)

    try {
      let abcData = null
      let riskData = null

      // 1. Leer ABC Observations desde la key correcta
      try {
        const abcRaw = localStorage.getItem("aria-assessment-abc-observations")
        console.log("[v0] Raw ABC data:", abcRaw)

        if (abcRaw) {
          const parsed = JSON.parse(abcRaw)
          const observations = parsed.data || []

          if (Array.isArray(observations) && observations.length > 0) {
            // Extraer funciones de las observaciones
            const functions = observations.map((obs: any) => obs.function || obs.impressionOfFunction).filter(Boolean)

            // Contar frecuencia
            const functionCounts: Record<string, number> = {}
            functions.forEach((f: string) => {
              functionCounts[f] = (functionCounts[f] || 0) + 1
            })

            // Función más común
            const sortedFunctions = Object.entries(functionCounts).sort((a, b) => b[1] - a[1])

            const primaryFunction = sortedFunctions[0]?.[0] || null
            const secondaryFunction = sortedFunctions[1]?.[0] || null

            abcData = {
              primaryFunction,
              secondaryFunction,
              observationCount: observations.length,
              functionCounts,
            }

            console.log("[v0] Parsed ABC Data:", abcData)
          }
        }
      } catch (e) {
        console.warn("Could not parse ABC observations:", e)
      }

      // 2. Leer Risk Assessment
      try {
        const riskRaw = localStorage.getItem("aria-assessment-risk-assessment")
        if (riskRaw) {
          const parsed = JSON.parse(riskRaw)
          riskData = {
            riskLevel: parsed.data?.riskLevel || parsed.data?.crisisPlan?.riskProfile?.level,
            riskFactors: parsed.data?.selectedRiskFactors || [],
            preventionStrategies: parsed.data?.crisisPlan?.preventionStrategies || [],
          }
          console.log("[v0] Parsed Risk Data:", riskData)
        }
      } catch (e) {
        console.warn("Could not parse risk assessment:", e)
      }

      // 3. Mostrar mensaje si no hay función identificada
      if (!abcData?.primaryFunction) {
        toast({
          title: "No Function Identified",
          description: "Go to ABC Observations, add data, and use 'AI Analyze' to identify the behavioral function.",
        })
      } else {
        toast({
          title: "Data Found!",
          description: `Primary function: ${abcData.primaryFunction} (${abcData.observationCount} observations)`,
        })
      }

      // 4. Llamar a la API
      const response = await fetch("/api/suggest-interventions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          abcData: abcData || {},
          riskData: riskData || {},
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Suggestion failed")
      }

      setAiSuggestions(data)

      // Auto-select the recommended function tab
      if (data.primaryFunctionTab) {
        setActiveTab(data.primaryFunctionTab.toLowerCase())
      }

      // Auto-check recommended interventions
      if (data.recommendations) {
        autoSelectInterventions(data.recommendations)
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Suggestion Failed",
        description: error instanceof Error ? error.message : "Could not suggest interventions",
        variant: "destructive",
      })
    } finally {
      setIsSuggesting(false)
    }
  }

  const autoSelectInterventions = (recommendations: any) => {
    const allRecommendedNames: string[] = []

    Object.values(recommendations).forEach((category: any) => {
      category.forEach((item: any) => {
        allRecommendedNames.push(item.name)
      })
    })

    const newSelected = new Set(selectedInterventions)
    Object.values(interventionsData)
      .flat()
      .forEach((intervention) => {
        if (allRecommendedNames.includes(intervention.title)) {
          newSelected.add(intervention.id)
        }
      })

    setSelectedInterventions(newSelected)
  }

  const isRecommendedByAI = (interventionTitle: string) => {
    if (!aiSuggestions?.recommendations) return false

    const allRecommended = Object.values(aiSuggestions.recommendations)
      .flat()
      .map((r: any) => r.name.toLowerCase())

    return allRecommended.includes(interventionTitle.toLowerCase())
  }

  const getAIRationale = (interventionTitle: string) => {
    if (!aiSuggestions?.recommendations) return null

    for (const category of Object.values(aiSuggestions.recommendations)) {
      const found = (category as any[]).find((r: any) => r.name.toLowerCase() === interventionTitle.toLowerCase())
      if (found) return { rationale: found.rationale, priority: found.priority }
    }
    return null
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
                  {items.map((intervention) => {
                    const aiData = getAIRationale(intervention.title)
                    const isAIRecommended = isRecommendedByAI(intervention.title)

                    return (
                      <div
                        key={intervention.id}
                        className={`p-4 border rounded-lg transition-all duration-300 ease-out hover:shadow-md cursor-pointer ${
                          selectedInterventions.has(intervention.id)
                            ? "border-[#0D9488] bg-[#0D9488]/5"
                            : isAIRecommended
                              ? "border-teal-300 bg-teal-50"
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
                              {selectedInterventions.has(intervention.id) && (
                                <CheckIcon className="h-3 w-3 text-white" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-medium text-sm text-gray-900">{intervention.title}</h4>
                                {isAIRecommended && (
                                  <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs rounded-full flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" />
                                    AI Recommended
                                    {aiData?.priority === "high" && (
                                      <span className="ml-1 text-xs font-semibold">★</span>
                                    )}
                                  </span>
                                )}
                              </div>
                              {getEvidenceBadge(intervention.evidenceLevel)}
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">{intervention.description}</p>
                            {aiData && (
                              <div className="mt-2 pt-2 border-t border-teal-200">
                                <p className="text-xs text-teal-700 italic flex items-start gap-1">
                                  <span className="font-semibold">AI Insight:</span>
                                  {aiData.rationale}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
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
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Intervention Library</h1>
              <p className="text-sm text-gray-600">
                Evidence-based interventions organized by behavioral function. Select interventions to add to your
                client's treatment plan.
              </p>
            </div>
            <Button
              onClick={handleAISuggest}
              disabled={isSuggesting}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white gap-2"
            >
              {isSuggesting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing Assessment Data...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  AI Suggest Interventions
                </>
              )}
            </Button>
          </div>

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

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-5xl mx-auto p-6">
            {aiSuggestions && (
              <div className="mb-6 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-teal-900 mb-1">
                      AI Recommendation: {aiSuggestions.primaryFunctionTab} Function Interventions
                    </h4>
                    <p className="text-sm text-teal-700 mb-2">{aiSuggestions.reasoning}</p>

                    {aiSuggestions.implementationNotes && (
                      <div className="bg-white/60 rounded-lg p-3 mt-3">
                        <p className="text-xs text-teal-600">
                          <strong>Implementation Notes:</strong> {aiSuggestions.implementationNotes}
                        </p>
                      </div>
                    )}

                    {aiSuggestions.cautionNotes && aiSuggestions.cautionNotes.trim() !== "" && (
                      <div className="bg-amber-50 rounded-lg p-3 mt-2 border border-amber-200">
                        <p className="text-xs text-amber-700 flex items-start gap-1">
                          <AlertTriangleIcon className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>
                            <strong>Caution:</strong> {aiSuggestions.cautionNotes}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAiSuggestions(null)}
                    className="text-teal-600 flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
