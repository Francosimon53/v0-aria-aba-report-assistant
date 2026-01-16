// Complete sample assessment data for demo mode
export const DEMO_CLIENT_DATA: Record<string, unknown> = {
  // Client Info
  "aria-client-info": {
    firstName: "Marcus",
    lastName: "Johnson",
    dateOfBirth: "2018-03-15",
    age: "5 years, 10 months",
    clientId: "MJ-2026-001",
    diagnosis: "Autism Spectrum Disorder",
    diagnosisCode: "F84.0",
    severityLevel: "Level 2",
    address: "2847 Maple Grove Drive, Springfield, IL 62704",
    primaryCaregiver: "Sarah Johnson",
    relationship: "Mother",
    phone: "(217) 555-3892",
    email: "sarah.johnson@email.com",
    insuranceProvider: "Blue Cross Blue Shield",
    policyNumber: "BCBS-IL-2026-4521",
    groupNumber: "GRP-987654",
    authorizationNumber: "AUTH-2026-001234",
    assessmentType: "initial",
  },

  // Background History
  "aria-background-history": {
    developmentalHistory:
      "Marcus was born full-term via normal vaginal delivery with no birth complications. Early developmental milestones were delayed, with first words emerging at 24 months and walking at 14 months. Parents first noted concerns around 18 months when Marcus showed limited eye contact and did not respond to his name consistently.",
    medicalHistory:
      "No significant medical history. Up to date on vaccinations. No known allergies. No hospitalizations or surgeries.",
    familyHistory: "Maternal uncle diagnosed with ADHD. No other known developmental disorders in immediate family.",
    educationalHistory:
      "Currently enrolled in early intervention preschool program 3 days per week. Receives speech therapy (2x/week) and occupational therapy (1x/week) through the school.",
    previousServices:
      "Received Early Intervention services from 18 months to 3 years. Currently receiving school-based speech and OT services.",
    medications: "None",
    allergies: "None known",
  },

  // Reason for Referral
  "aria-reason-for-referral": {
    dsm5Level: "Level 2",
    areasOfConcern: [
      "Functional communication",
      "Social-emotional reciprocity",
      "Transitioning between activities",
      "Following instructions",
      "Restricted/repetitive behaviors",
    ],
    currentProblemAreas:
      "Marcus presents with significant delays in expressive and receptive communication, limited social engagement with peers, difficulty with transitions between activities resulting in tantrum behaviors, and restricted interests primarily focused on trains and spinning objects. He demonstrates echolalia and limited spontaneous language use. Social interactions are characterized by parallel play with minimal reciprocal engagement. Transitions between activities frequently trigger crying, dropping to the floor, and physical resistance lasting 5-15 minutes.",
    familyGoals:
      "Parents desire for Marcus to communicate his needs effectively using functional language, engage in reciprocal play with siblings and peers, follow daily routines with minimal prompting, and reduce tantrum behaviors during transitions. They also hope he will expand his interests beyond trains and participate in family activities more fully.",
  },

  // ABLLS-R Scores
  "aria-ablls-r": {
    cooperation: {
      score: 38,
      max: 52,
      notes:
        "Responds to simple instructions with verbal and gestural prompts. Sits for 3-5 minutes during structured activities.",
    },
    visualPerformance: {
      score: 65,
      max: 97,
      notes:
        "Strong visual matching skills. Completes 12-piece puzzles independently. Matches identical pictures and objects.",
    },
    receptiveLanguage: {
      score: 72,
      max: 182,
      notes:
        "Follows 1-step directions in context. Identifies common objects and pictures. Emerging understanding of verbs.",
    },
    motorImitation: {
      score: 45,
      max: 80,
      notes: "Imitates gross motor actions consistently. Fine motor imitation emerging with prompts.",
    },
    vocalImitation: {
      score: 8,
      max: 20,
      notes: "Limited echoic repertoire. Approximates single syllables on request.",
    },
    requests: {
      score: 15,
      max: 60,
      notes:
        "Uses single words to request preferred items. Beginning to use 2-word combinations for high-preference items.",
    },
    labeling: {
      score: 22,
      max: 100,
      notes: "Labels common objects, family members, and favorite items. Emerging color and shape labeling.",
    },
    intraverbals: {
      score: 12,
      max: 130,
      notes: "Emerging fill-in responses for songs and familiar routines. Limited conversational intraverbals.",
    },
    spontaneousVocalizations: {
      score: 10,
      max: 20,
      notes: "Limited spontaneous speech. Primarily vocalizes to request or protest.",
    },
    syntaxGrammar: { score: 5, max: 42, notes: "Uses 1-2 word phrases. No consistent use of pronouns or verb tenses." },
    playLeisure: {
      score: 18,
      max: 35,
      notes: "Parallel play emerging. Engages with cause-effect toys. Limited imaginative play.",
    },
    socialInteraction: {
      score: 12,
      max: 55,
      notes: "Limited peer interaction. Responds to social bids from familiar adults. Minimal initiation.",
    },
  },

  // Vineland Parent
  "aria-vineland-parent": {
    abc: { standardScore: 68, confidenceInterval: "64-72", percentile: 2, adaptiveLevel: "Low" },
    communication: { standardScore: 65, confidenceInterval: "60-70", percentile: 1, adaptiveLevel: "Low" },
    dailyLivingSkills: { standardScore: 72, confidenceInterval: "67-77", percentile: 3, adaptiveLevel: "Low" },
    socialization: { standardScore: 62, confidenceInterval: "57-67", percentile: 1, adaptiveLevel: "Low" },
    motorSkills: { standardScore: 85, confidenceInterval: "80-90", percentile: 16, adaptiveLevel: "Adequate" },
  },

  // Vineland Teacher
  "aria-vineland-teacher": {
    abc: { standardScore: 70, confidenceInterval: "66-74", percentile: 2, adaptiveLevel: "Low" },
    communication: { standardScore: 68, confidenceInterval: "63-73", percentile: 2, adaptiveLevel: "Low" },
    dailyLivingSkills: { standardScore: 74, confidenceInterval: "69-79", percentile: 4, adaptiveLevel: "Low" },
    socialization: { standardScore: 64, confidenceInterval: "59-69", percentile: 1, adaptiveLevel: "Low" },
    motorSkills: { standardScore: 88, confidenceInterval: "83-93", percentile: 21, adaptiveLevel: "Adequate" },
  },

  // SRS-2
  "aria-srs2": {
    socialAwareness: { tScore: 72, interpretation: "Moderate" },
    socialCognition: { tScore: 78, interpretation: "Severe" },
    socialCommunication: { tScore: 75, interpretation: "Moderate" },
    socialMotivation: { tScore: 68, interpretation: "Moderate" },
    restrictedInterests: { tScore: 82, interpretation: "Severe" },
    totalScore: { tScore: 76, interpretation: "Severe" },
  },

  // MAS (Motivation Assessment Scale)
  "aria-mas": {
    sensory: { score: 3.2, rank: 2 },
    escape: { score: 4.1, rank: 1 },
    attention: { score: 2.5, rank: 3 },
    tangible: { score: 2.1, rank: 4 },
    primaryFunction: "Escape",
    notes: "Behaviors appear primarily maintained by escape from non-preferred tasks and transitions.",
  },

  // ABC Observations
  "aria-abc-observation": {
    observations: [
      {
        id: "1",
        date: "2026-01-02",
        time: "10:15 AM",
        setting: "Classroom",
        antecedent: "Teacher announced transition from preferred activity (blocks) to circle time.",
        behavior: "Marcus dropped to floor, cried loudly, kicked legs, and refused to move for 8 minutes.",
        consequence:
          "Teacher waited, then used visual timer and first-then board. Marcus eventually transitioned with physical guidance.",
        duration: "8 minutes",
        intensity: "High",
        function: "Escape",
      },
      {
        id: "2",
        date: "2026-01-02",
        time: "2:30 PM",
        setting: "Home",
        antecedent: "Mother asked Marcus to put away trains for dinner.",
        behavior: 'Marcus screamed "No!", threw one train, and ran to corner of room.',
        consequence: "Mother gave 2-minute warning with timer. Marcus complied after timer ended.",
        duration: "3 minutes",
        intensity: "Medium",
        function: "Escape",
      },
      {
        id: "3",
        date: "2026-01-03",
        time: "9:00 AM",
        setting: "Clinic",
        antecedent: "Therapist presented non-preferred task (writing).",
        behavior: 'Marcus pushed materials away and said "all done" repeatedly.',
        consequence: "Therapist offered choice of two writing tools and used high-p sequence.",
        duration: "2 minutes",
        intensity: "Low",
        function: "Escape",
      },
    ],
  },

  // Risk Assessment
  "aria-risk-assessment": {
    selfInjury: { present: false, severity: "None", description: "" },
    aggression: {
      present: true,
      severity: "Low",
      description: "Occasional pushing or throwing objects during tantrums. No injuries reported.",
    },
    elopement: { present: false, severity: "None", description: "" },
    propertyDestruction: {
      present: true,
      severity: "Low",
      description: "May throw items during tantrums. No significant damage.",
    },
    pica: { present: false, severity: "None", description: "" },
    overallRisk: "Low",
    safetyPlan:
      "Maintain clear sightlines during transitions. Remove throwable items during high-risk periods. Use visual supports and timers proactively.",
  },

  // Goals Tracker
  "aria-goals-tracker": {
    goals: [
      {
        id: "1",
        domain: "Communication",
        goalType: "Acquisition",
        longTermGoal:
          "Marcus will use functional 2-3 word phrases to request items, actions, and information across settings.",
        shortTermObjectives: [
          {
            id: "sto1",
            description: 'Request preferred items using 2-word phrases (e.g., "want train")',
            targetDate: "2026-04-01",
            baseline: "10%",
            target: "80%",
            current: "10%",
            status: "In Progress",
          },
          {
            id: "sto2",
            description: 'Request actions using 2-word phrases (e.g., "help please")',
            targetDate: "2026-06-01",
            baseline: "5%",
            target: "80%",
            current: "5%",
            status: "Not Started",
          },
          {
            id: "sto3",
            description: "Use 3-word phrases to request across 3 settings",
            targetDate: "2026-09-01",
            baseline: "0%",
            target: "80%",
            current: "0%",
            status: "Not Started",
          },
        ],
      },
      {
        id: "2",
        domain: "Social Skills",
        goalType: "Acquisition",
        longTermGoal: "Marcus will engage in reciprocal play with peers for at least 5 minutes.",
        shortTermObjectives: [
          {
            id: "sto4",
            description: "Parallel play near peer for 3 minutes",
            targetDate: "2026-04-01",
            baseline: "1 min",
            target: "3 min",
            current: "1 min",
            status: "In Progress",
          },
          {
            id: "sto5",
            description: "Share materials with peer when prompted",
            targetDate: "2026-06-01",
            baseline: "0%",
            target: "80%",
            current: "0%",
            status: "Not Started",
          },
          {
            id: "sto6",
            description: "Initiate play interaction with peer",
            targetDate: "2026-09-01",
            baseline: "0%",
            target: "5 initiations/session",
            current: "0",
            status: "Not Started",
          },
        ],
      },
      {
        id: "3",
        domain: "Behavior Reduction",
        goalType: "Reduction",
        longTermGoal: "Marcus will transition between activities with minimal problem behavior.",
        shortTermObjectives: [
          {
            id: "sto7",
            description: "Reduce transition tantrums to <3 per day",
            targetDate: "2026-04-01",
            baseline: "8/day",
            target: "<3/day",
            current: "8/day",
            status: "In Progress",
          },
          {
            id: "sto8",
            description: "Transition with visual support within 1 minute",
            targetDate: "2026-06-01",
            baseline: "20%",
            target: "80%",
            current: "20%",
            status: "Not Started",
          },
          {
            id: "sto9",
            description: "Independently transition with 30-second warning",
            targetDate: "2026-09-01",
            baseline: "0%",
            target: "80%",
            current: "0%",
            status: "Not Started",
          },
        ],
      },
    ],
  },

  // Fade Plan
  "aria-fade-plan": {
    currentPhase: "Phase 1 (Intensive)",
    phases: [
      {
        phase: "Phase 1 (Intensive)",
        hours: 25,
        duration: "6 months",
        criteria: "70% of STOs mastered, challenging behaviors reduced by 50%",
      },
      {
        phase: "Phase 2 (Moderate)",
        hours: 18,
        duration: "6 months",
        criteria: "85% of STOs mastered, generalization across 2 settings",
      },
      {
        phase: "Phase 3 (Maintenance)",
        hours: 10,
        duration: "6 months",
        criteria: "95% of STOs mastered, parent fidelity at 90%",
      },
    ],
    dischargeCriteria: [
      { criterion: "Vineland-3 ABC Standard Score", target: "≥80", current: "68", status: "not-met" },
      { criterion: "SRS-2 Total T-Score", target: "≤65", current: "76", status: "not-met" },
      { criterion: "All LTGs at mastery criteria", target: "100%", current: "0%", status: "not-met" },
      { criterion: "Parent implementation fidelity", target: "≥90%", current: "N/A", status: "not-met" },
      { criterion: "Skills maintained for 90 days", target: "Yes", current: "N/A", status: "not-met" },
    ],
    narrative: "",
  },

  // Barriers
  "aria-barriers": {
    selectedBarriers: ["Work schedule conflicts", "Transportation issues", "Sibling care needs"],
    otherBarrier: "",
    howAddressed:
      "Flexible scheduling options will be offered including evening and weekend sessions to accommodate parent work schedules. Telehealth services will supplement in-person visits when transportation is limited. Sibling inclusion strategies will be incorporated into parent training to address childcare needs during sessions.",
  },

  // Generalization
  "aria-generalization": {
    selectedStrategies: [
      "Train loosely (vary instructions, materials, settings)",
      "Use multiple exemplars",
      "Natural environment training (NET)",
      "Parent training for skill generalization",
      "Peer-mediated interventions",
    ],
    settings: ["Home", "Clinic", "School", "Community"],
    people: ["Parents", "Siblings", "Teachers", "Therapists", "Peers"],
    otherStrategy: "",
    narrative:
      "Skills will be systematically taught across multiple settings including home, clinic, school, and community environments. Training will incorporate varied materials, instructions, and communication partners to promote stimulus generalization. Parents will receive training on prompting and reinforcement strategies to facilitate skill use in natural contexts. Peer-mediated interventions will be implemented to promote social skill generalization with same-age peers.",
  },

  // Service Schedule
  "aria-service-schedule": {
    weeklySchedule: {
      Monday: { "97153": 4, "97155": 0.5 },
      Tuesday: { "97153": 4, "97155": 0.5 },
      Wednesday: { "97153": 4, "97156": 1 },
      Thursday: { "97153": 4, "97155": 0.5 },
      Friday: { "97153": 4, "97155": 0.5 },
    },
    totalHours: {
      "97153": 20,
      "97155": 2,
      "97156": 2,
      "97155HN": 0,
      "97156HN": 1,
    },
    grandTotal: 25,
    duration: "12 months",
    startDate: "2026-02-01",
    authorizationPeriod: "2026-02-01 to 2027-01-31",
  },

  // CPT Authorization
  "aria-cpt-authorization": {
    justification:
      "Based on the severity of Marcus's deficits in communication, social interaction, and adaptive behavior, intensive ABA services are medically necessary. The Vineland-3 Adaptive Behavior Composite of 68 places Marcus more than 2 standard deviations below the mean, indicating significant impairment in daily functioning. The SRS-2 Total T-Score of 76 indicates severe social communication deficits consistent with his autism diagnosis. Standardized assessment results from the ABLLS-R demonstrate significant skill deficits across all domains, particularly in language, social interaction, and play skills. The proposed 25 hours per week of direct therapy will address these deficits through evidence-based interventions including discrete trial training, natural environment teaching, and functional communication training. Parent training and BCBA supervision will ensure treatment fidelity and promote generalization of skills to natural environments.",
    requestedHours: {
      "97153": {
        hours: 20,
        justification: "Direct 1:1 behavior technician services for skill acquisition and behavior reduction",
      },
      "97155": { hours: 2, justification: "BCBA supervision, treatment modification, and caregiver consultation" },
      "97156": { hours: 2, justification: "Caregiver training on ABA strategies for home implementation" },
      "97156HN": { hours: 1, justification: "Group parent training sessions" },
    },
  },

  // Parent Training
  "aria-parent-training-data": {
    sessions: [
      {
        date: "2026-02-15",
        topic: "Introduction to ABA",
        duration: 60,
        attendees: ["Sarah Johnson", "Michael Johnson"],
        competency: "Introduced",
      },
      {
        date: "2026-02-22",
        topic: "Reinforcement strategies",
        duration: 60,
        attendees: ["Sarah Johnson"],
        competency: "Emerging",
      },
    ],
    goals: [
      { goal: "Implement token economy at home", status: "In Progress", fidelity: 65 },
      { goal: "Use visual schedule for transitions", status: "In Progress", fidelity: 70 },
      { goal: "Apply first-then contingencies", status: "Not Started", fidelity: 0 },
    ],
  },

  // Medical Necessity
  "aria-medical-necessity": {
    generated: true,
    content:
      "Marcus Johnson, a 5-year-old male diagnosed with Autism Spectrum Disorder (F84.0), Level 2, requires intensive Applied Behavior Analysis (ABA) therapy to address significant deficits in communication, social interaction, and adaptive behavior that substantially impact his daily functioning and development.\n\nStandardized assessment results demonstrate the medical necessity of proposed services. The Vineland-3 Adaptive Behavior Composite score of 68 places Marcus more than 2 standard deviations below the mean, indicating significant adaptive impairment. Domain scores reveal particular deficits in Communication (65) and Socialization (62). The SRS-2 Total T-Score of 76 indicates severe autism-related social impairment, with elevated scores in Social Cognition (78) and Restricted Interests (82).\n\nFunctional behavior assessment through ABC data collection reveals that challenging behaviors, primarily tantrums during transitions, are maintained by escape from non-preferred activities. These behaviors occur an average of 8 times daily and significantly impair Marcus's ability to participate in educational and family activities.\n\nThe proposed treatment plan includes 25 hours per week of comprehensive ABA services targeting communication, social skills, and behavior reduction. This intensity is supported by research indicating that children with autism who receive 25-40 hours per week of intensive ABA demonstrate significant improvements in adaptive behavior and reductions in autism symptoms. The treatment plan includes specific, measurable goals with short-term objectives to track progress and demonstrate medical necessity for continued services.",
  },

  // Assessment Type
  "aria-assessment-type": "initial",

  // Set all sections as complete for demo
  "aria-sections-complete": {
    clientInfo: true,
    backgroundHistory: true,
    reasonForReferral: true,
    standardizedAssessments: true,
    abcObservations: true,
    riskAssessment: true,
    goalBank: true,
    goalsTracker: true,
    interventions: true,
    teachingProtocols: true,
    parentTraining: true,
    serviceSchedule: true,
    medicalNecessity: true,
    cptAuthorization: true,
    fadePlan: true,
    barriersGeneralization: true,
    consentForms: true,
  },
}
