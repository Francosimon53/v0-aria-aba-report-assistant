/**
 * Complete test assessment data for E2E validation.
 *
 * Usage (browser console):
 *   1. Copy the STORAGE_ENTRIES object below
 *   2. In DevTools console on the ARIA app:
 *      Object.entries(STORAGE_ENTRIES).forEach(([k,v]) => localStorage.setItem(k, JSON.stringify(v)))
 *   3. Navigate to /assessment/report or /demo/generate-report
 *
 * This covers all 11 canonical storage keys defined in lib/assessment-storage.ts.
 */

export const STORAGE_ENTRIES: Record<string, unknown> = {
  // ─── Step 1: Client Info ───────────────────────────────────────────
  "aria-client-info": {
    data: {
      firstName: "Maria",
      lastName: "Rodriguez",
      dateOfBirth: "2021-03-15",
      age: 5,
      gender: "Female",
      primaryDiagnosis: "Autism Spectrum Disorder, Level 2",
      icd10Code: "F84.0",
      address: "4521 Maple Avenue, Miami, FL 33133",
      caregiver: "Rosa Rodriguez (Mother)",
      phone: "(305) 555-0142",
      schoolPlacement: "Sunshine Academy, Pre-K inclusion classroom",
      referralSource: "Dr. Elena Vasquez, Developmental Pediatrician",
      referralDate: "2026-01-10",
      providerName: "Bright Futures ABA Services",
      providerPhone: "(305) 555-0200",
      insuranceProvider: "UnitedHealthcare",
      insuranceId: "UHC-9876543210",
      bcbaName: "Dr. Sarah Thompson, BCBA",
      bcbaLicense: "#1-23-45678",
      bcbaEmail: "s.thompson@brightfuturesaba.com",
      npiNumber: "1234567890",
    },
    savedAt: new Date().toISOString(),
    version: "1.0",
  },

  // ─── Step 2: Background History ────────────────────────────────────
  "aria-background-history": {
    data: {
      developmental:
        "Maria was born full-term at 38 weeks via uncomplicated vaginal delivery. Birth weight was 7 lbs 2 oz. She sat independently at 7 months, walked at 14 months. First words emerged at 18 months but language development plateaued around 24 months. She currently uses approximately 50 single words and 10-15 two-word combinations. Fine motor milestones were generally on track; she began using a pincer grasp at 10 months.",
      medical:
        "Maria was diagnosed with ASD Level 2 at age 3 by Dr. Elena Vasquez following an ADOS-2 evaluation. She has no known allergies, no seizure history, and is not currently on any medications. Vision and hearing screenings were within normal limits (January 2026). She has a history of chronic ear infections in infancy (3 episodes before age 2), which resolved without surgical intervention.",
      educational:
        "Maria is currently enrolled in a Pre-K inclusion classroom at Sunshine Academy (5 half-days per week). She receives speech-language therapy 2x/week (30 min sessions) and occupational therapy 1x/week (45 min sessions) through the school district. Her IEP includes goals for expressive language, social interaction, and fine motor skills. Teacher reports indicate Maria participates in structured activities with adult prompting but struggles during unstructured peer play.",
      family:
        "Maria lives with her mother Rosa Rodriguez (age 32), father Carlos Rodriguez (age 35), and older brother Diego (age 8). Spanish is the primary language spoken at home; Maria is exposed to English at school. Rosa is the primary caregiver and is highly motivated to support Maria's development. The family reports that Maria's challenging behaviors (tantrums, elopement) are most frequent during transitions and when preferred items are removed.",
      previousTreatments:
        "Maria received Early Intervention services (Birth-3 program) from ages 2-3, including developmental therapy 1x/week and speech therapy 1x/week. She participated in a social skills group at the local children's hospital for 8 weeks (Summer 2025). No previous ABA services.",
      strengths:
        "Maria demonstrates strong visual-spatial skills, enjoys puzzles and shape sorters, shows affection toward family members, and has emerging imitation skills. She is motivated by music, bubbles, and iPad time. She can follow 1-step instructions with visual supports.",
      weaknesses:
        "Significant delays in expressive and receptive language, limited social reciprocity with peers, difficulty with transitions, restricted and repetitive behaviors (hand flapping, lining up objects), limited pretend play skills, and challenges with self-care tasks (toileting, dressing).",
      dailySchedule:
        "Wake 7:00 AM, breakfast 7:30, school 8:30-12:30, lunch 12:45, nap 1:30-3:00, free play 3:00-4:30, therapy sessions (variable), dinner 6:00, bath 7:00, bedtime routine 7:30-8:00 PM.",
    },
    savedAt: new Date().toISOString(),
    version: "1.0",
  },

  // ─── Step 3: Assessment Data ───────────────────────────────────────
  "aria-assessment-data": {
    data: {
      tools: ["VB-MAPP", "ABLLS-R", "Vineland-3", "AFLS"],
      dates: "January 15-22, 2026",
      settings: "Home and clinic settings, with caregiver and therapist present",
      assessmentType: "initial",
      vbmapp: {
        mand: { level: 1, score: 4 },
        tact: { level: 1, score: 3 },
        listener: { level: 1, score: 5 },
        vp_mts: { level: 1, score: 3 },
        play: { level: 1, score: 2 },
        social: { level: 1, score: 2 },
        imitation: { level: 1, score: 4 },
        echoic: { level: 1, score: 3 },
        spontaneous: { level: 1, score: 1 },
        group: { level: 1, score: 1 },
        linguistics: { level: 1, score: 2 },
        math: { level: 1, score: 1 },
      },
      vineland: {
        communication: { standard: 68, percentile: 2, ageEquivalent: "2:6" },
        dailyLiving: { standard: 72, percentile: 3, ageEquivalent: "3:0" },
        socialization: { standard: 65, percentile: 1, ageEquivalent: "2:3" },
        motorSkills: { standard: 85, percentile: 16, ageEquivalent: "4:0" },
        adaptiveBehaviorComposite: { standard: 70, percentile: 2 },
      },
    },
    savedAt: new Date().toISOString(),
    version: "1.0",
  },

  // ─── Step 4: ABC Observations ──────────────────────────────────────
  "aria-abc-observations": {
    data: [
      {
        id: "abc-1",
        dateTime: "2026-01-16T10:30:00",
        setting: "Clinic — structured table activity",
        antecedent:
          "Therapist presented a non-preferred task (matching activity) and provided verbal instruction to sit down.",
        behavior:
          "Maria threw the matching cards on the floor, dropped to the ground, and began crying and screaming for approximately 3 minutes.",
        consequence:
          "Therapist removed the task materials and provided a 30-second break before re-presenting the demand with visual support.",
        function: "Escape/Avoidance",
        severity: "Moderate",
        duration: "3 minutes",
        notes:
          "Behavior escalated when therapist attempted to physically guide Maria back to the chair.",
      },
      {
        id: "abc-2",
        dateTime: "2026-01-17T14:15:00",
        setting: "Home — living room during free play",
        antecedent:
          "Mother told Maria it was time to turn off the iPad and come to the table for a snack.",
        behavior:
          "Maria screamed 'No!', threw the iPad on the couch, and ran to the corner of the room. She engaged in hand flapping and began hitting herself on the thighs.",
        consequence:
          "Mother allowed Maria to keep the iPad for 2 more minutes, then used a visual timer to transition.",
        function: "Tangible/Access",
        severity: "Moderate-Severe",
        duration: "5 minutes",
        notes:
          "Self-injurious behavior (thigh hitting) occurred 4 times during the episode. No marks or bruising observed.",
      },
      {
        id: "abc-3",
        dateTime: "2026-01-18T09:45:00",
        setting: "Clinic — group activity with 2 peers",
        antecedent:
          "Peers were engaged in a cooperative block-building activity. Therapist prompted Maria to join and hand blocks to a peer.",
        behavior:
          "Maria walked away from the group, went to the corner, and began lining up toy cars. When redirected, she pushed the therapist's hand away and vocalized 'ah ah ah' repetitively.",
        consequence:
          "Therapist provided parallel play setup next to peers with preferred materials (cars) and gradually introduced turn-taking with a peer.",
        function: "Escape/Avoidance",
        severity: "Mild",
        duration: "8 minutes (until redirected to parallel play)",
        notes:
          "Maria tolerated parallel play with cars for 4 minutes before independently moving closer to a peer.",
      },
    ],
    savedAt: new Date().toISOString(),
    version: "1.0",
  },

  // Also save to the auto-save context key that abc-observation.tsx uses
  "aria-assessment-abc-observations": {
    data: [
      {
        id: "abc-1",
        dateTime: "2026-01-16T10:30:00",
        setting: "Clinic — structured table activity",
        antecedent:
          "Therapist presented a non-preferred task (matching activity) and provided verbal instruction to sit down.",
        behavior:
          "Maria threw the matching cards on the floor, dropped to the ground, and began crying and screaming for approximately 3 minutes.",
        consequence:
          "Therapist removed the task materials and provided a 30-second break before re-presenting the demand with visual support.",
        function: "Escape/Avoidance",
        severity: "Moderate",
        duration: "3 minutes",
      },
      {
        id: "abc-2",
        dateTime: "2026-01-17T14:15:00",
        setting: "Home — living room during free play",
        antecedent:
          "Mother told Maria it was time to turn off the iPad and come to the table for a snack.",
        behavior:
          "Maria screamed 'No!', threw the iPad on the couch, and ran to the corner of the room. She engaged in hand flapping and began hitting herself on the thighs.",
        consequence:
          "Mother allowed Maria to keep the iPad for 2 more minutes, then used a visual timer to transition.",
        function: "Tangible/Access",
        severity: "Moderate-Severe",
        duration: "5 minutes",
      },
      {
        id: "abc-3",
        dateTime: "2026-01-18T09:45:00",
        setting: "Clinic — group activity with 2 peers",
        antecedent:
          "Peers were engaged in a cooperative block-building activity. Therapist prompted Maria to join and hand blocks to a peer.",
        behavior:
          "Maria walked away from the group, went to the corner, and began lining up toy cars. When redirected, she pushed the therapist's hand away.",
        consequence:
          "Therapist provided parallel play setup next to peers with preferred materials.",
        function: "Escape/Avoidance",
        severity: "Mild",
        duration: "8 minutes",
      },
    ],
    timestamp: new Date().toISOString(),
  },

  // ─── Step 5: Risk Assessment ───────────────────────────────────────
  "aria-risk-assessment": {
    data: {
      extinctionBurst:
        "During extinction procedures for tantrum behavior, an initial increase in frequency and intensity is anticipated. Maria may exhibit louder vocalizations, increased physical aggression (throwing objects, pushing), and self-injurious behavior (thigh hitting) for approximately 1-2 weeks before a decrease is observed.",
      safetyProtocols:
        "1. Clear the immediate area of hard/throwable objects during escalation. 2. Maintain calm, neutral affect. 3. Block self-injurious behavior using least restrictive physical guidance. 4. Implement a 'safe space' protocol — redirect Maria to a designated calming corner with sensory items. 5. Document all incidents of SIB using the ABC data sheet. 6. If SIB exceeds 10 instances in a session or results in visible marks, contact BCBA immediately.",
      emergencyContacts:
        "Rosa Rodriguez (Mother): (305) 555-0142 | Carlos Rodriguez (Father): (305) 555-0143 | Dr. Elena Vasquez (Pediatrician): (305) 555-0300 | Crisis Hotline: 988",
      severityRatings: {
        aggression: "Moderate — pushes, throws objects; no injury to others observed",
        selfInjury: "Moderate — thigh hitting, 4-6 instances per episode; no lasting marks",
        elopement: "Mild — runs to another room; does not attempt to leave building",
        propertyDestruction: "Mild — throws lightweight items (cards, small toys)",
      },
      crisisPlan:
        "If Maria's self-injurious behavior results in visible injury or if tantrum exceeds 15 minutes continuously: 1) Implement full environmental safety protocol 2) Contact BCBA 3) Contact caregiver 4) Document with photos if appropriate and consented 5) Conduct post-incident debrief within 24 hours.",
    },
    savedAt: new Date().toISOString(),
    version: "1.0",
  },

  // ─── Step 6: Goals ─────────────────────────────────────────────────
  "aria-goals": [
    {
      id: "g1",
      type: "skill_acquisition",
      domain: "Communication — Manding",
      shortTerm:
        "Maria will independently mand (request) for 10 different preferred items/activities using vocal words or PECS across 3 consecutive sessions with 80% accuracy.",
      longTerm:
        "Maria will use 2-3 word mand frames (e.g., 'I want [item]', 'More [activity]') across 5 different environments with 80% independence.",
      baseline: "Currently mands for 3 items with vocal approximations; requires gestural prompts for remaining requests.",
      target: "10 independent vocal mands across 3 consecutive sessions",
      stos: [
        "STO 1: Maria will mand for 5 items with vocal word or approximation with no more than 1 gestural prompt in 4/5 opportunities.",
        "STO 2: Maria will mand for 8 items independently in 4/5 opportunities across 2 settings.",
        "STO 3: Maria will mand for 10 items independently in 4/5 opportunities across 3 consecutive sessions.",
      ],
    },
    {
      id: "g2",
      type: "skill_acquisition",
      domain: "Social Skills — Peer Interaction",
      shortTerm:
        "Maria will engage in reciprocal play with a peer (turn-taking, sharing materials) for at least 3 minutes with no more than 1 verbal prompt during 4/5 opportunities.",
      longTerm:
        "Maria will independently initiate and sustain cooperative play with peers for 10+ minutes across school and community settings.",
      baseline: "Currently engages in solitary play; avoids peer proximity; tolerates parallel play for <1 minute.",
      target: "3 minutes of reciprocal play with 1 verbal prompt max",
    },
    {
      id: "g3",
      type: "skill_acquisition",
      domain: "Adaptive — Daily Living Skills",
      shortTerm:
        "Maria will independently complete a 3-step hand-washing routine (wet hands, apply soap, rinse) with visual schedule support in 4/5 opportunities.",
      longTerm:
        "Maria will independently complete morning and evening self-care routines (hand washing, tooth brushing, dressing) with 90% independence.",
      baseline: "Requires full physical prompting for all steps of hand washing. Does not initiate self-care tasks.",
      target: "Independent completion with visual schedule in 4/5 opportunities",
    },
    {
      id: "g4",
      type: "skill_acquisition",
      domain: "Communication — Tacting",
      shortTerm:
        "Maria will tact (label) 20 common objects and 5 actions when presented with the stimulus in 4/5 opportunities across 2 consecutive sessions.",
      longTerm:
        "Maria will spontaneously tact objects, actions, and adjectives in natural environment with 80% accuracy.",
      baseline: "Currently tacts 8 common objects; does not tact actions or adjectives.",
      target: "20 objects + 5 actions in 4/5 opportunities",
    },
    {
      id: "g5",
      type: "behavior_reduction",
      domain: "Behavior Reduction — Tantrum Behavior",
      shortTerm:
        "Maria's tantrum episodes (screaming, crying, throwing objects, dropping to floor) will decrease from a baseline of 8 episodes/day to no more than 3 episodes/day across 5 consecutive data days.",
      longTerm: "Tantrum episodes will occur no more than 1x/day with duration under 1 minute.",
      baseline: "Average 8 tantrum episodes per day, lasting 3-5 minutes each. Primary functions: escape and tangible.",
      target: "3 or fewer episodes per day across 5 consecutive days",
    },
    {
      id: "g6",
      type: "behavior_reduction",
      domain: "Behavior Reduction — Self-Injurious Behavior",
      shortTerm:
        "Maria's self-injurious behavior (thigh hitting) will decrease from a baseline of 4-6 instances per tantrum episode to 0-1 instances per episode across 5 consecutive data days.",
      longTerm: "SIB will be eliminated (0 instances for 20 consecutive data days).",
      baseline: "4-6 instances of thigh hitting per tantrum episode; occurs during 60% of tantrum episodes.",
      target: "0-1 instances per episode across 5 consecutive days",
    },
  ],

  // ─── Step 7: Interventions ─────────────────────────────────────────
  "aria-interventions": {
    data: [
      {
        id: "int-1",
        name: "Discrete Trial Training (DTT)",
        description:
          "Structured teaching method using clear discriminative stimuli, prompting hierarchies, and systematic reinforcement to teach new skills.",
        linkedGoals: ["g1", "g4"],
        setting: "Clinic — structured table activities",
        frequency: "Daily, 30-minute sessions",
      },
      {
        id: "int-2",
        name: "Natural Environment Teaching (NET)",
        description:
          "Capitalizes on naturally occurring learning opportunities to teach and generalize skills in the child's everyday environment.",
        linkedGoals: ["g1", "g2", "g3"],
        setting: "Home and community settings",
        frequency: "Daily, embedded throughout ABA sessions",
      },
      {
        id: "int-3",
        name: "Functional Communication Training (FCT)",
        description:
          "Teaches functionally equivalent replacement behaviors (e.g., requesting a break, asking for items) to reduce challenging behaviors.",
        linkedGoals: ["g1", "g5", "g6"],
        setting: "All settings",
        frequency: "Continuous — embedded in all interactions",
      },
      {
        id: "int-4",
        name: "Visual Supports & Schedules",
        description:
          "Use of visual activity schedules, first-then boards, and visual timers to increase predictability and support transitions.",
        linkedGoals: ["g3", "g5"],
        setting: "Home, clinic, and school",
        frequency: "Throughout daily routine",
      },
      {
        id: "int-5",
        name: "Differential Reinforcement of Alternative Behavior (DRA)",
        description:
          "Reinforcement of appropriate alternative behaviors while placing challenging behaviors on extinction.",
        linkedGoals: ["g5", "g6"],
        setting: "All settings",
        frequency: "Continuous during all ABA sessions",
      },
    ],
    savedAt: new Date().toISOString(),
    version: "1.0",
  },

  // Also save to the auto-save variant key
  "aria-assessment-selected-interventions": {
    data: [
      {
        id: "int-1",
        name: "Discrete Trial Training (DTT)",
        linkedGoals: ["g1", "g4"],
      },
      {
        id: "int-2",
        name: "Natural Environment Teaching (NET)",
        linkedGoals: ["g1", "g2", "g3"],
      },
      {
        id: "int-3",
        name: "Functional Communication Training (FCT)",
        linkedGoals: ["g1", "g5", "g6"],
      },
    ],
    timestamp: new Date().toISOString(),
  },

  // ─── Step 8: Teaching Protocols ────────────────────────────────────
  "aria-teaching-protocols": {
    data: [
      {
        goalId: "g1",
        goalTitle: "Manding — 10 Independent Vocal Mands",
        trialFormat: "DTT + NET hybrid",
        promptHierarchy: [
          "Full verbal model",
          "Partial verbal model (first sound)",
          "Gestural prompt (point to item)",
          "Time delay (5 seconds)",
          "Independent",
        ],
        reinforcementSchedule:
          "CRF during acquisition; thin to VR-3 during maintenance. Use the requested item as natural reinforcer + social praise.",
        errorCorrection:
          "4-step error correction: Model → Lead → Test → Retest at next opportunity",
        masteryLevel: "4/5 independent correct across 3 consecutive sessions",
        generalization:
          "Probe across 3 settings (clinic, home, community), 2 people (therapist, caregiver), and with novel exemplars.",
        dataCollection: "Trial-by-trial data on prompt level and correct/incorrect per mand target",
      },
      {
        goalId: "g2",
        goalTitle: "Peer Interaction — Reciprocal Play",
        trialFormat: "Structured peer play sessions (NET)",
        promptHierarchy: [
          "Full physical + verbal (hand-over-hand with narration)",
          "Partial physical (gentle guide at elbow)",
          "Gestural (point to peer/material)",
          "Verbal only ('Give the block to [peer]')",
          "Independent",
        ],
        reinforcementSchedule:
          "Social praise + access to preferred activity after play session. Peer receives reinforcement for participation.",
        masteryLevel: "3+ minutes reciprocal play with ≤1 verbal prompt in 4/5 sessions",
        dataCollection: "Duration of engagement + prompt level + initiations count",
      },
    ],
    savedAt: new Date().toISOString(),
    version: "1.0",
  },

  // ─── Step 9: Parent Training ───────────────────────────────────────
  "aria-parent-training-data": {
    data: {
      caregiverGoals: [
        {
          id: "pt-1",
          area: "Implementing FCT during tantrum episodes",
          baseline:
            "Rosa currently provides verbal reasoning during tantrums and occasionally gives in to demands. She reports feeling unsure about when to hold limits.",
          target:
            "Rosa will implement the FCT protocol (prompt replacement behavior, reinforce appropriate request, maintain extinction for tantrum) with 80% fidelity across 3 consecutive home observations.",
          strategies: [
            "BST (Behavioral Skills Training) for FCT steps",
            "Video modeling of correct implementation",
            "In-vivo coaching during home sessions",
          ],
        },
        {
          id: "pt-2",
          area: "Using visual schedules and transition supports",
          baseline:
            "Family does not currently use visual supports. Transitions are managed with verbal warnings which are inconsistently effective.",
          target:
            "Rosa will independently prepare and use visual activity schedules and first-then boards for 3+ daily transitions with 90% consistency over 2 weeks.",
          strategies: [
            "Create personalized visual schedule using photos of Maria's actual routines",
            "Practice with role-play during parent training sessions",
            "Provide laminated templates for home use",
          ],
        },
        {
          id: "pt-3",
          area: "Embedding language opportunities in daily routines",
          baseline:
            "Rosa reports that she often anticipates Maria's needs and provides items before Maria requests them.",
          target:
            "Rosa will create 10+ daily manding opportunities by arranging the environment (items out of reach, closed containers, missing items) and waiting 5 seconds for a vocal request before providing assistance.",
          strategies: [
            "Environmental arrangement training",
            "Incidental teaching techniques",
            "Tracking manding opportunities on daily log",
          ],
        },
      ],
      sessionFrequency: "2x/month caregiver training sessions (CPT 97156), 45-60 minutes each",
      format: "In-home, with Maria present for in-vivo practice",
    },
    savedAt: new Date().toISOString(),
    version: "1.0",
  },

  // ─── Step 10: Service Schedule ─────────────────────────────────────
  "aria-service-schedule": {
    data: {
      totalWeeklyHours: 25,
      intensityLevel: "Comprehensive",
      duration: "12 months (reassessment at 6 months)",
      cptCodes: [
        {
          code: "97153",
          description: "Adaptive Behavior Treatment by Protocol — RBT Direct",
          unitsPerWeek: 80,
          hoursPerWeek: 20,
          location: "Home/Community",
        },
        {
          code: "97155",
          description: "Adaptive Behavior Treatment Modification — BCBA Supervision",
          unitsPerWeek: 12,
          hoursPerWeek: 3,
          location: "Home/Clinic",
        },
        {
          code: "97156",
          description: "Family Adaptive Behavior Treatment Guidance — Parent Training",
          unitsPerWeek: 8,
          hoursPerWeek: 2,
          location: "Home",
        },
      ],
      schedule: {
        monday: "3:00-6:00 PM — RBT direct (Home)",
        tuesday: "3:00-6:00 PM — RBT direct (Home)",
        wednesday: "3:00-6:00 PM — RBT direct (Home) + BCBA overlap 4:00-5:00",
        thursday: "3:00-6:00 PM — RBT direct (Community)",
        friday: "3:00-5:00 PM — RBT direct (Home) + Parent Training 5:00-6:00",
        saturday: "9:00 AM-12:00 PM — RBT direct (Community/Social skills)",
      },
      rationale:
        "25 hours/week comprehensive ABA is recommended based on Maria's ASD Level 2 diagnosis, significant deficits in communication and socialization (Vineland-3 ABC: 70), and presence of challenging behaviors requiring systematic intervention. This intensity aligns with BACB practice guidelines for early intensive behavioral intervention.",
    },
    savedAt: new Date().toISOString(),
    version: "1.0",
  },

  // ─── Step 11: Medical Necessity ────────────────────────────────────
  "aria-medical-necessity": {
    data: {
      justification:
        "Maria Rodriguez, age 5, meets medical necessity criteria for comprehensive ABA services (25 hours/week) based on the following clinical indicators: (1) Diagnosis of Autism Spectrum Disorder, Level 2 (F84.0), requiring substantial support; (2) Vineland-3 Adaptive Behavior Composite standard score of 70 (2nd percentile), indicating significant adaptive functioning deficits; (3) VB-MAPP scores at Level 1 across all skill areas, demonstrating delays of 2-3 years below chronological age; (4) Presence of challenging behaviors (tantrums 8x/day, self-injurious behavior) that interfere with learning and daily functioning; (5) Limited access to peer interaction and play skills that impede social development.",
      impairmentScores: {
        vinelandABC: 70,
        communicationStandard: 68,
        socializationStandard: 65,
        vbmappHighestLevel: 1,
      },
      medicallyNecessaryCriteria: [
        "ASD Level 2 diagnosis confirmed by licensed developmental pediatrician",
        "Standardized assessment scores 2+ standard deviations below the mean",
        "Functional behavior assessment identifies operant functions maintaining challenging behaviors",
        "Behaviors pose risk to safety (self-injurious behavior documented)",
        "Previous less intensive interventions (Early Intervention, school-based services) insufficient to address skill deficits",
        "Caregiver requires training to implement behavior support strategies",
      ],
      treatmentGoals:
        "Reduce challenging behaviors, increase functional communication, develop social skills, and improve adaptive daily living skills to promote independence and community participation.",
    },
    savedAt: new Date().toISOString(),
    version: "1.0",
  },
}
