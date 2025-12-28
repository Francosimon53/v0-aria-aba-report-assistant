export interface CPTAuthRequestInput {
  // Client basics
  clientName: string
  clientAge: number
  clientGender?: string
  livingSituation?: string

  // Diagnoses
  primaryDiagnosisName: string
  primaryDiagnosisCode: string // ICD-10
  secondaryDiagnoses?: Array<{ name: string; code: string }>

  // Assessment context
  datesOfEvaluation: string
  settings: string[] // ["home", "clinic", "school"]
  assessmentToolsUsed: string[] // ["VB-MAPP", "ABLLS-R", etc.]

  // Functional impairments by domain
  domains: {
    communication?: { severity: string; examples: string; impact: string }
    social?: { severity: string; examples: string; impact: string }
    adaptive?: { severity: string; examples: string; impact: string }
    academic?: { severity: string; examples: string; impact: string }
    maladaptive?: { severity: string; examples: string; impact: string }
  }

  // ABC observations
  abcObservations?: Array<{
    antecedent: string
    behavior: string
    consequence: string
    function: string
  }>

  // Risk assessment
  riskAssessment: {
    hasAggression?: boolean
    hasSelfInjury?: boolean
    hasElopement?: boolean
    hasTantrums?: boolean
    hasPropertyDestruction?: boolean
    otherRisks?: string
    riskLevel: "none" | "low" | "moderate" | "high"
    riskDescription?: string
  }

  // Goals summary (high-level domains)
  goalDomains: string[]

  // Service plan
  servicePlan: {
    cpt97153Hours?: number // Technician-delivered
    cpt97155Hours?: number // BCBA supervision/modification
    cpt97156Hours?: number // Caregiver training
    cpt97156HNHours?: number // Assistant-level caregiver training
    authorizationPeriodMonths: number
  }
}

export function generateCPTAuthorizationRequest(input: CPTAuthRequestInput): string {
  const sections: string[] = []

  // Header
  sections.push("ABA AUTHORIZATION REQUEST SUMMARY\n")
  sections.push("═".repeat(80) + "\n")

  // 1. Client & Diagnostic Information
  sections.push("\n1. CLIENT & DIAGNOSTIC INFORMATION\n")
  sections.push("─".repeat(80) + "\n\n")

  const clientInfo = generateClientDiagnosticSection(input)
  sections.push(clientInfo)

  // 2. Functional Impairments & Behavioral Concerns
  sections.push("\n\n2. FUNCTIONAL IMPAIRMENTS & BEHAVIORAL CONCERNS\n")
  sections.push("─".repeat(80) + "\n\n")

  const impairments = generateFunctionalImpairmentsSection(input)
  sections.push(impairments)

  // 3. Safety / Risk
  sections.push("\n\n3. SAFETY & RISK CONSIDERATIONS\n")
  sections.push("─".repeat(80) + "\n\n")

  const risk = generateRiskSection(input)
  sections.push(risk)

  // 4. Treatment Goals
  sections.push("\n\n4. TREATMENT GOALS (HIGH-LEVEL)\n")
  sections.push("─".repeat(80) + "\n\n")

  const goals = generateGoalsSection(input)
  sections.push(goals)

  // 5. Requested Service Package
  sections.push("\n\n5. REQUESTED ABA SERVICE PACKAGE\n")
  sections.push("─".repeat(80) + "\n\n")

  const servicePackage = generateServicePackageSection(input)
  sections.push(servicePackage)

  // 6. Clinical Rationale
  sections.push("\n\n6. CLINICAL RATIONALE FOR REQUESTED INTENSITY\n")
  sections.push("─".repeat(80) + "\n\n")

  const rationale = generateClinicalRationaleSection(input)
  sections.push(rationale)

  return sections.join("")
}

function generateClientDiagnosticSection(input: CPTAuthRequestInput): string {
  const {
    clientName,
    clientAge,
    primaryDiagnosisName,
    primaryDiagnosisCode,
    secondaryDiagnoses,
    datesOfEvaluation,
    settings,
    assessmentToolsUsed,
  } = input

  const settingsText = settings.length > 0 ? settings.join(", ") : "clinical setting"
  const toolsText = assessmentToolsUsed.length > 0 ? assessmentToolsUsed.join(", ") : "standardized assessment tools"

  let text = `${clientName} is a ${clientAge}-year-old `
  if (input.clientGender) {
    text += `${input.clientGender} `
  }
  text += `diagnosed with ${primaryDiagnosisName} (ICD-10: ${primaryDiagnosisCode})`

  if (secondaryDiagnoses && secondaryDiagnoses.length > 0) {
    const secondaryList = secondaryDiagnoses.map((d) => `${d.name} (${d.code})`).join(", ")
    text += `, with additional diagnoses including ${secondaryList}`
  }

  text += `. This authorization request is based on a comprehensive behavioral assessment conducted ${datesOfEvaluation}, including direct observation in ${settingsText}, caregiver interview, standardized assessment tools (${toolsText}), and functional behavior analysis (ABC data).`

  if (input.livingSituation) {
    text += ` ${clientName} ${input.livingSituation}.`
  }

  text += `\n\nApplied Behavior Analysis (ABA) is requested as a medically necessary treatment to address significant functional impairments and interfering behaviors associated with this diagnosis.`

  return text
}

