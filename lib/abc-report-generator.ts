// ABC Report Section Generator
// Generates clinical ABC observation sections for final ABA assessment reports

export interface ABCObservation {
  timestamp: string
  antecedent: string
  behavior: string
  consequence: string
  function_label: "Escape" | "Attention" | "Tangible" | "Automatic" | "Mixed" | "Undetermined"
  setting?: string
}

export interface ClientInfo {
  firstName: string
  lastName: string
  pronouns?: string
}

/**
 * Generates the "Behavioral Observations During Assessment (ABC)" section
 */
export function generateABCObservationsSection(observations: ABCObservation[], clientInfo: ClientInfo): string {
  if (!observations || observations.length === 0) {
    return "No significant behavioral episodes were directly observed during the assessment period."
  }

  const pronoun = getPronoun(clientInfo.pronouns)
  const possessive = getPossessivePronoun(clientInfo.pronouns)

  // Intro paragraph
  const intro = `During the assessment, Antecedent–Behavior–Consequence (ABC) data were collected for ${observations.length} behavioral episode${observations.length > 1 ? "s" : ""}. These episodes represent key, illustrative examples of ${clientInfo.firstName}'s behavioral patterns observed under specific environmental conditions and are not exhaustive of all behaviors that may occur across settings. The ABC analysis provides valuable insight into the environmental variables that may be influencing ${possessive} behavior.`

  // Generate numbered episodes
  const episodes = observations
    .map((obs, index) => {
      const functionText = getFunctionDescription(obs.function_label)
      const settingText = obs.setting ? ` during ${obs.setting}` : ""

      return `${index + 1}. Observation recorded on ${obs.timestamp}${settingText}.

   Antecedent: ${obs.antecedent}
   
   Behavior: ${obs.behavior}
   
   Consequence: ${obs.consequence}
   
   Impression of function: ${functionText}`
    })
    .join("\n\n")

  return `${intro}\n\n${episodes}`
}

/**
 * Generates the "Preliminary Functional Hypotheses" section
 */
export function generateFunctionalHypothesesSection(observations: ABCObservation[], clientInfo: ClientInfo): string {
  if (!observations || observations.length === 0) {
    return ""
  }

  const pronoun = getPronoun(clientInfo.pronouns)
  const possessive = getPossessivePronoun(clientInfo.pronouns)

  // Analyze patterns
  const functionCounts = countFunctions(observations)
  const primaryFunctions = getPrimaryFunctions(functionCounts)
  const commonAntecedents = identifyCommonAntecedents(observations)
  const commonConsequences = identifyCommonConsequences(observations)

  // Generate summary paragraph
  let summary = `Taken together, the ABC data collected during the assessment suggest that `

  if (primaryFunctions.length === 1) {
    summary += `${functionNameToPhrase(primaryFunctions[0])} is the primary function likely maintaining the target behaviors. `
  } else if (primaryFunctions.length === 2) {
    summary += `${functionNameToPhrase(primaryFunctions[0])} and ${functionNameToPhrase(primaryFunctions[1])} appear to be the primary functions maintaining the target behaviors. `
  } else {
    summary += `multiple functions may be maintaining ${possessive} behaviors, including ${primaryFunctions.map((f) => functionNameToPhrase(f)).join(", ")}. `
  }

  // Add pattern details
  if (commonAntecedents.length > 0) {
    summary += `Episodes were most frequently observed when ${commonAntecedents.join(" or ")}. `
  }

  if (commonConsequences.length > 0) {
    summary += `The behaviors were typically followed by ${commonConsequences.join(" or ")}. `
  }

  // Cautionary conclusion
  summary += `\n\nThese findings should be considered preliminary and interpreted within the broader context of caregiver report, assessment tool results, and developmental history. While the ABC data provide valuable insights into potential maintaining variables, confirmation of functional relationships may require additional systematic observation, functional analysis, or response to treatment data. The patterns identified here will inform initial treatment recommendations and be further refined through ongoing data collection during intervention.`

  return summary
}

/**
 * Helper: Count occurrences of each function label
 */
