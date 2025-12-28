/**
 * Sample assessment data for Marcus Johnson (Demo Mode)
 * Used in AI Report Generator for testing and demonstration
 */

export const sampleAssessmentData = {
  clientInfo: {
    firstName: "Marcus",
    lastName: "Johnson",
    dob: "2016-03-15",
    age: 8,
    gender: "Male",
    diagnosis: "Autism Spectrum Disorder - Level 2",
    icd10Code: "F84.0",
    clientId: "MJ-2024-001",
    address: "123 Main Street, Springfield, IL 62701",
    caregiver: "Sarah Johnson (Mother)",
    phone: "(555) 123-4567",
  },
  providerInfo: {
    name: "Bright Futures ABA Therapy",
    bcbaName: "Dr. Emily Rodriguez",
    bcbaLicense: "BCBA-2024-IL-12345",
    bcbaPhone: "(555) 987-6543",
    bcbaEmail: "emily.rodriguez@brightfuturesaba.com",
    npi: "1234567890",
    agencyLogo: "/bright-futures-aba-logo.jpg",
  },
  insurance: {
    provider: "Blue Cross Blue Shield",
    policyNumber: "BCBS-IL-2024-9876",
    authNumber: "AUTH-2024-556789",
  },
  background: {
    developmental:
      "Marcus was diagnosed with ASD at age 3. Early milestones were delayed - first words at 24 months, walking at 16 months. He has shown significant progress with early intervention services including speech therapy and occupational therapy.",
    medical:
      "No significant medical conditions. Regular pediatric care. Takes no medications currently. Has seasonal allergies managed with over-the-counter antihistamines.",
    educational:
      "Currently in 2nd grade with an IEP. Receives special education support for 50% of the school day. Shows strong visual learning skills and enjoys computer-based activities.",
    family:
      "Lives with mother (Sarah), father (David), and younger sister (Emma, age 5). Mother reports family history of ADHD on paternal side. Family is very supportive and engaged in treatment.",
    previousTreatments:
      "Received ABA therapy from ages 3-5 (15 hours/week). Speech therapy ongoing since age 3. Occupational therapy from ages 4-6. Family participated in parent training program in 2022.",
    strengths:
      "Strong visual learner, excellent memory for facts and details, follows visual schedules well, enjoys technology and educational apps, affectionate with family members, improving social awareness.",
    weaknesses:
      "Difficulty with transitions, limited expressive language (50-75 words), challenges with peer interaction, sensory sensitivities (loud noises, certain textures), occasional aggressive behavior when frustrated.",
    dailySchedule:
      "Wakes at 7:00 AM, breakfast and morning routine, school 8:30 AM - 3:00 PM, after-school snack, play time or therapy sessions, dinner at 6:00 PM, bath and bedtime routine starting at 7:30 PM.",
  },
  assessmentTools: [
    "Vineland Adaptive Behavior Scales (VABS-3)",
    "ABLLS-R (Assessment of Basic Language and Learning Skills - Revised)",
    "VB-MAPP (Verbal Behavior Milestones Assessment and Placement Program)",
    "Direct observation across home and school settings",
    "Parent and teacher interviews",
    "Functional Behavior Assessment (FBA)",
  ],
  assessmentDates: "November 15-22, 2024",
  observationSettings:
    "Home environment (4 hours), school classroom (3 hours), playground (1 hour), community setting - grocery store (1 hour)",
  domains: {
    communication: {
      level: "Emerging",
      findings:
        "Marcus demonstrates a vocabulary of approximately 50-75 words. He uses 2-3 word phrases inconsistently. Shows strong receptive language skills - follows 2-step directions with visual supports. Needs significant prompting for expressive communication. Uses some functional communication via AAC device in school setting.",
    },
    social: {
      level: "Limited",
      findings:
        "Limited interest in peer interactions. Prefers parallel play over cooperative play. Shows emerging joint attention skills. Responds to adult-initiated social interactions but rarely initiates. Demonstrates appropriate eye contact with familiar adults but limited with peers. Beginning to show awareness of others' emotions.",
    },
    adaptive: {
      level: "Moderate Delays",
      findings:
        "Self-care skills are emerging. Independent with toileting during day (occasional nighttime accidents). Requires assistance with bathing, tooth brushing, and dressing. Can feed self with utensils but needs supervision. Follows simple household routines with visual supports.",
    },
    behavior: {
      level: "Concerns Present",
      findings:
        "Displays challenging behaviors including aggression (hitting, pushing) 3-5 times per week when frustrated or during transitions. Engages in vocal stereotypy (repetitive sounds) throughout day. Shows difficulty regulating emotions. Responds well to visual schedules and token economy systems.",
    },
    play: {
      level: "Emerging Skills",
      findings:
        "Engages in parallel play for 5-10 minutes. Shows strong preference for cause-and-effect toys and tablets. Beginning to show imaginative play with adult modeling. Limited variety in play activities - tends to focus on same toys repeatedly. Can participate in structured games with support.",
    },
    motor: {
      level: "Age-Appropriate",
      findings:
        "Gross motor skills within normal limits - runs, jumps, climbs appropriately. Fine motor skills slightly delayed - working on pencil grasp and handwriting. Some sensory seeking behaviors observed (spinning, jumping). Good balance and coordination for age.",
    },
  },
  abcObservations: [
    {
      antecedent: "Asked to transition from iPad to dinner table",
      behavior: "Screamed, threw iPad, hit mother's arm",
      consequence: "Guided to calm-down corner, used visual timer, provided preferred snack at table",
      function: "Escape from non-preferred activity",
    },
    {
      antecedent: "Peer approached during play at park",
      behavior: "Turned away, walked to opposite side of playground",
      consequence: "Mother encouraged interaction but allowed space",
      function: "Escape from social demand",
    },
    {
      antecedent: "Loud fire alarm during school",
      behavior: "Covered ears, cried, ran to corner",
      consequence: "Teacher provided noise-canceling headphones, calming activities",
      function: "Sensory avoidance",
    },
  ],
  behaviors: [
    {
      name: "Physical Aggression",
      definition: "Hitting, pushing, or kicking others with force",
      baseline: "3-5 incidents per week",
      frequency: "Average 4 times per week",
      intensity: "Moderate - leaves temporary red marks but no injuries",
      function: "Escape from demands and attention-seeking",
    },
    {
      name: "Vocal Stereotypy",
      definition: "Repetitive vocalizations including humming, scripting from videos, repeating sounds",
      baseline: "Occurs throughout day, approximately 30-40% of observed time",
      frequency: "Multiple times per hour",
      intensity: "Low to moderate volume",
      function: "Automatic reinforcement (sensory)",
    },
  ],
  goals: [
    {
      area: "Communication",
      goal: "Marcus will independently use 3-4 word phrases to make requests in 80% of opportunities across 3 consecutive sessions",
      targetDate: "March 2025",
      priority: "High",
    },
    {
      area: "Social Skills",
      goal: "Marcus will initiate social interaction with peers using appropriate greetings in 4 out of 5 opportunities",
      targetDate: "April 2025",
      priority: "High",
    },
    {
      area: "Behavior Reduction",
      goal: "Marcus will demonstrate appropriate coping strategies instead of physical aggression in 90% of frustrating situations",
      targetDate: "June 2025",
      priority: "High",
    },
    {
      area: "Adaptive Skills",
      goal: "Marcus will independently complete morning routine (toileting, washing hands, getting dressed) with visual supports in 4 out of 5 opportunities",
      targetDate: "May 2025",
      priority: "Medium",
    },
  ],
  servicePlan: {
    recommendedHours: 25,
    frequency: "5 days per week, 5 hours per day",
    setting: "Home-based with community generalization",
    duration: "6 months with quarterly reassessment",
    rationale:
      "Marcus demonstrates significant delays in communication and social skills, with challenging behaviors interfering with learning and family life. Intensive ABA services are medically necessary to address these core deficits and reduce problem behaviors. The recommended 25 hours per week will allow for comprehensive programming across all skill domains with sufficient opportunities for practice and generalization.",
  },
  medicalNecessity: {
    justification:
      "ABA therapy is medically necessary for Marcus due to his ASD Level 2 diagnosis and significant functional impairments in communication, social interaction, and adaptive behavior. Without intensive intervention, Marcus is at risk for continued developmental delays, academic struggles, and social isolation. Evidence-based ABA intervention will address his core deficits and improve his quality of life and long-term outcomes.",
    functionalImpairments: [
      "Severe communication delays affecting ability to express needs and wants",
      "Limited social reciprocity and peer relationships",
      "Challenging behaviors interfering with learning and family functioning",
      "Adaptive skill delays affecting independence in daily living activities",
      "Sensory sensitivities impacting participation in typical activities",
    ],
    previousInterventions:
      "Marcus has received speech therapy and occupational therapy with limited progress in reducing core ASD symptoms. Previous ABA therapy (ages 3-5) resulted in significant gains, supporting the effectiveness of this approach for Marcus.",
  },
  riskAssessment: {
    level: "Moderate",
    factors: [
      "Physical aggression toward family members and peers",
      "Elopement risk in community settings (moderate - has run from parent 2 times in past 6 months)",
      "Limited safety awareness (runs into street without looking, climbs on unsafe structures)",
      "Self-injurious behavior has not been observed but should be monitored given frustration levels",
    ],
    safetyPlan:
      "Visual supports for safety rules, close supervision in community, social stories about safe behavior, parent training on managing elopement risk, crisis intervention plan in place",
  },
}
