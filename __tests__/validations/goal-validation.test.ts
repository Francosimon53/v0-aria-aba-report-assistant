import { validateSMARTGoal, validateCPTCode, calculateRecommendedHours } from "@/lib/validations/goal-validation"

describe("SMART Goal Validation", () => {
  describe("validateSMARTGoal", () => {
    test("valid goal passes all criteria", () => {
      const goal = {
        behavior: "independently request preferred items using AAC device",
        condition: "during structured play activities with therapist present",
        criterion: "80% accuracy across 3 consecutive sessions",
        timeline: "6 months",
      }

      const result = validateSMARTGoal(goal)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test("goal without behavior fails", () => {
      const goal = {
        behavior: "",
        condition: "during activities",
        criterion: "80% accuracy",
        timeline: "6 months",
      }

      const result = validateSMARTGoal(goal)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Behavior must be specific and at least 10 characters")
    })

    test("goal without measurable criterion fails", () => {
      const goal = {
        behavior: "improve communication skills significantly",
        condition: "at school and home",
        criterion: "better than before",
        timeline: "3 months",
      }

      const result = validateSMARTGoal(goal)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Criterion must include measurable numbers (percentage, frequency, or count)")
    })

    test("goal with 100% criterion shows warning", () => {
      const goal = {
        behavior: "follow single-step instructions independently",
        condition: "in therapy room with minimal distractions",
        criterion: "100% accuracy across 5 sessions",
        timeline: "3 months",
      }

      const result = validateSMARTGoal(goal)

      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain("100% criterion may be unrealistic - consider 80-90%")
    })

    test("goal with percentage over 100 fails", () => {
      const goal = {
        behavior: "complete task analysis steps for handwashing",
        condition: "in bathroom with visual supports",
        criterion: "150% improvement from baseline",
        timeline: "4 months",
      }

      const result = validateSMARTGoal(goal)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Percentage cannot exceed 100%")
    })

    test("goal without timeline fails", () => {
      const goal = {
        behavior: "tolerate waiting for preferred activities",
        condition: "during transitions between activities",
        criterion: "4 out of 5 opportunities",
        timeline: "",
      }

      const result = validateSMARTGoal(goal)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain("Timeline is required")
    })
  })

  describe("validateCPTCode", () => {
    test("valid ABA CPT codes pass", () => {
      expect(validateCPTCode("97151")).toBe(true)
      expect(validateCPTCode("97153")).toBe(true)
      expect(validateCPTCode("97155")).toBe(true)
    })

    test("invalid CPT codes fail", () => {
      expect(validateCPTCode("99999")).toBe(false)
      expect(validateCPTCode("12345")).toBe(false)
      expect(validateCPTCode("")).toBe(false)
    })
  })

  describe("calculateRecommendedHours", () => {
    test("mild severity returns correct range", () => {
      const hours = calculateRecommendedHours("mild", 8)
      expect(hours.min).toBe(10)
      expect(hours.max).toBe(15)
    })

    test("severe severity returns higher range", () => {
      const hours = calculateRecommendedHours("severe", 8)
      expect(hours.min).toBe(25)
      expect(hours.max).toBe(40)
    })

    test("young children get additional hours", () => {
      const hoursYoung = calculateRecommendedHours("moderate", 3)
      const hoursOlder = calculateRecommendedHours("moderate", 8)

      expect(hoursYoung.min).toBeGreaterThan(hoursOlder.min)
    })

    test("hours never exceed 40", () => {
      const hours = calculateRecommendedHours("severe", 2)
      expect(hours.max).toBeLessThanOrEqual(40)
    })
  })
})