function countFunctions(observations: ABCObservation[]): Record<string, number> {
  const counts: Record<string, number> = {}
  observations.forEach((obs) => {
    counts[obs.function_label] = (counts[obs.function_label] || 0) + 1
  })
  return counts
}

/**
 * Helper: Get primary function(s) - those that appear most frequently
 */
function getPrimaryFunctions(functionCounts: Record<string, number>): string[] {
  const maxCount = Math.max(...Object.values(functionCounts))
  return Object.entries(functionCounts)
    .filter(([_, count]) => count === maxCount)
    .map(([func, _]) => func)
}

/**
 * Helper: Convert function label to descriptive phrase
 */
function functionNameToPhrase(functionLabel: string): string {
  const phrases: Record<string, string> = {
    Escape: "escape from demands or aversive stimuli",
    Attention: "access to social attention",
    Tangible: "access to preferred items or activities",
    Automatic: "automatic or sensory reinforcement",
    Mixed: "multiple reinforcement contingencies",
    Undetermined: "an unclear function",
  }
  return phrases[functionLabel] || functionLabel.toLowerCase()
}

/**
 * Helper: Get function description for individual episode
 */
function getFunctionDescription(functionLabel: string): string {
  const descriptions: Record<string, string> = {
    Escape: "The behavior in this episode appears to be maintained by escape from demands or non-preferred tasks.",
    Attention: "The behavior in this episode appears to be maintained by access to social attention.",
    Tangible: "The behavior in this episode appears to be maintained by access to preferred items or activities.",
    Automatic: "The behavior in this episode appears to be maintained by automatic/sensory reinforcement.",
    Mixed: "The behavior in this episode may be influenced by multiple functions.",
    Undetermined: "The function of the behavior in this episode remains unclear based on the current data.",
  }
  return descriptions[functionLabel] || descriptions["Undetermined"]
}

/**
 * Helper: Identify common antecedent patterns
 */
function identifyCommonAntecedents(observations: ABCObservation[]): string[] {
  const patterns: string[] = []
  const antecedents = observations.map((o) => o.antecedent.toLowerCase())

  // Simple pattern detection (can be enhanced)
  if (antecedents.some((a) => a.includes("demand") || a.includes("task") || a.includes("instruction"))) {
    patterns.push("task demands were presented")
  }
  if (antecedents.some((a) => a.includes("transition") || a.includes("change"))) {
    patterns.push("transitions occurred between activities")
  }
  if (antecedents.some((a) => a.includes("denied") || a.includes("removed") || a.includes("no"))) {
    patterns.push("access to preferred items or activities was restricted")
  }
  if (antecedents.some((a) => a.includes("alone") || a.includes("ignore") || a.includes("attention"))) {
    patterns.push("attention was diverted or unavailable")
  }

  return patterns
}

/**
 * Helper: Identify common consequence patterns
 */
function identifyCommonConsequences(observations: ABCObservation[]): string[] {
  const patterns: string[] = []
  const consequences = observations.map((o) => o.consequence.toLowerCase())

  // Simple pattern detection
  if (consequences.some((c) => c.includes("removed") || c.includes("stopped") || c.includes("terminated"))) {
    patterns.push("termination of the demand or activity")
  }
  if (consequences.some((c) => c.includes("attention") || c.includes("comfort") || c.includes("redirect"))) {
    patterns.push("provision of social attention")
  }
  if (consequences.some((c) => c.includes("access") || c.includes("given") || c.includes("provided"))) {
    patterns.push("access to preferred items or activities")
  }
  if (consequences.some((c) => c.includes("ignored") || c.includes("no response") || c.includes("continued"))) {
    patterns.push("continuation of the current activity without change")
  }

  return patterns
}

/**
 * Helper: Get subject pronoun based on client pronouns
 */
function getPronoun(pronouns?: string): string {
  if (!pronouns) return "they"
  const p = pronouns.toLowerCase()
  if (p.includes("he")) return "he"
  if (p.includes("she")) return "she"
  return "they"
}

/**
 * Helper: Get possessive pronoun
 */
function getPossessivePronoun(pronouns?: string): string {
  if (!pronouns) return "their"
  const p = pronouns.toLowerCase()
  if (p.includes("he")) return "his"
  if (p.includes("she")) return "her"
  return "their"
}
