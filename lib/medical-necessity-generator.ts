export interface MedicalNecessityInput {
  client?: {
    name: string
    age: number
    gender?: string
    livingSituation?: string
  }
  diagnoses?: {
    primaryDiagnosisName: string
    primaryDiagnosisCode: string
    secondaryDiagnoses?: Array<{ name: string; code: string }>
  }
  assessmentContext?: {
    datesOfEvaluation: string
    settings: string[]
    toolsUsed: string[]
  }
  domains?: {
    communication?: { severity: string; keyDeficits: string; strengths?: string; impact: string }
    socialPlay?: { severity: string; keyDeficits: string; impact: string }
    adaptiveDailyLiving?: { severity: string; keyDeficits: string; impact: string }
    academicCognitive?: { severity: string; keyDeficits: string; impact: string }
    maladaptiveBehaviors?: { topographies: string[]; frequency: string; settings: string; impact: string }
  }
  abcObservations?: Array<{
    antecedent: string
    behavior: string
    consequence: string
    function: string
  }>
  riskAssessment?: {
    safetyConcerns: string[]
    supervisionLevel: string
    impactOnClient: string
    impactOnOthers: string
  }
  goalsSummary?: string
  servicePlan?: {
    code97153Hours?: number
    code97155Hours?: number
    code97156Hours?: number
    code97156HNHours?: number
    totalHoursPerWeek?: number
    expectedDuration?: string
  }
}

/**
 * Generate Medical Necessity section for ABA assessment report
 */
export function generateMedicalNecessitySection(input: MedicalNecessityInput): string {
  const sections: string[] = []

  // Header
  sections.push("**Medical Necessity for ABA Services**\n")

  // 1. Diagnostic and Clinical Context
  sections.push(generateDiagnosticContext(input))

  // 2. Functional Impact and Areas of Impairment
  sections.push(generateFunctionalImpact(input))

  // 3. Maladaptive Behaviors and Risk (if applicable)
  if (input.maladaptiveBehaviors || input.riskAssessment) {
    sections.push(generateBehaviorAndRisk(input))
  }

  // 4. Rationale for ABA as Medically Necessary
  sections.push(generateABARationale(input))

  // 5. Recommended Intensity and Service Model
  sections.push(generateServiceRecommendations(input))

  // 6. Prognosis and Ongoing Review
  sections.push(generatePrognosis(input))

  return sections.join("\n\n")
}

function generateDiagnosticContext(input: MedicalNecessityInput): string {
  const client = input.client || { name: "[Client Name]", age: 0 }
  const dx = input.diagnoses || {
    primaryDiagnosisName: "Autism Spectrum Disorder",
    primaryDiagnosisCode: "F84.0",
  }
  const context = input.assessmentContext || {}

  let text = `**Diagnostic and Clinical Context**\n\n`

  text += `${client.name} is a ${client.age}-year-old `
  if (client.gender) {
    text += `${client.gender} `
  }
  text += `diagnosed with ${dx.primaryDiagnosisName} (ICD-10: ${dx.primaryDiagnosisCode}). `

  if (dx.secondaryDiagnoses && dx.secondaryDiagnoses.length > 0) {
    const secondaryList = dx.secondaryDiagnoses.map((d) => `${d.name} (${d.code})`).join(", ")
    text += `Additional diagnoses include ${secondaryList}. `
  }

  text += `The present recommendations are based on a comprehensive behavioral assessment that included `

  const assessmentComponents = []
  if (context.datesOfEvaluation) {
    assessmentComponents.push(`conducted ${context.datesOfEvaluation}`)
  }
  if (context.settings && context.settings.length > 0) {
    assessmentComponents.push(`across ${context.settings.join(", ")} settings`)
  }

  text += assessmentComponents.join(" ")

  if (context.toolsUsed && context.toolsUsed.length > 0) {
    text += `. The evaluation incorporated standardized assessment tools (${context.toolsUsed.join(", ")}), `
  } else {
    text += `. The evaluation incorporated standardized assessment measures, `
  }

  text += `direct observation, caregiver interview, and structured ABC recording of behavior.`

  return text
}

