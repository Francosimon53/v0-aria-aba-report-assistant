import { safeGetItem } from "./safe-storage"

export interface AssessmentInsights {
  abcSummary: {
    totalObservations: number
    primaryFunctions: string[]
    behaviorDescriptions: string[]
    severityTags: string[]
  }
  domainsSummary: {
    severeDomains: string[]
    moderateDomains: string[]
    functionalLimitations: string[]
    settingsImpact: string[]
  }
  riskSummary: {
    riskLevel: string
    primaryConcerns: string[]
    supervisionRequired: string
  }
  goalsSummary: {
    communicationGoals: number
    socialGoals: number
    adaptiveGoals: number
    behaviorReductionGoals: number
    familyTrainingGoals: number
  }
  servicePlanSummary: {
    rbtHours: number
    bcbaHours: number
    familyHours: number
    totalWeeklyHours: number
    intensity: string
  }
}

export function aggregateAssessmentData(): AssessmentInsights {
  const abcData = safeGetItem("assessment_abc", { observations: [] })
  const domainsData = safeGetItem("assessment_evaluation", { domains: [] })
  const riskData = safeGetItem("assessment_risk", {})
  const goalsData = safeGetItem("assessment_goals", { goals: [] })
  const servicePlanData = safeGetItem("assessment_service_plan", {})

  // ABC Summary
  const observations = abcData.observations || []
  const functions = observations.map((o: any) => o.function).filter(Boolean)
  const functionCounts = functions.reduce((acc: any, f: string) => {
    acc[f] = (acc[f] || 0) + 1
    return acc
  }, {})
  const primaryFunctions = Object.entries(functionCounts)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 2)
    .map((e: any) => e[0])

  // Domains Summary
  const domains = domainsData.domains || []
  const severeDomains = domains.filter((d: any) => d.severity === "severe").map((d: any) => d.name)
  const moderateDomains = domains.filter((d: any) => d.severity === "moderate").map((d: any) => d.name)

  // Risk Summary
  const riskLevel = riskData.overallRisk || "Not assessed"
  const concerns = []
  if (riskData.elopement) concerns.push("Elopement")
  if (riskData.aggression) concerns.push("Aggression")
  if (riskData.selfInjury) concerns.push("Self-injury")
  if (riskData.propertyDestruction) concerns.push("Property destruction")

  // Goals Summary
  const goals = goalsData.goals || []
  const goalsByCategory = {
    communication: goals.filter((g: any) => g.domain === "Communication").length,
    social: goals.filter((g: any) => g.domain === "Social").length,
    adaptive: goals.filter((g: any) => g.domain === "Adaptive" || g.domain === "Daily Living").length,
    behaviorReduction: goals.filter((g: any) => g.domain === "Behavior Reduction").length,
    familyTraining: goals.filter((g: any) => g.domain === "Family Training").length,
  }

  // Service Plan Summary
  const rbtHours = servicePlanData.rbtHours || 0
  const bcbaHours = servicePlanData.bcbaHours || 0
  const familyHours = servicePlanData.familyHours || 0
  const totalWeeklyHours = rbtHours + bcbaHours + familyHours

  let intensity = "Not specified"
  if (totalWeeklyHours >= 25) intensity = "Intensive"
  else if (totalWeeklyHours >= 15) intensity = "Moderate"
  else if (totalWeeklyHours > 0) intensity = "Focused"

  return {
    abcSummary: {
      totalObservations: observations.length,
      primaryFunctions,
      behaviorDescriptions: observations
        .slice(0, 3)
        .map((o: any) => o.behavior)
        .filter(Boolean),
      severityTags: observations.map((o: any) => o.severity).filter(Boolean),
    },
    domainsSummary: {
      severeDomains,
      moderateDomains,
      functionalLimitations: domains
        .slice(0, 3)
        .map((d: any) => d.limitations)
        .filter(Boolean),
      settingsImpact: domains
        .slice(0, 3)
        .map((d: any) => d.settingsImpact)
        .filter(Boolean),
    },
    riskSummary: {
      riskLevel,
      primaryConcerns: concerns,
      supervisionRequired: riskData.supervisionLevel || "Not specified",
    },
    goalsSummary: goalsByCategory,
    servicePlanSummary: {
      rbtHours,
      bcbaHours,
      familyHours,
      totalWeeklyHours,
      intensity,
    },
  }
}