function generateFunctionalImpairmentsSection(input: CPTAuthRequestInput): string {
  const { domains } = input
  const impairments: string[] = []

  if (domains.communication) {
    impairments.push(`**Communication:** ${domains.communication.examples}. ${domains.communication.impact}.`)
  }

  if (domains.social) {
    impairments.push(`**Social/Play:** ${domains.social.examples}. ${domains.social.impact}.`)
  }

  if (domains.adaptive) {
    impairments.push(`**Adaptive/Daily Living:** ${domains.adaptive.examples}. ${domains.adaptive.impact}.`)
  }

  if (domains.academic) {
    impairments.push(`**Academic/Cognitive:** ${domains.academic.examples}. ${domains.academic.impact}.`)
  }

  let text =
    "The following functional impairments significantly limit the client's independence, learning, and participation in age-appropriate activities:\n\n"
  text += impairments.map((imp) => `• ${imp}`).join("\n")

  if (domains.maladaptive) {
    text += `\n\n**Maladaptive Behaviors:** ${domains.maladaptive.examples}. ${domains.maladaptive.impact}. These behaviors interfere with skill acquisition, caregiver instruction, peer interaction, and community participation.`

    // Add ABC analysis if available
    if (input.abcObservations && input.abcObservations.length > 0) {
      const functions = input.abcObservations.map((obs) => obs.function)
      const uniqueFunctions = Array.from(new Set(functions))

      text += `\n\nFunctional behavior analysis (ABC data) suggests that challenging behaviors are maintained by multiple functions including ${uniqueFunctions.join(", ")}. This requires a structured, behavior-analytic approach to teach functionally equivalent replacement skills and modify environmental contingencies.`
    }
  }

  return text
}

function generateRiskSection(input: CPTAuthRequestInput): string {
  const { riskAssessment } = input

  if (riskAssessment.riskLevel === "none" || riskAssessment.riskLevel === "low") {
    return "No severe dangerous behaviors were observed or reported during the assessment. However, the client's behavioral challenges and skill deficits still significantly interfere with daily functioning, learning opportunities, and quality of life, necessitating structured behavioral intervention."
  }

  const risks: string[] = []
  if (riskAssessment.hasAggression) risks.push("physical aggression toward others")
  if (riskAssessment.hasSelfInjury) risks.push("self-injurious behavior")
  if (riskAssessment.hasElopement) risks.push("elopement/wandering")
  if (riskAssessment.hasTantrums) risks.push("severe tantrum behaviors")
  if (riskAssessment.hasPropertyDestruction) risks.push("property destruction")
  if (riskAssessment.otherRisks) risks.push(riskAssessment.otherRisks)

  let text = ""
  if (risks.length > 0) {
    text += `The client engages in behaviors that present safety concerns, including ${risks.join(", ")}. `
  }

  if (riskAssessment.riskDescription) {
    text += `${riskAssessment.riskDescription} `
  }

  text += `These behaviors pose potential for harm to self, others, or the environment, and require close supervision and structured behavioral intervention to ensure safety while teaching replacement skills and coping strategies.`

  return text
}

function generateGoalsSection(input: CPTAuthRequestInput): string {
  const { goalDomains } = input

  if (goalDomains.length === 0) {
    return "Treatment goals will focus on increasing functional communication, improving adaptive skills, reducing interfering behaviors, and promoting independence across settings."
  }

  let text = "The proposed ABA treatment plan targets the following goal domains:\n\n"
  text += goalDomains.map((domain) => `• ${domain}`).join("\n")
  text +=
    "\n\nSpecific, measurable objectives for each domain are detailed in the comprehensive treatment plan. Progress will be monitored continuously through systematic data collection."

  return text
}

function generateServicePackageSection(input: CPTAuthRequestInput): string {
  const { servicePlan } = input
  const services: string[] = []

  if (servicePlan.cpt97153Hours && servicePlan.cpt97153Hours > 0) {
    services.push(
      `• **CPT 97153** – Adaptive behavior treatment by technician, face-to-face, under BCBA direction: **${servicePlan.cpt97153Hours} hours/week**`,
    )
  }

  if (servicePlan.cpt97155Hours && servicePlan.cpt97155Hours > 0) {
    services.push(
      `• **CPT 97155** – Adaptive behavior treatment with protocol modification by BCBA/qualified health professional: **${servicePlan.cpt97155Hours} hours/week**`,
    )
  }

  if (servicePlan.cpt97156Hours && servicePlan.cpt97156Hours > 0) {
    services.push(
      `• **CPT 97156** – Family adaptive behavior treatment guidance (caregiver training): **${servicePlan.cpt97156Hours} hours/week**`,
    )
  }

  if (servicePlan.cpt97156HNHours && servicePlan.cpt97156HNHours > 0) {
    services.push(
      `• **CPT 97156 HN** – Assistant-level family adaptive behavior treatment guidance: **${servicePlan.cpt97156HNHours} hours/week**`,
    )
  }

  let text = "**Requested Weekly ABA Services:**\n\n"
  text += services.join("\n")

  text += `\n\n**Authorization Period:** This request is for an initial period of ${servicePlan.authorizationPeriodMonths} months. Treatment intensity will be reviewed regularly and adjusted based on the client's progress data and clinical response.`

  return text
}

