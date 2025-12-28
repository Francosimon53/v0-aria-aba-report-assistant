"use client"

import { useState } from "react"
import {
  Sparkles,
  Plus,
  Check,
  RefreshCw,
  Target,
  MessageSquare,
  Users,
  Brain,
  Activity,
  Zap,
  Loader2,
  ChevronDown,
  ChevronUp,
  Edit3,
  Trash2,
  Lightbulb,
  CheckCircle2,
  X,
} from "lucide-react"

// ============== TYPES ==============
interface Goal {
  id: string
  domain: string
  shortTerm: string
  longTerm: string
  baseline: string
  target: string
  timeline: string
  priority: "high" | "medium" | "low"
  isCustom?: boolean
}

interface DomainData {
  level: "none" | "mild" | "moderate" | "severe"
  description: string
}

interface AssessmentContext {
  diagnosis: string
  age: number
  domains: Record<string, DomainData>
}

// ============== DOMAIN CONFIG ==============
const DOMAINS = [
  {
    id: "communication",
    label: "Communication",
    icon: MessageSquare,
    color: "blue",
    gradient: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50",
    textColor: "text-blue-700",
    examples: ["Requesting", "Labeling", "Conversation skills"],
  },
  {
    id: "social",
    label: "Social Skills",
    icon: Users,
    color: "purple",
    gradient: "from-purple-500 to-purple-600",
    bgLight: "bg-purple-50",
    textColor: "text-purple-700",
    examples: ["Joint attention", "Turn-taking", "Peer play"],
  },
  {
    id: "adaptive",
    label: "Daily Living",
    icon: Activity,
    color: "green",
    gradient: "from-green-500 to-green-600",
    bgLight: "bg-green-50",
    textColor: "text-green-700",
    examples: ["Self-care", "Safety", "Independence"],
  },
  {
    id: "behavior",
    label: "Behavior",
    icon: Zap,
    color: "red",
    gradient: "from-red-500 to-red-600",
    bgLight: "bg-red-50",
    textColor: "text-red-700",
    examples: ["Reduce tantrums", "Compliance", "Waiting"],
  },
  {
    id: "cognitive",
    label: "Academic",
    icon: Brain,
    color: "amber",
    gradient: "from-amber-500 to-amber-600",
    bgLight: "bg-amber-50",
    textColor: "text-amber-700",
    examples: ["Matching", "Sorting", "Pre-academics"],
  },
]

