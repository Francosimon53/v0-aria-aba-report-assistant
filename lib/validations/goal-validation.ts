export interface SMARTGoal {
  behavior: string
  condition: string
  criterion: string
  timeline: string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export function validateSMARTGoal(goal: SMARTGoal): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Specific - behavior must be descriptive
  if (!goal.behavior || goal.behavior.trim().length < 10) {
    errors.push("Behavior must be specific and at least 10 characters")
  }

  // Measurable - criterion must have numbers
  if (!goal.criterion || goal.criterion.trim() === "") {
    errors.push("Criterion is required for measurability")
  } else if (!/\d+/.test(goal.criterion)) {
    errors.push("Criterion must include measurable numbers (percentage, frequency, or count)")
  }

  // Achievable - check for realistic percentages
  const percentMatch = goal.criterion?.match(/(\d+)%/)
  if (percentMatch) {
    const percent = Number.parseInt(percentMatch[1])
    if (percent > 100) {
      errors.push("Percentage cannot exceed 100%")
    }
    if (percent === 100) {
      warnings.push("100% criterion may be unrealistic - consider 80-90%")
    }
  }

  // Relevant - condition should provide context
  if (!goal.condition || goal.condition.trim().length < 5) {
    errors.push("Condition must describe when/where the behavior occurs")
  }

  // Time-bound - timeline required
  if (!goal.timeline || goal.timeline.trim() === "") {
    errors.push("Timeline is required")
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

export function validateCPTCode(code: string): boolean {
  const validCodes = ["97151", "97152", "97153", "97154", "97155", "97156", "97157", "97158"]
  return validCodes.includes(code)
}

export function calculateRecommendedHours(
  severity: "mild" | "moderate" | "severe",
  age: number,
): { min: number; max: number } {
  const baseHours = {
    mild: { min: 10, max: 15 },
    moderate: { min: 15, max: 25 },
    severe: { min: 25, max: 40 },
  }

  let hours = baseHours[severity]

  // Adjust for age (younger children may need more hours)
  if (age < 5) {
    hours = { min: hours.min + 5, max: Math.min(hours.max + 10, 40) }
  }

  return hours
}
