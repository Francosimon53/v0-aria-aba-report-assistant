// Sample assessment data for preview/demo purposes
// Based on a realistic ABA assessment case

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
    developmental: `Marcus was born full-term at 39 weeks via uncomplicated vaginal delivery. Birth weight was 7 lbs, 4 oz. According to parental report, early developmental milestones were met within normal limits until approximately 18 months of age when parents noted regression in previously acquired language skills. Marcus had approximately 15-20 single words at 15 months, which decreased to fewer than 5 words by 24 months.

Gross motor development has been within normal limits, with Marcus walking independently at 13 months. Fine motor skills show some delays, particularly in activities requiring bilateral coordination and precise grasp patterns. Marcus received Early Intervention services from age 2 to 3, including speech therapy (2x/week) and occupational therapy (1x/week).

Current developmental presentation indicates significant delays in expressive and receptive language, social communication, and adaptive behavior skills. Cognitive testing conducted at age 4 indicated nonverbal cognitive abilities in the average range (Standard Score: 95) with verbal abilities in the below-average range (Standard Score: 72).`,

    medical: `Medical History:
- Diagnosed with Autism Spectrum Disorder at age 2.5 years by developmental pediatrician (Dr. Robert Chen, Miami Children's Hospital)
- No significant medical conditions or hospitalizations
- No known drug allergies (NKDA)
- Up-to-date on immunizations
- Vision and hearing screenings within normal limits (last screened: January 2024)
- Sleep difficulties reported (average 6-7 hours per night with frequent night wakings)
- Diet is limited to approximately 12 preferred foods; parents report concerns about nutritional intake

Current Medications:
- Melatonin 3mg at bedtime (for sleep initiation)
- Daily multivitamin

Family Medical History:
- Paternal uncle diagnosed with ADHD
- Maternal grandmother with anxiety disorder
- No family history of seizure disorders or genetic conditions`,

    educational: `Marcus currently attends Sunshine Academy, a private pre-K program with an integrated special education classroom. He receives the following school-based services:
- Speech-Language Therapy: 2x/week, 30 minutes individual
- Occupational Therapy: 1x/week, 30 minutes individual
- Special Education Support: Full-time in self-contained classroom (8 students, 1 teacher, 2 aides)

Academic performance indicates pre-academic skills at approximately 3-year level. Marcus can identify 10 letters by name, counts to 5 with 1:1 correspondence, and recognizes his written name. He requires significant support for all classroom transitions and group activities.

Previous Educational History:
- Early Intervention Services (ages 2-3): Speech therapy, OT, developmental therapy
- Florida Early Steps Program graduate (2022)`,

    family: `Marcus lives with both parents and his 8-year-old sister, Aaliyah, in a single-family home. Both parents work full-time; father is an accountant and mother is a registered nurse with a flexible schedule. Maternal grandmother provides childcare support 2-3 days per week.

Family Strengths:
- Strong parental involvement and advocacy
- Consistent home environment
- Supportive extended family network
- Parents have attended multiple ABA parent training workshops
- Family actively participates in autism support community

Family Challenges:
- Managing behaviors during community outings
- Sibling relationship building (Aaliyah reports frustration with Marcus's behaviors)
- Work-life balance with therapy schedules
- Financial strain from therapy copays`,

    previousTreatments: `Marcus has received the following interventions:

1. ABA Therapy (Ages 3-4): 15 hours/week with ABC Behavioral Services
   - Discontinued due to family relocation
   - Progress noted in receptive language and compliance
   - Mastered 50+ receptive instructions

2. Speech-Language Therapy: Ongoing since age 2
   - Currently using PECS (Picture Exchange Communication System) at Phase 4
   - Working on 2-word combinations

3. Occupational Therapy: Ongoing since age 2
   - Focus on fine motor skills, sensory regulation
   - Sensory diet implemented at home and school

4. Social Skills Group (Ages 4-5): 
   - 10-week group discontinued due to aggressive behaviors

5. Feeding Therapy (6 sessions):
   - Minimal progress; parents discontinued due to scheduling conflicts`,

    strengths: `- Strong visual learner with excellent visual discrimination skills
- Good gross motor abilities; enjoys physical activities
- Demonstrates affection toward family members
- High motivation for preferred items (iPad, Thomas trains, bubbles)
- Can sustain attention for preferred activities up to 20 minutes
- Emerging imitation skills with adult models
- Responds well to visual schedules and supports
- Shows interest in music and will attempt to sing familiar songs`,

    weaknesses: `- Limited functional communication (primarily uses PECS and some gestures)
- Significant social skill deficits; limited peer interaction
- Difficulty with transitions between activities
- Sensory sensitivities (auditory: fire alarms, hand dryers; tactile: certain textures)
- Restricted food preferences impacting nutrition
- Sleep difficulties affecting daytime regulation
- Aggressive behaviors when demands are placed or preferred items removed
- Limited play skills; primarily engages in repetitive/stereotypic play`,

    dailySchedule: `Typical Weekday:
6:30 AM - Wake up, morning routine (requires full physical prompting)
7:00 AM - Breakfast (limited to preferred foods)
7:30 AM - Travel to school
8:00 AM - School day begins
2:30 PM - School dismissal
3:00 PM - Snack, free play at home
4:00 PM - Therapy sessions (speech/OT on scheduled days)
5:30 PM - Dinner preparation, screen time
6:00 PM - Family dinner
6:30 PM - Bath time
7:00 PM - Bedtime routine (visual schedule)
7:30 PM - Target bedtime (actual sleep often delayed to 9:00+ PM)

Weekends:
- Morning routine similar but later wake time (7:30-8:00 AM)
- Community outings attempted 1-2x/weekend (often cut short due to behaviors)
- Visits with extended family
- Screen time is significantly increased on weekends`,
  },

  assessmentTools: [
    "Vineland Adaptive Behavior Scales, Third Edition (Vineland-3)",
    "Verbal Behavior Milestones Assessment and Placement Program (VB-MAPP)",
    "Autism Diagnostic Observation Schedule, Second Edition (ADOS-2)",
    "Functional Behavior Assessment (FBA)",
    "Preference Assessment (Multiple Stimulus Without Replacement)",
    "Skills Assessment (AFLS - Assessment of Functional Living Skills)",
    "Direct Observation across settings",
    "Parent and Teacher Interviews",
    "Review of Educational and Medical Records",
  ],

  assessmentDates: "October 15-22, 2024",

  observationSettings: "Home environment, Pre-K classroom at Sunshine Academy, Community setting (local grocery store)",

  domains: {
    communication: {
      level: "Significant Deficit",
      score: "Standard Score: 58 (Vineland-3 Communication Domain)",
      findings: `Receptive Language: Marcus demonstrates understanding of approximately 100 single words and can follow 1-step instructions with visual supports. He responds to his name 60% of opportunities and can identify common objects and family members when named. Multi-step instructions require breaking down with visual supports.

Expressive Language: Marcus primarily communicates using PECS (currently at Phase 4), exchanging picture cards for requests. He has approximately 20 spoken words used inconsistently, including "mama," "dada," "more," "no," and several object labels. Spontaneous verbal requests are rare (< 5/day). Marcus uses physical guidance (pulling adult's hand) and crying/screaming to communicate wants and needs when picture cards are unavailable.

Social Communication: Limited joint attention skills observed. Marcus will briefly follow point to proximal objects but rarely initiates joint attention to share interests. Eye contact is fleeting (1-2 seconds) and primarily for requests. Marcus does not yet engage in conversational turn-taking or respond to social bids from peers.`,
    },
    social: {
      level: "Significant Deficit",
      score: "Standard Score: 61 (Vineland-3 Socialization Domain)",
      findings: `Interpersonal Relationships: Marcus shows clear attachment to family members and will seek comfort from parents when distressed. He demonstrates limited interest in peers, engaging in parallel play without social interaction. When peers approach, Marcus typically moves away or continues with solitary activity.

Play and Leisure: Play skills are significantly limited. Marcus engages primarily in sensory-motor play (spinning wheels, lining up objects) and simple cause-effect toys. Pretend play is emerging but limited to single actions (feeding a doll). He does not yet engage in symbolic play or imagination-based activities. Preferred activities include iPad games, Thomas the Tank Engine videos, water play, and swinging.

Coping Skills: Marcus demonstrates difficulty regulating emotions, particularly during transitions and when denied access to preferred items. He uses limited self-calming strategies and relies on adult support for regulation. Emotional expressions are often intense (0-100 quickly) with limited gradation.`,
    },
    adaptive: {
      level: "Moderate Deficit",
      score: "Standard Score: 65 (Vineland-3 Daily Living Skills Domain)",
      findings: `Self-Care: Marcus requires significant support for all self-care routines. He can feed himself with a spoon (50% food to mouth) and drink from an open cup with some spilling. Dressing requires full physical assistance except for removing shoes and socks. Toilet training has not yet been initiated; Marcus wears pull-ups and shows no consistent signs of readiness.

Domestic Skills: Marcus can assist with simple household tasks when provided with hand-over-hand guidance, including placing items in trash and putting toys in bins. He does not yet complete any domestic tasks independently.

Community Skills: Safety awareness is significantly limited. Marcus does not respond consistently to safety commands (e.g., "stop," "hot," "danger"). He requires hand-holding or stroller/cart in all community settings. Marcus can identify some community helpers in pictures but does not demonstrate functional community skills.`,
    },
    behavior: {
      level: "Clinical Concern",
      score: "Requires intervention",
      findings: `Target Behaviors Identified:

1. Aggression: Hitting, kicking, scratching others (primarily caregivers)
   - Frequency: Average 8-12 episodes per day
   - Intensity: Mild to moderate (has caused scratches, minor bruises)
   - Duration: Episodes last 30 seconds to 3 minutes
   - Primary functions: Escape from demands, access to tangibles

2. Self-Injurious Behavior (SIB): Head hitting against surfaces, hand biting
   - Frequency: Average 3-5 episodes per day  
   - Intensity: Mild (no tissue damage observed)
   - Duration: Episodes last 10-30 seconds
   - Primary functions: Automatic reinforcement, escape from demands

3. Elopement: Running away from caregivers in community settings
   - Frequency: 2-3 attempts per community outing
   - Safety concern: High (no street safety awareness)
   - Primary function: Access to tangibles/preferred locations

4. Property Destruction: Throwing items, sweeping items off surfaces
   - Frequency: Average 5-7 episodes per day
   - Intensity: Mild to moderate
   - Primary functions: Escape from demands, attention`,
    },
    play: {
      level: "Significant Deficit",
      score: "VB-MAPP Play Skills: Level 1",
      findings: `Independent Play: Marcus engages in independent play for 5-10 minutes with highly preferred items (iPad, Thomas trains). Play is primarily repetitive/stereotypic, including lining up trains, spinning wheels, and rewatching the same video segments repeatedly.

Social Play: No cooperative play observed with peers. Marcus will briefly tolerate parallel play (2-3 minutes) if peers do not interfere with his materials. He does not initiate play interactions or respond to peer initiations.

Pretend Play: Emerging single-scheme pretend play observed (feeding doll, putting figurine in car). No multi-scheme sequences or symbolic substitutions observed. Marcus does not yet engage in role play or imagination-based scenarios.

Object Play: Strong preference for toys with cause-effect features (buttons, lights, sounds). Appropriate manipulation of play materials observed for simple toys; limited functional play with representational toys.`,
    },
    motor: {
      level: "Mild Deficit",
      score: "VB-MAPP Motor Imitation: Level 2",
      findings: `Gross Motor: Gross motor skills are generally age-appropriate. Marcus runs, jumps with both feet, climbs playground equipment, and kicks a ball. Balance and coordination are adequate for age. He enjoys physical activities including swinging, jumping on trampoline, and running games.

Fine Motor: Mild delays noted in fine motor precision and bilateral coordination. Marcus can stack 6+ blocks, string large beads with support, and scribble with crayons using a fisted grasp. He is not yet able to copy basic shapes or cut with scissors. Handwriting readiness skills are emerging.

Motor Imitation: Marcus imitates gross motor actions with models (clapping, stomping, arms up) at approximately 80% accuracy. Fine motor imitation (finger plays, pointing) is less consistent at approximately 50% accuracy. Oral motor imitation is limited.`,
    },
  },

  abcObservations: [
    {
      date: "10/15/2024",
      time: "9:15 AM",
      setting: "Home - Kitchen",
      antecedent: "Mother presented breakfast (scrambled eggs - non-preferred food) and removed iPad",
      behavior: "Marcus screamed, swept plate off table, hit mother's arm 3 times, fell to floor crying",
      consequence: "Mother removed eggs, provided preferred cereal, returned iPad after 5 minutes",
      function: "Escape from non-preferred demand / Access to tangibles",
      duration: "4 minutes",
      intensity: "Moderate",
    },
    {
      date: "10/15/2024",
      time: "2:45 PM",
      setting: "School - Classroom",
      antecedent: "Teacher instructed transition from free play to circle time; verbal countdown given",
      behavior: "Marcus dropped to floor, began head-hitting on carpet (5 hits), cried loudly",
      consequence: "Teacher aide provided 1:1 transition support with visual timer, delayed transition by 2 minutes",
      function: "Escape from demand / Delay of non-preferred activity",
      duration: "2 minutes",
      intensity: "Mild",
    },
    {
      date: "10/17/2024",
      time: "11:00 AM",
      setting: "Community - Grocery Store",
      antecedent: "Father said 'no' to candy in checkout aisle",
      behavior: "Marcus screamed, attempted to grab candy, ran 15 feet toward exit when blocked",
      consequence: "Father picked up Marcus, left store immediately, provided tablet in car",
      function: "Access to tangible / Escape from denied access",
      duration: "3 minutes",
      intensity: "Moderate-High",
    },
    {
      date: "10/18/2024",
      time: "4:30 PM",
      setting: "Home - Living Room",
      antecedent: "Sister Aaliyah changed TV channel from Thomas to her preferred show",
      behavior: "Marcus hit sister twice on arm, threw remote control at wall, began crying",
      consequence: "Mother intervened, returned Thomas video, sister sent to room",
      function: "Access to tangible (preferred video)",
      duration: "2 minutes",
      intensity: "Moderate",
    },
    {
      date: "10/20/2024",
      time: "10:30 AM",
      setting: "School - Playground",
      antecedent: "Peer approached Marcus at sandbox, attempted to share toys",
      behavior: "Marcus grabbed all toys, moved to corner of sandbox, pushed peer's hand away",
      consequence: "Peer left area; Marcus continued solitary play undisturbed",
      function: "Escape from social interaction / Maintain access to items",
      duration: "30 seconds",
      intensity: "Mild",
    },
  ],

  behaviors: [
    {
      name: "Physical Aggression",
      definition:
        "Any instance of forceful physical contact toward another person including but not limited to hitting (open or closed hand making contact with any body part), kicking (foot making contact with any body part), scratching (fingernails dragged across skin), biting (teeth making contact with skin), or pushing (using hands/arms to forcefully move another person). Excludes accidental contact during play or motor activities.",
      frequency: "8-12 episodes per day",
      duration: "30 seconds to 3 minutes per episode",
      intensity: "Mild to moderate (scratches, minor bruises)",
      antecedents: [
        "Demands placed",
        "Removal of preferred items",
        "Transition signals",
        "Denied access to tangibles",
        "Interruption of rituals/routines",
      ],
      consequences: ["Escape from demands", "Access to preferred items restored", "1:1 attention provided"],
      function: "Primarily escape-maintained with secondary tangible function",
      baseline: "Average 10.2 episodes per day across 5 observation days",
    },
    {
      name: "Self-Injurious Behavior (SIB)",
      definition:
        "Any instance of self-directed forceful contact including head-hitting (using hand or surface), hand-biting (teeth making contact with own hand/arm), or face-slapping (open hand contacting own face/head). Excludes accidental self-contact.",
      frequency: "3-5 episodes per day",
      duration: "10-30 seconds per episode",
      intensity: "Mild (no tissue damage, redness observed)",
      antecedents: ["High-demand situations", "Loud unexpected noises", "Denied access to items", "Changes in routine"],
      consequences: ["Removal of demands", "Sensory input", "Adult attention/comfort"],
      function: "Automatic reinforcement (sensory) and escape-maintained",
      baseline: "Average 4.1 episodes per day across 5 observation days",
    },
    {
      name: "Elopement",
      definition:
        "Any instance of leaving or attempting to leave the designated safe area or adult supervision without permission, including running away from caregivers in community settings, exiting rooms/buildings without authorization, or moving more than 10 feet from supervising adult without permission.",
      frequency: "2-3 attempts per community outing",
      duration: "Until physically blocked or retrieved",
      intensity: "High safety concern",
      antecedents: [
        "Community settings",
        "Preferred items/locations visible",
        "Transitions",
        "Low supervision moments",
      ],
      consequences: [
        "Access to preferred location/item",
        "Adult chase (attention)",
        "Immediate departure from setting",
      ],
      function: "Access to tangibles and preferred locations",
      baseline: "Average 2.5 attempts per community outing across 4 observations",
    },
  ],

  goals: [
    {
      domain: "Communication",
      type: "Skill Acquisition",
      longTermGoal:
        "Marcus will independently use a speech-generating device (SGD) or PECS to request desired items, activities, and actions across settings with 90% accuracy over 3 consecutive sessions.",
      shortTermObjectives: [
        "Marcus will exchange a single picture card to request a preferred item within 5 seconds of item being visible with 80% accuracy across 10 consecutive sessions.",
        "Marcus will discriminate between 2 picture cards to request the desired item with 80% accuracy across 10 consecutive sessions.",
        "Marcus will independently navigate to the correct page of communication book to make a request with 80% accuracy across 5 consecutive sessions.",
        "Marcus will use a 2-symbol phrase strip (I want + item) to make requests with 80% accuracy across 10 consecutive sessions.",
        "Marcus will spontaneously initiate requests using communication system without adult cue in 8 out of 10 opportunities across 3 consecutive sessions.",
      ],
      baseline: "Currently uses PECS Phase 4 with 60% accuracy for single card exchanges with verbal prompt",
      targetDate: "12 months from service initiation",
    },
    {
      domain: "Social Skills",
      type: "Skill Acquisition",
      longTermGoal:
        "Marcus will engage in reciprocal play interactions with peers for at least 5 minutes, including sharing materials and taking turns, across 3 different play activities with 80% independence.",
      shortTermObjectives: [
        "Marcus will tolerate a peer within 3 feet during parallel play for 3 minutes without moving away or displaying problem behavior in 8 out of 10 opportunities.",
        "Marcus will hand a requested item to a peer when asked with visual support in 8 out of 10 opportunities across 5 sessions.",
        "Marcus will take turns with a peer during a structured game with adult facilitation for 3 exchanges in 8 out of 10 opportunities.",
        "Marcus will initiate a play interaction with a peer using a visual script in 5 out of 10 opportunities across 5 sessions.",
        "Marcus will sustain reciprocal play with a peer for 5 minutes with no more than 1 adult prompt per minute across 3 consecutive sessions.",
      ],
      baseline: "Currently tolerates parallel play for < 2 minutes; no reciprocal play observed",
      targetDate: "12 months from service initiation",
    },
    {
      domain: "Behavior Reduction",
      type: "Behavior Reduction",
      longTermGoal:
        "Marcus will reduce instances of physical aggression to an average of 1 or fewer episodes per day, as measured by daily frequency data across all settings over 4 consecutive weeks.",
      shortTermObjectives: [
        "Marcus will reduce physical aggression to an average of 6 or fewer episodes per day over 2 consecutive weeks.",
        "Marcus will reduce physical aggression to an average of 4 or fewer episodes per day over 2 consecutive weeks.",
        "Marcus will reduce physical aggression to an average of 2 or fewer episodes per day over 2 consecutive weeks.",
        "Marcus will use a functional communication response instead of aggression in 50% of observed opportunities.",
        "Marcus will use a functional communication response instead of aggression in 80% of observed opportunities.",
      ],
      baseline: "Currently displaying average of 10.2 episodes of physical aggression per day",
      targetDate: "12 months from service initiation",
    },
    {
      domain: "Adaptive/Self-Help",
      type: "Skill Acquisition",
      longTermGoal:
        "Marcus will independently complete a morning self-care routine (toileting, hand washing, tooth brushing, dressing) with no more than 1 verbal prompt per step across 5 consecutive days.",
      shortTermObjectives: [
        "Marcus will sit on toilet for 2 minutes when placed on schedule every 2 hours with 80% compliance across 5 consecutive days.",
        "Marcus will urinate in toilet during at least 50% of scheduled sits, remaining dry between sits for 2-hour intervals.",
        "Marcus will complete hand washing routine with visual support and no more than 2 physical prompts across 10 consecutive opportunities.",
        "Marcus will complete tooth brushing routine with visual support and no more than 2 physical prompts across 10 consecutive opportunities.",
        "Marcus will independently put on shirt, pants, and shoes with Velcro closures with 80% accuracy across 5 consecutive days.",
      ],
      baseline: "Requires full physical prompting for all self-care tasks; not toilet trained",
      targetDate: "12 months from service initiation",
    },
  ],

  servicePlan: {
    totalWeeklyHours: 25,
    services: [
      {
        cptCode: "97153",
        description: "Adaptive behavior treatment by protocol (direct RBT services)",
        hoursPerWeek: 20,
        setting: "Home and Community",
        rationale:
          "High intensity direct intervention required to address significant deficits across communication, social, adaptive, and behavioral domains. Research supports intensive early intervention (20+ hours/week) for optimal outcomes in children with ASD.",
      },
      {
        cptCode: "97155",
        description: "Adaptive behavior treatment with protocol modification (BCBA direct)",
        hoursPerWeek: 2,
        setting: "Home and Community",
        rationale:
          "BCBA-delivered treatment for complex behavior support, caregiver training during session, and generalization programming across settings.",
      },
      {
        cptCode: "97156",
        description: "Family adaptive behavior treatment guidance",
        hoursPerWeek: 2,
        setting: "Home and Telehealth",
        rationale:
          "Parent/caregiver training essential for generalization of skills and consistent behavior management across all environments. Training will focus on communication system use, behavior prevention strategies, and reinforcement procedures.",
      },
      {
        cptCode: "97151",
        description: "Behavior identification assessment",
        hoursPerWeek: 1,
        setting: "Various",
        rationale:
          "Ongoing assessment for treatment planning, progress monitoring, and program modification based on data analysis.",
      },
    ],
    schedule: {
      monday: "3:30 PM - 7:30 PM (4 hours)",
      tuesday: "3:30 PM - 7:30 PM (4 hours)",
      wednesday: "3:30 PM - 7:30 PM (4 hours)",
      thursday: "3:30 PM - 7:30 PM (4 hours)",
      friday: "3:30 PM - 6:30 PM (3 hours)",
      saturday: "9:00 AM - 3:00 PM (6 hours, including community outing)",
      sunday: "No services",
    },
    authorizationPeriod: "6 months",
    requestedStartDate: "November 1, 2024",
  },

  medicalNecessity: {
    diagnosis: "Autism Spectrum Disorder (F84.0)",
    severity: "Level 2 - Requiring substantial support",
    justification: `Applied Behavior Analysis (ABA) therapy is medically necessary for Marcus Johnson based on comprehensive assessment findings and established evidence-based practice guidelines.

Clinical Necessity:
Marcus presents with significant deficits across all developmental domains that substantially impact his ability to participate in daily activities, educational settings, and family/community life. Without intensive intervention, these deficits are expected to worsen and lead to further developmental gaps compared to same-age peers.

Evidence Base:
ABA is recognized as an evidence-based treatment for Autism Spectrum Disorder by the American Academy of Pediatrics, the U.S. Surgeon General, and the National Institutes of Mental Health. Research consistently demonstrates that early intensive behavioral intervention (EIBI) produces significant gains in cognitive, language, adaptive, and social functioning, particularly when initiated before age 6.

Functional Impairments Requiring Treatment:
1. Communication: Unable to functionally communicate wants/needs, leading to behavioral episodes
2. Safety: Elopement and lack of safety awareness pose significant injury risk
3. Behavior: Aggressive and self-injurious behaviors prevent community participation and cause family stress
4. Adaptive Skills: Requires full assistance for all self-care, limiting age-appropriate independence
5. Social: Unable to engage with peers, limiting educational and social development opportunities

Medical Risks Without Treatment:
- Increased severity of aggressive and self-injurious behaviors
- Continued safety risks from elopement in community
- Further regression of communication skills
- Inability to access educational curriculum
- Increased caregiver stress and potential for family crisis
- Loss of critical early intervention window (neuroplasticity)

Treatment Appropriateness:
The recommended 25 hours per week of ABA services is appropriate based on:
- Marcus's age (5 years) - within critical early intervention period
- Severity of deficits across multiple domains
- Presence of significant behavioral challenges requiring intensive support
- Family availability and commitment to treatment
- Research supporting dose-response relationship in ABA outcomes`,
  },

  riskAssessment: {
    elopementRisk: "High",
    selfInjuryRisk: "Moderate",
    aggressionRisk: "Moderate",
    medicalRisk: "Low",
    safetyPlan: `Safety Plan for Marcus Johnson:

1. Elopement Prevention:
   - All exterior doors equipped with chimes/alarms
   - Visual boundary markers used during community outings
   - GPS tracking watch worn during all community activities
   - 1:1 supervision required in all non-home settings
   - "Stop" response training prioritized in programming

2. Aggression Management:
   - Antecedent strategies: visual schedules, transition warnings, choice-making
   - Staff trained in safe physical management techniques
   - Environmental arrangement to minimize triggers
   - Functional communication training as replacement behavior

3. Self-Injury Protocol:
   - Environmental padding available during high-risk times
   - Sensory alternatives provided proactively
   - Response blocking with redirection to safe alternatives
   - Data collection to identify patterns and prevent escalation

4. Crisis Intervention:
   - De-escalation procedures documented and trained
   - Physical intervention used only as last resort for safety
   - Parent/caregiver crisis line provided
   - Emergency contacts listed and accessible`,
  },
}

export type SampleAssessmentData = typeof sampleAssessmentData
