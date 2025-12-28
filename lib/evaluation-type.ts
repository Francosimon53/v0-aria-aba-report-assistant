/**
 * Evaluation Type Utilities
 *
 * SINGLE SOURCE OF TRUTH: Use DB format everywhere
 * - "Initial Assessment" (DB format, UI format, internal format)
 * - "Reassessment" (DB format, UI format, internal format)
 */

export const EVALUATION_TYPES = {
  INITIAL: "Initial Assessment",
  REASSESSMENT: "Reassessment",
} as const

export type EvaluationType = (typeof EVALUATION_TYPES)[keyof typeof EVALUATION_TYPES]

/**
 * Normalize any input to valid EvaluationType
 * Handles edge cases: legacy formats, double-quoted strings, variations
 * @example normalizeEvaluationType('initial') => 'Initial Assessment'
 * @example normalizeEvaluationType('"Initial Assessment"') => 'Initial Assessment'
 * @example normalizeEvaluationType('""Initial Assessment""') => 'Initial Assessment'
 */
export function normalizeEvaluationType(input: unknown): EvaluationType {
  // Non-string input defaults to Initial Assessment
  if (typeof input !== "string") {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[v0] Non-string evaluation type received:`, input)
    }
    return EVALUATION_TYPES.INITIAL
  }

  // Remove whitespace and repeatedly unwrap quotes
  let normalized = input.trim()

  // Remove wrapping quotes repeatedly (handles cases like ""Initial Assessment"")
  while (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1).trim()
  }

  const lower = normalized.toLowerCase()

  // Check for reassessment patterns
  if (
    lower === "reassessment" ||
    lower === "re-assessment" ||
    lower === "re assessment" ||
    (lower.includes("re") && lower.includes("assess"))
  ) {
    return EVALUATION_TYPES.REASSESSMENT
  }

  // Check for initial assessment patterns
  if (
    lower === "initial" ||
    lower === "initial assessment" ||
    lower === "initial-assessment" ||
    lower.includes("initial")
  ) {
    return EVALUATION_TYPES.INITIAL
  }

  // Already in correct format
  if (normalized === EVALUATION_TYPES.INITIAL) return EVALUATION_TYPES.INITIAL
  if (normalized === EVALUATION_TYPES.REASSESSMENT) return EVALUATION_TYPES.REASSESSMENT

  // Unrecognized value - default to Initial Assessment
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[v0] Unrecognized evaluation type "${input}", defaulting to "Initial Assessment"`)
  }
  return EVALUATION_TYPES.INITIAL
}

/**
 * Check if evaluation type is Reassessment
 */
export function isReassessment(type: EvaluationType | string): boolean {
  const normalized = normalizeEvaluationType(type)
  return normalized === EVALUATION_TYPES.REASSESSMENT
}