function generateFunctionalImpact(input: MedicalNecessityInput): string {
  let text = `**Functional Impact and Areas of Impairment**\n\n`

  const domains = input.domains || {}
  const impactAreas: string[] = []

  // Communication
  if (domains.communication) {
    const comm = domains.communication
    impactAreas.push(
      `**Communication:** ${getClientName(input)} demonstrates ${comm.severity} impairments in communication skills. ${comm.keyDeficits} These deficits ${comm.impact}.`,
    )
  }

  // Social/Play
  if (domains.socialPlay) {
    const social = domains.socialPlay
    impactAreas.push(`**Social Interaction and Play:** ${social.keyDeficits} ${social.impact}.`)
  }

  // Adaptive/Daily Living
  if (domains.adaptiveDailyLiving) {
    const adaptive = domains.adaptiveDailyLiving
    impactAreas.push(`**Adaptive and Daily Living Skills:** ${adaptive.keyDeficits} ${adaptive.impact}.`)
  }

  // Academic/Cognitive
  if (domains.academicCognitive) {
    const academic = domains.academicCognitive
    impactAreas.push(`**Academic and Cognitive Functioning:** ${academic.keyDeficits} ${academic.impact}.`)
  }

  if (impactAreas.length === 0) {
    text += `The client demonstrates clinically significant impairments across multiple developmental domains that interfere with daily functioning, learning, and participation in age-appropriate activities. These deficits require structured behavioral intervention to address skill acquisition and reduce dependence on prompts and supports.`
  } else {
    text += impactAreas.join("\n\n")
    text += `\n\nThese pervasive impairments significantly interfere with the client's ability to function independently, participate in educational activities, engage in age-appropriate social interactions, and maintain safety. The severity and breadth of deficits across multiple domains indicate that standard classroom accommodations or infrequent consultative services would be insufficient to address the client's needs.`
  }

  return text
}

function generateBehaviorAndRisk(input: MedicalNecessityInput): string {
  let text = `**Maladaptive Behaviors and Risk Considerations**\n\n`

  const behaviors = input.maladaptiveBehaviors
  const risk = input.riskAssessment

  if (behaviors && behaviors.topographies && behaviors.topographies.length > 0) {
    text += `Assessment data indicate the presence of interfering behaviors including ${behaviors.topographies.join(", ")}. `

    if (behaviors.frequency) {
      text += `These behaviors ${behaviors.frequency}. `
    }

    if (behaviors.impact) {
      text += `${behaviors.impact} `
    }
  }

  if (risk) {
    if (risk.safetyConcerns && risk.safetyConcerns.length > 0) {
      text += `Safety concerns identified include ${risk.safetyConcerns.join(", ")}. `
    }

    if (risk.supervisionLevel) {
      text += `${risk.supervisionLevel} `
    }

    if (risk.impactOnClient) {
      text += `Impact on the client includes ${risk.impactOnClient}. `
    }

    if (risk.impactOnOthers) {
      text += `${risk.impactOnOthers} `
    }
  }

  if (!behaviors && !risk) {
    text += `At this time, no severe dangerous behaviors (e.g., self-injury or aggression posing immediate medical risk) were reported or observed. However, the client exhibits behaviors that significantly interfere with learning and daily functioning, necessitating a structured behavioral approach to increase adaptive skills and decrease reliance on maladaptive coping strategies.`
  }

  return text
}

function generateABARationale(input: MedicalNecessityInput): string {
  let text = `**Rationale for ABA as Medically Necessary**\n\n`

  text += `Applied Behavior Analysis (ABA) is an evidence-based treatment for Autism Spectrum Disorder and related developmental disabilities, with extensive research support demonstrating its efficacy in improving functional communication, adaptive skills, social behaviors, and reducing interfering behaviors. `

  text += `Given the presence of clinically significant impairments across multiple developmental domains, `

  // Reference ABC functions if available
  if (input.abcObservations && input.abcObservations.length > 0) {
    const functions = [...new Set(input.abcObservations.map((obs) => obs.function).filter(Boolean))]
    if (functions.length > 0) {
      text += `combined with behavioral data indicating that challenging behaviors are maintained by ${functions.join(", ").toLowerCase()} functions, `
    }
  }

  text += `a structured, behavior-analytic treatment approach is medically necessary. `

  text += `The client's documented deficits cannot be reasonably addressed through less intensive, non-behavioral interventions alone (e.g., generic classroom accommodations, infrequent consultative services). `

  text += `ABA services are required to:\n\n`
  text += `- Systematically teach functionally equivalent replacement skills (e.g., functional communication, appropriate social behaviors)\n`
  text += `- Implement evidence-based behavior change procedures tailored to the client's specific behavioral functions and learning profile\n`
  text += `- Modify environmental antecedents and consequences to support skill acquisition and generalization\n`
  text += `- Train caregivers and educational staff to implement behavioral strategies consistently across settings\n`
  text += `- Reduce maladaptive behaviors that interfere with learning, safety, and community participation\n\n`

  text += `Without comprehensive ABA intervention, the client is at risk for continued developmental delays, increased behavioral challenges, academic failure, and reduced quality of life for both the client and family.`

  return text
}