// ============== COMPONENT ==============
export function GoalSuggester({
  assessmentContext,
  selectedGoals,
  onGoalsChange,
}: {
  assessmentContext: AssessmentContext
  selectedGoals: Goal[]
  onGoalsChange: (goals: Goal[]) => void
}) {
  const [activeDomain, setActiveDomain] = useState<string | null>(null)
  const [suggestedGoals, setSuggestedGoals] = useState<Goal[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateGoals = async (domainId: string) => {
    setIsGenerating(true)
    setActiveDomain(domainId)
    setSuggestedGoals([])
    setError(null)

    try {
      const domain = DOMAINS.find((d) => d.id === domainId)
      const domainData = assessmentContext.domains?.[domainId]

      const prompt = `Generate exactly 4 SMART ABA therapy goals for ${domain?.label || domainId}.

CLIENT:
- Age: ${assessmentContext.age || 7} years
- Diagnosis: ${assessmentContext.diagnosis || "Autism Spectrum Disorder"}
- ${domain?.label} Level: ${domainData?.level || "moderate"} deficit
- Notes: ${domainData?.description || "Requires intervention"}

For each goal provide:
- shortTerm: Specific 1-3 month objective (start with "Client will...")
- longTerm: 6-month goal 
- baseline: Current level (specific %, frequency, or "0/10 trials")
- target: Target level (specific %, frequency, or "8/10 trials")
- timeline: "1 month", "2 months", or "3 months"
- priority: "high", "medium", or "low"

Return ONLY valid JSON array:
[{"shortTerm":"...","longTerm":"...","baseline":"...","target":"...","timeline":"...","priority":"..."}]`

      // Use our internal API route
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          currentStep: 7,
          clientDiagnosis: assessmentContext.diagnosis,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      const text = data.content || "[]"

      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        const goals: Goal[] = parsed.map((g: any) => ({
          ...g,
          id: crypto.randomUUID(),
          domain: domainId,
          priority: g.priority || "medium",
        }))
        setSuggestedGoals(goals)
      } else {
        setError("Could not parse goals from AI response. Please try again.")
      }
    } catch (err) {
      console.error("Goal generation error:", err)
      setError("Failed to generate goals. Please check your connection and try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const addGoal = (goal: Goal) => {
    if (!selectedGoals.find((g) => g.id === goal.id)) {
      onGoalsChange([...selectedGoals, goal])
    }
  }

  const removeGoal = (goalId: string) => {
    onGoalsChange(selectedGoals.filter((g) => g.id !== goalId))
  }

  const saveEditedGoal = () => {
    if (!editingGoal) return

    if (selectedGoals.find((g) => g.id === editingGoal.id)) {
      onGoalsChange(selectedGoals.map((g) => (g.id === editingGoal.id ? editingGoal : g)))
    } else {
      onGoalsChange([...selectedGoals, editingGoal])
    }
    setEditingGoal(null)
  }

  const createCustomGoal = (domainId: string) => {
    setEditingGoal({
      id: crypto.randomUUID(),
      domain: domainId,
      shortTerm: "",
      longTerm: "",
      baseline: "",
      target: "",
      timeline: "3 months",
      priority: "medium",
      isCustom: true,
    })
  }

  const isGoalSelected = (goalId: string) => selectedGoals.some((g) => g.id === goalId)
  const getGoalCountForDomain = (domainId: string) => selectedGoals.filter((g) => g.domain === domainId).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            AI Goal Suggester
          </h2>
          <p className="text-gray-500 mt-1">Generate evidence-based SMART goals by domain</p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-xl">
          <CheckCircle2 className="h-5 w-5 text-teal-600" />
          <span className="font-semibold text-teal-600">{selectedGoals.length}</span>
          <span className="text-sm text-gray-600">goals selected</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <X className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Domain Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DOMAINS.map((domain) => {
          const Icon = domain.icon
          const goalCount = getGoalCountForDomain(domain.id)
          const isActive = activeDomain === domain.id
          const domainData = assessmentContext.domains?.[domain.id]

          return (
            <div
              key={domain.id}
              className={`relative bg-white rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                isActive ? "border-teal-500 shadow-lg" : "border-gray-200 hover:border-gray-300 hover:shadow-md"
              }`}
            >
              {/* Card Header */}
              <div className={`p-4 bg-gradient-to-r ${domain.gradient} text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{domain.label}</h3>
                      <p className="text-xs text-white/70 capitalize">{domainData?.level || "Not assessed"} deficit</p>
                    </div>
                  </div>

                  {goalCount > 0 && (
                    <div className="h-7 w-7 bg-white rounded-full flex items-center justify-center">
                      <span className={`text-sm font-bold ${domain.textColor}`}>{goalCount}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4">
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {domain.examples.map((ex, i) => (
                    <span key={i} className={`px-2 py-0.5 ${domain.bgLight} ${domain.textColor} text-xs rounded-full`}>
                      {ex}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => generateGoals(domain.id)}
                  disabled={isGenerating && isActive}
                  className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                    isActive && isGenerating
                      ? "bg-gray-100 text-gray-400"
                      : `bg-gradient-to-r ${domain.gradient} text-white hover:opacity-90 shadow-md hover:shadow-lg`
                  }`}
                >
                  {isActive && isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Suggest Goals
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Suggested Goals */}
      {suggestedGoals.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-yellow-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Lightbulb className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Suggested {DOMAINS.find((d) => d.id === activeDomain)?.label} Goals
                </h3>
                <p className="text-xs text-gray-500">Click + to add, or customize before adding</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => activeDomain && generateGoals(activeDomain)}
                disabled={isGenerating}
                className="p-2 hover:bg-white/80 rounded-lg text-gray-600 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={() => activeDomain && createCustomGoal(activeDomain)}
                className="px-3 py-1.5 text-sm font-medium text-teal-600 hover:bg-teal-50 rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Custom Goal
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {suggestedGoals.map((goal) => {
              const selected = isGoalSelected(goal.id)
              const expanded = expandedGoal === goal.id
              const domain = DOMAINS.find((d) => d.id === goal.domain)

              return (
                <div key={goal.id} className={`transition-colors ${selected ? "bg-teal-50/50" : "hover:bg-gray-50"}`}>
                  <div className="p-4 flex items-start gap-4">
                    {/* Priority Indicator */}
                    <div
                      className={`mt-1 w-1.5 h-12 rounded-full flex-shrink-0 ${
                        goal.priority === "high"
                          ? "bg-red-400"
                          : goal.priority === "medium"
                            ? "bg-amber-400"
                            : "bg-green-400"
                      }`}
                    />

                    {/* Goal Content */}
                    <div className="flex-1 cursor-pointer" onClick={() => setExpandedGoal(expanded ? null : goal.id)}>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${domain?.bgLight} ${domain?.textColor}`}
                        >
                          {goal.timeline}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full capitalize ${
                            goal.priority === "high"
                              ? "bg-red-100 text-red-700"
                              : goal.priority === "medium"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {goal.priority} priority
                        </span>
                        {expanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-900 font-medium leading-snug">{goal.shortTerm}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setEditingGoal(goal)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                        title="Edit goal"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => (selected ? removeGoal(goal.id) : addGoal(goal))}
                        className={`p-2.5 rounded-xl transition-all ${
                          selected ? "bg-teal-600 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {selected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expanded && (
                    <div className="px-4 pb-4 ml-5 border-l-2 border-gray-200">
                      <div className="pl-4 space-y-3">
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Long-term Goal
                          </span>
                          <p className="text-sm text-gray-700 mt-1">{goal.longTerm}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-gray-50 rounded-xl">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              Baseline
                            </span>
                            <p className="text-lg font-bold text-gray-900 mt-1">{goal.baseline}</p>
                          </div>
                          <div className="p-3 bg-teal-50 rounded-xl">
                            <span className="text-xs font-semibold text-teal-600 uppercase tracking-wide">Target</span>
                            <p className="text-lg font-bold text-teal-600 mt-1">{goal.target}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Selected Goals Summary */}
      {selectedGoals.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-cyan-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Selected Goals ({selectedGoals.length})</h3>
                  <p className="text-xs text-gray-500">These will be included in the treatment plan</p>
                </div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
            {selectedGoals.map((goal, index) => {
              const domain = DOMAINS.find((d) => d.id === goal.domain)
              const Icon = domain?.icon || Target

              return (
                <div key={goal.id} className="p-3 flex items-center gap-3 hover:bg-gray-50">
                  <span className="text-xs font-bold text-gray-400 w-5">{index + 1}</span>
                  <div className={`p-1.5 rounded-lg ${domain?.bgLight || "bg-gray-100"}`}>
                    <Icon className={`h-4 w-4 ${domain?.textColor || "text-gray-500"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{goal.shortTerm}</p>
                  </div>
                  <button
                    onClick={() => removeGoal(goal.id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Edit Goal Modal */}
      {editingGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <h3 className="font-semibold text-gray-900">
                {editingGoal.isCustom ? "Create Custom Goal" : "Edit Goal"}
              </h3>
              <button
                onClick={() => setEditingGoal(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Short-term Objective <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={editingGoal.shortTerm}
                  onChange={(e) => setEditingGoal({ ...editingGoal, shortTerm: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  placeholder="Client will..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Long-term Goal <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={editingGoal.longTerm}
                  onChange={(e) => setEditingGoal({ ...editingGoal, longTerm: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  placeholder="By the end of the authorization period..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Baseline</label>
                  <input
                    type="text"
                    value={editingGoal.baseline}
                    onChange={(e) => setEditingGoal({ ...editingGoal, baseline: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g., 2/10 trials"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Target</label>
                  <input
                    type="text"
                    value={editingGoal.target}
                    onChange={(e) => setEditingGoal({ ...editingGoal, target: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g., 8/10 trials"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Timeline</label>
                  <select
                    value={editingGoal.timeline}
                    onChange={(e) => setEditingGoal({ ...editingGoal, timeline: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="1 month">1 month</option>
                    <option value="2 months">2 months</option>
                    <option value="3 months">3 months</option>
                    <option value="6 months">6 months</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                  <select
                    value={editingGoal.priority}
                    onChange={(e) => setEditingGoal({ ...editingGoal, priority: e.target.value as Goal["priority"] })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setEditingGoal(null)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEditedGoal}
                disabled={!editingGoal.shortTerm || !editingGoal.longTerm}
                className="px-5 py-2.5 text-sm font-semibold bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 shadow-md"
              >
                {editingGoal.isCustom ? "Add Goal" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