function generateClinicalRationaleSection(input: CPTAuthRequestInput): string {
  const { domains, servicePlan, clientAge, riskAssessment, abcObservations } = input
  const paragraphs: string[] = []

  // Paragraph 1: Severity and pervasiveness
  let p1 =
    "The requested service intensity is clinically indicated and medically necessary based on the severity and pervasiveness of the client's impairments across multiple functional domains. "

  const impairedDomains: string[] = []
  if (domains.communication) impairedDomains.push("communication")
  if (domains.social) impairedDomains.push("social interaction")
  if (domains.adaptive) impairedDomains.push("adaptive/daily living skills")
  if (domains.academic) impairedDomains.push("academic/cognitive functioning")

  if (impairedDomains.length > 0) {
    p1 += `The client demonstrates significant deficits in ${impairedDomains.join(", ")}, which collectively limit functional independence and require systematic, intensive instruction across multiple skill domains. `
  }

  if (domains.maladaptive) {
    p1 += `Additionally, interfering behaviors occur with sufficient frequency and intensity to impede skill acquisition, disrupt daily routines, and limit participation in educational and community activities. `
  }

  paragraphs.push(p1)

  // Paragraph 2: Age and developmental window (if young child)
  if (clientAge <= 8) {
    const p2 = `Given the client's age (${clientAge} years old), this represents a critical developmental window for intensive behavioral intervention. Research demonstrates that early, intensive ABA services during this period yield optimal outcomes in skill development, behavior reduction, and long-term functional independence. Delaying or reducing treatment intensity at this stage risks missing this critical intervention window.`
    paragraphs.push(p2)
  }

  // Paragraph 3: Justification for each service code
  let p3 = "The requested service components are each clinically necessary:\n\n"

  if (servicePlan.cpt97153Hours && servicePlan.cpt97153Hours > 0) {
    p3 += `• **97153 (${servicePlan.cpt97153Hours} hrs/week):** Direct, technician-delivered instruction is required to provide the high frequency of learning opportunities necessary for skill acquisition and behavior change. Given the severity of deficits and the number of skill domains requiring intervention, ${servicePlan.cpt97153Hours} hours per week represents the minimum clinically appropriate dosage to produce meaningful progress.\n\n`
  }

  if (servicePlan.cpt97155Hours && servicePlan.cpt97155Hours > 0) {
    p3 += `• **97155 (${servicePlan.cpt97155Hours} hrs/week):** Ongoing BCBA involvement is essential for continuous assessment, data analysis, protocol modification, and oversight of treatment implementation. The complexity of the client's presentation requires regular clinical decision-making and program adjustment by a Board Certified Behavior Analyst.\n\n`
  }

  if (servicePlan.cpt97156Hours && servicePlan.cpt97156Hours > 0) {
    p3 += `• **97156 (${servicePlan.cpt97156Hours} hrs/week):** Systematic caregiver training is critical to ensure skill generalization across settings, maintain treatment gains in natural environments, and promote caregiver competence in implementing behavioral strategies. Without structured parent/caregiver training, treatment effects are unlikely to maintain or generalize beyond direct therapy sessions.\n\n`
  }

  paragraphs.push(p3)

  // Paragraph 4: ABC-based rationale
  if (abcObservations && abcObservations.length > 0) {
    const functions = abcObservations.map((obs) => obs.function)
    const uniqueFunctions = Array.from(new Set(functions))

    let p4 = `Functional behavior analysis (ABC data) indicates that the client's challenging behaviors are maintained by ${uniqueFunctions.join(", ")} functions. This requires a comprehensive, function-based intervention approach that systematically teaches replacement behaviors, modifies environmental antecedents, and arranges consequences to support adaptive responding. `

    if (riskAssessment.riskLevel === "moderate" || riskAssessment.riskLevel === "high") {
      p4 += `Given the presence of safety concerns, intensive ABA services are necessary not only for skill development but also for ensuring the client's safety and the safety of others during the intervention process.`
    } else {
      p4 += `This level of intervention intensity is necessary to address these behavioral functions effectively and produce clinically significant, generalizable behavior change.`
    }

    paragraphs.push(p4)
  }

  // Final statement
  paragraphs.push(
    "In summary, the requested ABA service package represents the minimum medically necessary intensity to address the client's significant functional impairments, reduce interfering behaviors, teach critical replacement skills, and promote meaningful progress toward independence. Lower service intensity would be clinically inadequate given the severity and complexity of the client's needs.",
  )

  return paragraphs.join("\n\n")
}