function generateServiceRecommendations(input: MedicalNecessityInput): string {
  let text = `**Recommended Intensity and Service Model**\n\n`

  const plan = input.servicePlan || {}

  if (plan.totalHoursPerWeek) {
    text += `A total of ${plan.totalHoursPerWeek} hours per week of ABA services is recommended, distributed across the following CPT codes:\n\n`

    if (plan.code97153Hours && plan.code97153Hours > 0) {
      text += `- **97153 (Adaptive Behavior Treatment by Technician):** ${plan.code97153Hours} hours per week of direct 1:1 intervention to implement individualized treatment protocols\n`
    }

    if (plan.code97155Hours && plan.code97155Hours > 0) {
      text += `- **97155 (Adaptive Behavior Treatment with Protocol Modification):** ${plan.code97155Hours} hours per week of BCBA clinical direction for ongoing assessment, protocol modification, and supervision\n`
    }

    if (plan.code97156Hours && plan.code97156Hours > 0) {
      text += `- **97156 (Family/Caregiver Training):** ${plan.code97156Hours} hours per week of caregiver training to ensure consistency and generalization across environments\n`
    }

    if (plan.code97156HNHours && plan.code97156HNHours > 0) {
      text += `- **97156 HN (Home Health Modifier):** ${plan.code97156HNHours} hours per week of home-based caregiver training\n`
    }

    text += `\n`
  } else {
    text += `Comprehensive ABA services are recommended, including direct intervention, clinical supervision, and caregiver training. `
  }

  text += `This service intensity is considered medically necessary given:\n\n`
  text += `- The severity and pervasiveness of deficits across multiple developmental domains\n`
  text += `- The complexity and functional nature of interfering behaviors requiring systematic intervention\n`
  text += `- The need for consistent caregiver training to promote skill generalization and maintenance\n`
  text += `- The client's age and developmental window, during which intensive intervention has been shown to yield optimal outcomes\n`
  text += `- The requirement for frequent clinical oversight to ensure individualized protocol adjustments based on data-driven decision making\n\n`

  if (plan.expectedDuration) {
    text += `Initial authorization is requested for ${plan.expectedDuration}, with ongoing treatment planning and goal adjustment based on the client's response to intervention.`
  } else {
    text += `Initial authorization is requested for a 6-month treatment episode, with ongoing treatment planning and goal adjustment based on the client's response to intervention.`
  }

  return text
}

function generatePrognosis(input: MedicalNecessityInput): string {
  let text = `**Prognosis and Need for Ongoing Review**\n\n`

  const client = input.client || { name: "[Client Name]" }

  text += `With consistent participation in comprehensive ABA services, ${client.name} is expected to demonstrate improvements in functional communication, adaptive skills, social behaviors, and reductions in interfering behaviors. Research supports positive outcomes for individuals receiving intensive ABA intervention, particularly when services are implemented during early developmental periods with active caregiver involvement.\n\n`

  text += `Treatment response will be monitored through ongoing data collection across all skill domains and behavioral targets. Progress will be reviewed regularly (at minimum quarterly) with the supervising BCBA, and treatment goals and service intensity will be adjusted based on the client's demonstrated skill acquisition rates and changing needs. Continued authorization for ABA services will be requested as medically necessary based on ongoing assessment data and clinical judgment regarding the client's continued need for intensive behavioral intervention.`

  return text
}

// Helper function to extract the client name from input
function getClientName(input: MedicalNecessityInput): string {
  return input.client?.name || "The client"
}
