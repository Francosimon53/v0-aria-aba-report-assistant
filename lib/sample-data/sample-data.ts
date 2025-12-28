// Sample assessment data for preview/demo purposes
// Direct export to avoid module resolution issues

export const sampleAssessmentData = {
  clientInfo: {
    firstName: "Marcus",
    lastName: "Johnson",
    dob: "2019-03-15",
    age: "5 years, 9 months",
    diagnosis: "Autism Spectrum Disorder (ASD) - Level 2",
    icd10: "F84.0",
    address: "1234 Oak Street, Miami, FL 33125",
    caregiver: "Sarah Johnson (Mother), David Johnson (Father)",
    phone: "(305) 555-0123",
    clientId: "MJ-2024-0892",
    gender: "Male",
    ethnicity: "African American",
    primaryLanguage: "English",
    schoolPlacement: "Pre-K Special Education Classroom",
  },
  providerInfo: {
    name: "Behavioral Health Associates",
    bcbaName: "Dr. Amanda Rodriguez, BCBA-D",
    bcbaLicense: "BCBA-D #1-19-38475",
    bcbaPhone: "(305) 555-0456",
    bcbaEmail: "a.rodriguez@bhamiami.com",
    npi: "1234567890",
    taxId: "XX-XXXXXXX",
    address: "500 Professional Plaza, Suite 200, Miami, FL 33130",
  },
  insurance: {
    provider: "Blue Cross Blue Shield of Florida",
    policyNumber: "BCB-FL-9876543",
    authNumber: "AUTH-2024-112233",
    groupNumber: "GRP-55512",
    subscriberName: "David Johnson",
    subscriberDOB: "1985-07-22",
    relationship: "Father",
  },
  background: {
    developmental:
      "Marcus was born full-term at 39 weeks via uncomplicated vaginal delivery. Birth weight was 7 lbs, 4 oz. Early developmental milestones were met within normal limits until approximately 18 months of age when parents noted regression in previously acquired language skills.",
    medical:
      "Diagnosed with Autism Spectrum Disorder at age 2.5 years by developmental pediatrician. No significant medical conditions or hospitalizations. Current Medications: Melatonin 3mg at bedtime for sleep initiation, daily multivitamin.",
    educational:
      "Marcus currently attends Sunshine Academy, a private pre-K program with an integrated special education classroom. He receives Speech-Language Therapy 2x/week, Occupational Therapy 1x/week, and Special Education Support full-time.",
    family:
      "Marcus lives with both parents and his 8-year-old sister, Aaliyah, in a single-family home. Both parents work full-time. Maternal grandmother provides childcare support 2-3 days per week.",
    previousTreatments:
      "Previous ABA Therapy (Ages 3-4): 15 hours/week. Speech-Language Therapy ongoing since age 2. Occupational Therapy ongoing since age 2.",
    strengths:
      "Strong visual learner, good gross motor abilities, demonstrates affection toward family members, high motivation for preferred items.",
    weaknesses:
      "Limited functional communication, significant social skill deficits, difficulty with transitions, sensory sensitivities.",
    dailySchedule: "6:30 AM wake up, 8:00 AM school, 2:30 PM dismissal, 4:00 PM therapy sessions, 7:30 PM bedtime.",
  },
  assessmentTools: [
    "Vineland Adaptive Behavior Scales, Third Edition (Vineland-3)",
    "Verbal Behavior Milestones Assessment and Placement Program (VB-MAPP)",
    "Functional Behavior Assessment (FBA)",
    "Preference Assessment (Multiple Stimulus Without Replacement)",
  ],
  assessmentDates: "October 15-22, 2024",
  observationSettings: "Home environment, Pre-K classroom, Community setting",
  domains: {
    communication: {
      level: "Significant Deficit",
      score: "Standard Score: 58 (Vineland-3)",
      findings:
        "Marcus primarily communicates using PECS at Phase 4. He has approximately 20 spoken words used inconsistently. Limited joint attention and social communication skills.",
    },
    social: {
      level: "Significant Deficit",
      score: "Standard Score: 61 (Vineland-3)",
      findings:
        "Shows attachment to family but limited interest in peers. Play skills are significantly limited to sensory-motor and simple cause-effect activities.",
    },
    adaptive: {
      level: "Moderate Deficit",
      score: "Standard Score: 65 (Vineland-3)",
      findings:
        "Requires significant support for self-care routines. Can feed himself with spoon at 50% accuracy. Toilet training not yet initiated.",
    },
    behavior: {
      level: "Clinical Concern",
      score: "Requires intervention",
      findings:
        "Target behaviors include physical aggression (8-12 episodes/day), SIB (3-5 episodes/day), elopement (2-3 attempts per outing), and property destruction (5-7 episodes/day).",
    },
  },
  abcObservations: [
    {
      date: "10/15/2024",
      time: "9:15 AM",
      setting: "Home - Kitchen",
      antecedent: "Mother presented non-preferred food and removed iPad",
      behavior: "Marcus screamed, swept plate off table, hit mother's arm 3 times",
      consequence: "Mother provided preferred cereal, returned iPad after 5 minutes",
      function: "Escape / Access to tangibles",
      duration: "4 minutes",
      intensity: "Moderate",
    },
    {
      date: "10/15/2024",
      time: "2:45 PM",
      setting: "School - Classroom",
      antecedent: "Teacher instructed transition from free play to circle time",
      behavior: "Marcus dropped to floor, began head-hitting on carpet, cried loudly",
      consequence: "Teacher aide provided 1:1 transition support with visual timer",
      function: "Escape from demand",
      duration: "2 minutes",
      intensity: "Mild",
    },
  ],
  behaviors: [
    {
      name: "Physical Aggression",
      definition:
        "Any instance of forceful physical contact toward another person including hitting, kicking, scratching, biting, or pushing.",
      frequency: "8-12 episodes per day",
      duration: "30 seconds to 3 minutes per episode",
      intensity: "Mild to moderate",
      function: "Primarily escape-maintained with secondary tangible function",
      baseline: "Average 10.2 episodes per day",
    },
    {
      name: "Self-Injurious Behavior (SIB)",
      definition:
        "Any instance of self-directed forceful contact including head-hitting, hand-biting, or face-slapping.",
      frequency: "3-5 episodes per day",
      duration: "10-30 seconds per episode",
      intensity: "Mild",
      function: "Automatic reinforcement and escape-maintained",
      baseline: "Average 4.1 episodes per day",
    },
  ],
  goals: [
    {
      domain: "Communication",
      lto: "Marcus will independently request preferred items and activities using a multi-modal communication system across all settings with 90% accuracy.",
      stos: [
        "Marcus will exchange a single picture card for a preferred item within 3 seconds of seeing the item, with 80% independence across 5 consecutive sessions.",
        "Marcus will navigate to the correct page in his communication book and exchange the appropriate picture card with 80% accuracy.",
        "Marcus will use 2-word combinations (I want + item) via PECS or speech approximations for at least 20 different requests with 80% accuracy.",
      ],
      timeline: "12 months",
      measurementMethod: "Trial-by-trial data collection",
    },
    {
      domain: "Social Skills",
      lto: "Marcus will engage in reciprocal play interactions with peers for at least 5 minutes across 3 different play activities with minimal adult support.",
      stos: [
        "Marcus will tolerate a peer within 3 feet during parallel play for 5 minutes without moving away or aggression, across 80% of opportunities.",
        "Marcus will respond to peer initiations (greetings, play bids) within 5 seconds, across 60% of opportunities.",
        "Marcus will initiate a play interaction with a peer using words, gestures, or communication device, at least 2 times per 30-minute play session.",
      ],
      timeline: "12 months",
      measurementMethod: "Interval recording during play sessions",
    },
    {
      domain: "Behavior Reduction",
      lto: "Marcus will reduce physical aggression to fewer than 1 episode per day while developing and using appropriate replacement behaviors.",
      stos: [
        "Marcus will use a functional communication response (FCR) to request a break or preferred item instead of aggression across 60% of opportunities.",
        "Marcus will reduce physical aggression to fewer than 5 episodes per day across all settings.",
        "Marcus will reduce physical aggression to fewer than 2 episodes per day across all settings.",
      ],
      timeline: "12 months",
      measurementMethod: "Frequency count with daily data collection",
    },
  ],
  servicePlan: {
    totalWeeklyHours: 25,
    services: [
      {
        code: "97153",
        description: "Adaptive behavior treatment by technician",
        hours: 20,
        frequency: "5 days per week, 4 hours per day",
        setting: "Home and Community",
      },
      {
        code: "97155",
        description: "Adaptive behavior treatment by BCBA",
        hours: 4,
        frequency: "2 hours, 2x per week",
        setting: "Home, School, Community",
      },
      {
        code: "97156",
        description: "Family adaptive behavior guidance",
        hours: 1,
        frequency: "1 hour per week",
        setting: "Home or Clinic",
      },
    ],
    justification:
      "Based on the severity of Marcus's deficits across communication, social, adaptive, and behavioral domains, intensive ABA services are medically necessary. The recommended 25 hours per week aligns with research supporting intensive early intervention for children with ASD Level 2.",
  },
  medicalNecessity: {
    statement:
      "Applied Behavior Analysis (ABA) therapy is medically necessary for Marcus Johnson based on his diagnosis of Autism Spectrum Disorder Level 2 and the significant functional impairments documented across all developmental domains. Without intensive intervention, Marcus is at risk for further developmental delays and escalation of dangerous behaviors including aggression and self-injury.",
    supportingFactors: [
      "Documented diagnosis of ASD Level 2 requiring substantial support",
      "Standardized assessment scores indicating significant deficits (Vineland-3 Composite: 62)",
      "Presence of dangerous behaviors requiring behavioral intervention",
      "Limited functional communication impacting all areas of life",
      "Previous positive response to ABA therapy",
    ],
  },
}
