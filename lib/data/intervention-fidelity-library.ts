export type InterventionCategory =
  | "Communication"
  | "Reinforcement"
  | "Differential Reinforcement"
  | "Teaching Tech"
  | "Behavior Reduction"
  | "Programs"

export type InterventionProtocol = {
  definition?: string
  defaultSteps: string[]
  defaultChecklist: string[]
}

export type Intervention = {
  id: string
  name: string
  category: InterventionCategory
  protocol: InterventionProtocol
  defaultTargetFidelity?: number
  defaultMasterySessions?: number
}

// Fallback checklist si algún protocolo viene corto
export const baseFidelityChecklist = [
  "Prepare materials & environment",
  "Deliver instruction/SD clearly",
  "Implement prompting plan correctly",
  "Reinforce within 2 seconds when criteria met",
  "Handle errors per plan (no accidental reinforcement)",
  "Record data immediately",
]

const withFallbackChecklist = (protocol: InterventionProtocol): InterventionProtocol => ({
  definition: protocol.definition,
  defaultSteps: protocol.defaultSteps?.length
    ? protocol.defaultSteps
    : ["Follow clinical protocol as written and collect data each opportunity."],
  defaultChecklist: protocol.defaultChecklist?.length ? protocol.defaultChecklist : baseFidelityChecklist,
})

export const interventionLibrary: Intervention[] = [
  // =========================
  // Communication / VB
  // =========================
  {
    id: "fct",
    name: "Functional Communication Training (FCT)",
    category: "Communication",
    defaultTargetFidelity: 90,
    defaultMasterySessions: 3,
    protocol: withFallbackChecklist({
      definition:
        "Teach a functionally equivalent communicative response and reinforce it while reducing problem behavior.",
      defaultSteps: [
        "Identify the hypothesized function of problem behavior.",
        "Define the alternative communicative response (mand) that matches the function.",
        "Reinforce every instance of the alternative response initially (CRF).",
        "Use brief verbal prompts (e.g., “look / watch me”) to evoke the response as needed.",
        "Gradually fade prompts after the response is established.",
        "Collect data on replacement response and problem behavior.",
      ],
      defaultChecklist: [
        "Function is confirmed and replacement response matches function",
        "CRF delivered for every correct communicative response (initially)",
        "Prompts used consistently and faded systematically",
        "Problem behavior not reinforced (per plan)",
        "Data collected each opportunity",
      ],
    }),
  },
  {
    id: "conversational-skills",
    name: "Conversational Skills Training",
    category: "Communication",
    protocol: withFallbackChecklist({
      definition: "Increase intraverbal quality/length via rehearsal, modeling, feedback, role play, DRA.",
      defaultSteps: [
        "Select conversation topics aligned with learner goals.",
        "Ask structured questions to evoke intraverbal responses.",
        "Model correct responding when needed.",
        "Run behavioral rehearsal / role play trials.",
        "Deliver performance feedback and reinforce correct responding.",
        "Use discrimination training as needed across contexts.",
      ],
      defaultChecklist: [
        "Topics selected and targets defined",
        "Modeling provided when needed",
        "Feedback delivered immediately and clearly",
        "Reinforcement delivered for correct responding",
        "Trials/data recorded",
      ],
    }),
  },
  {
    id: "cpp",
    name: "Cues–Pause–Point Language Training",
    category: "Communication",
    protocol: withFallbackChecklist({
      definition: "Reduce echolalia and build meaningful responding using cues, pauses, and visual supports.",
      defaultSteps: [
        "Prepare visual supports relevant to the target responses.",
        "Deliver a clear verbal cue, then pause to allow response formulation.",
        "Prompt pointing/selecting the relevant visual aid when needed.",
        "Reinforce spontaneous/meaningful responses.",
        "Fade prompts and increase independence over time.",
      ],
      defaultChecklist: [
        "Cue delivered consistently",
        "Pause duration appropriate (not rushed)",
        "Visual support used correctly",
        "Reinforcement for meaningful responding",
        "Prompt fading implemented",
      ],
    }),
  },
  {
    id: "echoic",
    name: "Echoic Training",
    category: "Communication",
    protocol: withFallbackChecklist({
      definition: "Build echoic repertoire using high-frequency and easy sounds/words tied to reinforcers.",
      defaultSteps: [
        "Select high-frequency sounds already in repertoire + easy developmental sounds.",
        "Pair targets with motivating reinforcers when appropriate.",
        "Present word/sound target clearly.",
        "Reinforce immediately upon correct/approximate echoic.",
        "Shape approximations toward clearer productions over time.",
      ],
      defaultChecklist: [
        "Targets selected appropriately",
        "Clear model delivered",
        "Immediate reinforcement for correct/approximation",
        "Shaping criteria defined and followed",
        "Data recorded",
      ],
    }),
  },
  {
    id: "mand",
    name: "Mand Training",
    category: "Communication",
    protocol: withFallbackChecklist({
      definition: "Teach requesting under strong motivating operations; progress from simple to complex mands.",
      defaultSteps: [
        "Identify motivating operations and potential reinforcers.",
        "Create a reinforcer list and target words/phrases.",
        "Start with common items in the learner’s environment.",
        "Prompt and reinforce mands; increase phrase length (2+ words) as appropriate.",
        "Expand to more complex mands (including WH-question responding as relevant).",
      ],
      defaultChecklist: [
        "MO established before teaching trials",
        "Appropriate prompt level used",
        "Reinforcer delivered immediately and matches mand",
        "Progression plan exists (simple → complex)",
        "Data recorded",
      ],
    }),
  },
  {
    id: "intraverbal",
    name: "Intraverbal Training",
    category: "Communication",
    protocol: withFallbackChecklist({
      definition: "Teach contextually relevant responses to verbal stimuli (conversation building).",
      defaultSteps: [
        "Select intraverbal targets (simple associations → complex exchanges).",
        "Present verbal stimulus (question/comment) without the item present.",
        "Prompt as needed, then reinforce correct responding.",
        "Fade prompts and build fluency/accuracy.",
        "Generalize across people/settings/topics.",
      ],
      defaultChecklist: [
        "Targets sequenced (simple → complex)",
        "Prompting used and faded",
        "Reinforcement contingent on correct responding",
        "Fluency/accuracy tracked",
        "Generalization planned",
      ],
    }),
  },
  {
    id: "vb-shaping",
    name: "Shaping (Verbal Behavior)",
    category: "Communication",
    protocol: withFallbackChecklist({
      definition:
        "Shape distinct words and phrases via reinforcement of successive approximations + extinction of non-approximations.",
      defaultSteps: [
        "Select target sounds/words and current approximations.",
        "Reinforce successive approximations consistently.",
        "Place non-approximations on extinction (per plan).",
        "Start with easy words/vocalizations already in repertoire.",
        "Increase varied responding and simple 2-word phrases.",
      ],
      defaultChecklist: [
        "Approximations defined (clear criteria)",
        "Reinforcement delivered for approximations only",
        "Non-approximations not reinforced",
        "Targets progressed systematically",
        "Data recorded",
      ],
    }),
  },
  {
    id: "ssp",
    name: "Stimulus–Stimulus Pairing",
    category: "Communication",
    protocol: withFallbackChecklist({
      definition: "Pair speech sounds/words with reinforcement so production is strengthened by auditory product.",
      defaultSteps: [
        "Identify speech sounds/words to condition as reinforcers.",
        "Pair sounds/words with positive reinforcers frequently.",
        "Create opportunities for learner to produce sounds/words.",
        "Reinforce closer matches more strongly when appropriate.",
        "Combine with DRA/Echoic/Mand/Shaping as needed.",
      ],
      defaultChecklist: [
        "Pairing done frequently and consistently",
        "Reinforcer quality maintained",
        "Opportunities for vocalizations provided",
        "Reinforcement aligns with quality of approximation",
        "Data/notes kept",
      ],
    }),
  },
  {
    id: "tact",
    name: "Tact Training",
    category: "Communication",
    protocol: withFallbackChecklist({
      definition:
        "Teach labeling of objects/actions/events; expand from basic to abstract with prompting + reinforcement.",
      defaultSteps: [
        "Select tact targets (basic → complex).",
        "Present item/event and deliver SD for labeling.",
        "Prompt as needed; reinforce accurate responding.",
        "Fade prompts and build fluency.",
        "Generalize across exemplars/settings.",
      ],
      defaultChecklist: [
        "Targets sequenced and defined",
        "Prompting used appropriately and faded",
        "Reinforcement contingent on accurate tact",
        "Multiple exemplars trained",
        "Data recorded",
      ],
    }),
  },
  {
    id: "listener",
    name: "Listener Training",
    category: "Communication",
    protocol: withFallbackChecklist({
      definition:
        "Develop receptive language: follow instructions and respond to auditory/visual cues with prompting + reinforcement.",
      defaultSteps: [
        "Select receptive targets (simple instructions → complex).",
        "Deliver instruction clearly (auditory/visual cue).",
        "Prompt correct response as needed; reinforce immediately.",
        "Fade prompts and increase response complexity.",
        "Generalize across contexts/people.",
      ],
      defaultChecklist: [
        "Instruction delivered clearly",
        "Prompting and fading implemented",
        "Immediate reinforcement for correct response",
        "Generalization practiced",
        "Data recorded",
      ],
    }),
  },

  // PECS (phases as steps)
  {
    id: "pecs",
    name: "Picture Exchange Communication System (PECS)",
    category: "Communication",
    protocol: withFallbackChecklist({
      definition: "Teach functional communication via picture exchanges progressing through phases.",
      defaultSteps: [
        "Phase 1: Teach basic exchange (prompt hand-over-hand; immediate item delivery; fade prompts).",
        "Phase 2: Increase distance/persistence (move card/partner; reinforce each exchange).",
        "Phase 3: Picture discrimination (choose correct picture among options; correct errors gently).",
        "Phase 4: Sentence strip ('I want' + item; exchange full strip; reinforce).",
        "Phase 5: Answer questions ('What do you want?'; respond using strip/cards; reinforce).",
        "Phase 6: Commenting ('I see/I hear'; reinforce successful commenting).",
        "Track independent exchanges, correct selections, and sentence construction.",
      ],
      defaultChecklist: [
        "Preferred items identified and available",
        "Prompting used correctly and faded",
        "Immediate reinforcement delivered after exchange",
        "Discrimination errors corrected per plan",
        "Data tracked (exchanges/selections/sentences)",
      ],
    }),
  },

  // =========================
  // Reinforcement / Motivation
  // =========================
  {
    id: "behavior-momentum",
    name: "High Probability Request Sequence (Behavior Momentum)",
    category: "Reinforcement",
    protocol: withFallbackChecklist({
      definition: "Increase compliance by chaining easy (high-p) requests before a difficult (low-p) demand.",
      defaultSteps: [
        "Select 2 easy back-to-back tasks the learner can reliably complete.",
        "Deliver high-p requests and reinforce compliance quickly.",
        "Immediately present the difficult/non-preferred demand after momentum is built.",
        "Provide reinforcement for compliance with the low-p demand.",
        "Use before difficult demands across settings.",
      ],
      defaultChecklist: [
        "High-p tasks are truly easy/mastered",
        "Reinforcement delivered after high-p compliance",
        "Low-p demand delivered immediately after momentum",
        "Reinforcement contingent on compliance",
        "Data recorded on compliance",
      ],
    }),
  },
  {
    id: "ncr-attn",
    name: "Non-Contingent Reinforcement (Attention) – NCR/FT10",
    category: "Reinforcement",
    protocol: withFallbackChecklist({
      definition:
        "Deliver attention on a time-based schedule independent of problem behavior to reduce MO for attention-maintained behavior.",
      defaultSteps: [
        "Set a timer for 10 minutes while learner is at home.",
        "At timer end, provide ~30 seconds of attention (conversation/game) and praise if engaging in alternative behavior.",
        "If problem behavior occurred at interval end, withhold attention until 5 minutes without the maladaptive behavior.",
        "Repeat consistently across the day.",
        "Collect data on problem behavior and alternative behavior.",
      ],
      defaultChecklist: [
        "Timer used consistently (FT10)",
        "Attention delivered as planned (~30s)",
        "Attention withheld correctly after problem behavior (5 min clean)",
        "Praise paired with alternative behavior",
        "Data collected",
      ],
    }),
  },
  {
    id: "premack",
    name: "Premack Principle",
    category: "Reinforcement",
    protocol: withFallbackChecklist({
      definition: "High-probability activity is available only after completing low-probability (programming) tasks.",
      defaultSteps: [
        "Identify a high-probability activity (strong preference).",
        "Restrict it below baseline (only available after target task).",
        "Define the low-probability task requirement.",
        "Deliver access to high-probability activity immediately after completion.",
        "Track compliance and adjust criteria as needed.",
      ],
      defaultChecklist: [
        "High-p activity chosen correctly (strong reinforcer)",
        "High-p activity is restricted to be contingent",
        "Low-p task criteria clear",
        "Immediate access delivered after completion",
        "Data recorded",
      ],
    }),
  },
  {
    id: "token-economy",
    name: "Token Economy",
    category: "Reinforcement",
    protocol: withFallbackChecklist({
      definition: "Earn tokens for defined behaviors; exchange tokens for backup reinforcers from a menu.",
      defaultSteps: [
        "Define target behaviors that earn tokens.",
        "Select token type and backup reinforcer menu.",
        "Deliver tokens immediately and consistently after target behavior.",
        "Allow exchange based on clear rules (cost/menu).",
        "Adjust schedule to maintain motivation; track behavior change.",
      ],
      defaultChecklist: [
        "Targets defined and observable",
        "Tokens delivered immediately and consistently",
        "Backup menu available and motivating",
        "Exchange rules followed (no bargaining drift)",
        "Data tracked",
      ],
    }),
  },
  {
    id: "contingency-contract",
    name: "Contingency Contract",
    category: "Reinforcement",
    protocol: withFallbackChecklist({
      definition: "Written agreement specifying expectations and consequences/rewards for compliance.",
      defaultSteps: [
        "Define target behavior/expectations clearly.",
        "Define replacement behavior and reward for meeting conditions.",
        "Write the contract with caregiver/ABA staff/learner as appropriate.",
        "Track compliance and deliver reward when conditions are met.",
        "Review and revise based on data.",
      ],
      defaultChecklist: [
        "Expectations are specific and measurable",
        "Reward is motivating and available",
        "Contract reviewed with all implementers",
        "Compliance tracking occurs",
        "Reward delivered only when criteria met",
      ],
    }),
  },

  // =========================
  // Differential Reinforcement
  // =========================
  {
    id: "dra",
    name: "DRA (Alternative Behavior)",
    category: "Differential Reinforcement",
    protocol: withFallbackChecklist({
      definition: "Reinforce functionally equivalent replacement responses; thin schedule over time.",
      defaultSteps: [
        "Define replacement behavior(s) that match function.",
        "Deliver reinforcement on CRF initially (social + preferred item/activity).",
        "Vary reinforcers to maintain potency.",
        "Thin reinforcement schedule as replacement behavior increases (per plan).",
        "Terminate/transition when long-term objective met.",
      ],
      defaultChecklist: [
        "Replacement is functionally equivalent",
        "CRF used initially",
        "Reinforcers varied/maintained",
        "Schedule thinning implemented as written",
        "Data recorded",
      ],
    }),
  },
  {
    id: "dri",
    name: "DRI (Incompatible Behavior)",
    category: "Differential Reinforcement",
    protocol: withFallbackChecklist({
      definition: "Reinforce a specific incompatible response; thin schedule over time.",
      defaultSteps: [
        "Define the incompatible response for each target behavior.",
        "Reinforce incompatible response on CRF initially.",
        "Ensure ONLY the defined incompatible response is reinforced for that behavior.",
        "Thin schedule as responding improves (per plan).",
        "Adjust reinforcers based on daily potency.",
      ],
      defaultChecklist: [
        "Incompatible response is truly incompatible",
        "Only incompatible response is reinforced",
        "CRF initially, thinning later",
        "Reinforcers remain potent",
        "Data recorded",
      ],
    }),
  },
  {
    id: "dro",
    name: "DRO (Other Behavior) – FT5",
    category: "Differential Reinforcement",
    protocol: withFallbackChecklist({
      definition:
        "Time-based reinforcement if target behavior does NOT occur during interval; combine with DRA for replacement.",
      defaultSteps: [
        "Set timer for 5 minutes (FT5).",
        "If no target behavior occurs in interval, deliver reinforcement at interval end.",
        "Reset timer if target behavior occurs.",
        "Combine with DRA for alternative behavior reinforcement.",
        "Thin interval gradually after stable reduction (per plan).",
      ],
      defaultChecklist: [
        "Timer used accurately",
        "Reinforcement delivered only when interval clean",
        "Reset happens immediately after target behavior",
        "Alternative behavior reinforced (DRA) as planned",
        "Thinning criteria followed",
      ],
    }),
  },
  {
    id: "drh",
    name: "DRH (High Rates)",
    category: "Differential Reinforcement",
    protocol: withFallbackChecklist({
      definition: "Reinforce when desired behavior meets/exceeds a specified rate within a time period.",
      defaultSteps: [
        "Define behavior and measurement window.",
        "Set criterion for minimum rate.",
        "Deliver reinforcement when criterion is met.",
        "Adjust criterion gradually to shape higher rates as appropriate.",
        "Track rates over time.",
      ],
      defaultChecklist: [
        "Rate criterion defined and feasible",
        "Measurement window consistent",
        "Reinforcement contingent on meeting criterion",
        "Criteria adjusted based on data",
        "Data recorded",
      ],
    }),
  },
  {
    id: "drl",
    name: "DRL (Low Rates: Spaced / Interval / Full Session)",
    category: "Differential Reinforcement",
    protocol: withFallbackChecklist({
      definition: "Reduce behavior frequency to acceptable levels (not eliminate) by reinforcing low rates.",
      defaultSteps: [
        "Select DRL type (Spaced / Interval / Full Session) appropriate to behavior.",
        "Set initial criterion based on baseline (acceptable maximum).",
        "Deliver reinforcement only if behavior stays at/below criterion.",
        "Thin schedule gradually after initial reduction is observed.",
        "Generalize across settings/caregivers and maintain with natural contingencies.",
      ],
      defaultChecklist: [
        "DRL type chosen appropriately",
        "Criterion based on baseline",
        "Reinforcement contingent on low rate only",
        "Thinning gradual (data-based)",
        "Generalization plan in place",
      ],
    }),
  },
  {
    id: "drd",
    name: "DRD (Diminished Rates)",
    category: "Differential Reinforcement",
    protocol: withFallbackChecklist({
      definition: "Reinforce progressively lower rates over time by lowering criterion gradually.",
      defaultSteps: [
        "Set maximum allowable rate criterion for the period.",
        "Reinforce if behavior occurs at/below criterion.",
        "Lower criterion gradually as progress occurs.",
        "Avoid abrupt changes; adjust based on data stability.",
        "Track trend and maintain acceptable level.",
      ],
      defaultChecklist: [
        "Criterion set and communicated",
        "Reinforcement only when at/below criterion",
        "Criterion lowered gradually",
        "Changes are data-based",
        "Data recorded",
      ],
    }),
  },

  // =========================
  // Teaching Tech
  // =========================
  {
    id: "prompting",
    name: "Prompting (Physical / Modeling / Gestural / Verbal / Visual)",
    category: "Teaching Tech",
    protocol: withFallbackChecklist({
      definition:
        "Provide immediate assistance to evoke correct responding; fade systematically to avoid prompt dependency.",
      defaultSteps: [
        "Deliver instruction (SD) clearly.",
        "Provide prompt immediately before/after SD as needed (physical/model/gestural/verbal/visual).",
        "Reinforce correct responding.",
        "Fade prompts systematically (MTL or LTM per learner).",
        "Monitor for prompt dependency and adjust hierarchy.",
      ],
      defaultChecklist: [
        "Prompt type matches learner needs",
        "Prompt delivered at correct timing",
        "Reinforcement delivered for correct response",
        "Prompt fading occurs systematically",
        "Data tracked",
      ],
    }),
  },
  {
    id: "discrimination",
    name: "Discrimination Training (SD vs SΔ)",
    category: "Teaching Tech",
    protocol: withFallbackChecklist({
      definition: "Reinforce responding in presence of SD, not in presence of SΔ; build stimulus control.",
      defaultSteps: [
        "Define SD and SΔ conditions.",
        "Present SD/SΔ trials systematically.",
        "Reinforce responses in SD; do not reinforce in SΔ.",
        "Track discrimination performance and adjust prompts.",
        "Generalize across exemplars/settings.",
      ],
      defaultChecklist: [
        "SD/SΔ defined and consistent",
        "Reinforcement only in SD",
        "No accidental reinforcement in SΔ",
        "Prompting/fading used as needed",
        "Data recorded",
      ],
    }),
  },
  {
    id: "errorless",
    name: "Errorless Teaching",
    category: "Teaching Tech",
    protocol: withFallbackChecklist({
      definition:
        "Prevent errors using prompts; fade prompts gradually while maintaining high success/reinforcement contact.",
      defaultSteps: [
        "Set up task steps and prompts (MTL or LTM).",
        "Provide prompts to ensure correct responding.",
        "Deliver positive reinforcement for correct responses.",
        "Fade prompts gradually as proficiency increases.",
        "If an error occurs: immediate feedback and correction.",
      ],
      defaultChecklist: [
        "Prompting prevents errors (high success rate)",
        "Reinforcement delivered consistently",
        "Prompt fading is systematic",
        "Error correction is immediate",
        "Data recorded",
      ],
    }),
  },
  {
    id: "total-task-chaining",
    name: "Total Task Chaining",
    category: "Teaching Tech",
    protocol: withFallbackChecklist({
      definition:
        "Teach full chain; assist on steps not independent; continue until criterion met for entire sequence.",
      defaultSteps: [
        "Create task analysis (full behavior sequence).",
        "Run the full chain each opportunity.",
        "Provide assistance/prompts on steps learner cannot do independently.",
        "Fade prompts as independence increases.",
        "Continue until learner performs all steps to criterion.",
      ],
      defaultChecklist: [
        "Task analysis is available and followed",
        "Prompts delivered only where needed",
        "Prompt fading occurs",
        "Reinforcement delivered for steps/completion",
        "Data recorded by step or completion",
      ],
    }),
  },

  // =========================
  // Behavior Reduction
  // =========================
  {
    id: "planned-ignoring",
    name: "Planned Ignoring",
    category: "Behavior Reduction",
    protocol: withFallbackChecklist({
      definition:
        "Withhold attention for attention-maintained behaviors; reinforce alternative behavior when it occurs.",
      defaultSteps: [
        "Identify attention-maintained behaviors appropriate for ignoring.",
        "During episodes, do not look, speak, or acknowledge.",
        "Continue routine task and withhold attention consistently.",
        "When alternative behavior occurs, deliver attention/praise (and preferred item/activity if planned).",
        "Record data.",
      ],
      defaultChecklist: [
        "No attention delivered during target behavior",
        "Implementers remain consistent",
        "Alternative behavior reinforced immediately",
        "No escalation reinforcement (avoid giving in)",
        "Data recorded",
      ],
    }),
  },
  {
    id: "rird",
    name: "Response Interruption and Redirection (RIRD)",
    category: "Behavior Reduction",
    protocol: withFallbackChecklist({
      definition:
        "Interrupt problem behavior and redirect to an incompatible/appropriate response; reinforce alternative.",
      defaultSteps: [
        "Define the problem behavior and the incompatible alternative response.",
        "Interrupt immediately as behavior begins (verbal or physical as appropriate).",
        "Prompt/guide the alternative response right away.",
        "Reinforce the alternative response.",
        "Repeat consistently; track reductions over time.",
      ],
      defaultChecklist: [
        "Interruption occurs immediately",
        "Redirection targets an incompatible/appropriate response",
        "Alternative reinforced each time",
        "No reinforcement delivered for problem behavior",
        "Data recorded",
      ],
    }),
  },
  {
    id: "redirection",
    name: "Redirection to an Alternative Response",
    category: "Behavior Reduction",
    protocol: withFallbackChecklist({
      definition:
        "Redirect to a functionally equivalent response; avoid creating chains; apply calm interval when appropriate.",
      defaultSteps: [
        "Attempt to use precursor behavior for earlier redirection when possible.",
        "If no precursors, redirect after problem behavior occurs.",
        "Use a calm interval (e.g., 1 minute) before redirecting to avoid chaining, when clinically appropriate.",
        "Exception: for escape-maintained behavior, avoid delays that reinforce escape; use gentle physical prompt to initiate demand as needed.",
        "Redirect to mand/waiting/break request per plan and reinforce appropriately.",
      ],
      defaultChecklist: [
        "Redirects match function (equivalent response)",
        "Calm interval applied correctly (when appropriate)",
        "Escape exception applied correctly (no reinforcing delays)",
        "Alternative response prompted and reinforced",
        "Data recorded",
      ],
    }),
  },
  {
    id: "response-block",
    name: "Response Block",
    category: "Behavior Reduction",
    protocol: withFallbackChecklist({
      definition:
        "Physically block the response without restraint; brief blocks; pair with ignoring for attention-seeking where relevant.",
      defaultSteps: [
        "Identify behavior to block and safe blocking method.",
        "Block the response without grabbing/restraining.",
        "Keep block brief (≤ 15 seconds).",
        "If attention-seeking, pair response block with planned ignoring per plan.",
        "Record data and monitor effects.",
      ],
      defaultChecklist: [
        "Block is safe and non-restrictive",
        "Block duration stays brief",
        "No extra attention delivered during blocking (if attention function)",
        "Paired procedures used as planned",
        "Data recorded",
      ],
    }),
  },
  {
    id: "response-effort",
    name: "Response Effort",
    category: "Behavior Reduction",
    protocol: withFallbackChecklist({
      definition: "Increase effort required for challenging behavior; provide competing items and enrichment.",
      defaultSteps: [
        "Identify the response form to increase effort for (safely/ethically).",
        "Modify environment to increase effort required to engage in problem behavior.",
        "Provide competing items/activities.",
        "Provide frequent free access to appropriate items/activities correlated with lower rates of behavior.",
        "Track behavior change and adjust.",
      ],
      defaultChecklist: [
        "Effort manipulation is safe and appropriate",
        "Competing items are available",
        "Enrichment delivered consistently",
        "No unintended deprivation issues",
        "Data recorded",
      ],
    }),
  },
  {
    id: "escape-extinction",
    name: "Escape Extinction",
    category: "Behavior Reduction",
    protocol: withFallbackChecklist({
      definition: "Do not allow escape from demands; continue demand and use guidance; reinforce task completion.",
      defaultSteps: [
        "Deliver direction to complete task.",
        "If maladaptive behavior occurs, do not allow escape from demand.",
        "Use physical guidance/redirection as planned to continue engagement (e.g., for set duration).",
        "Praise completion of each step; deliver tangible for completing all steps as planned.",
        "Record data and monitor intensity/safety.",
      ],
      defaultChecklist: [
        "Demand not removed following problem behavior",
        "Guidance used safely and consistently",
        "Reinforcement delivered for task engagement/completion",
        "Safety monitored throughout",
        "Data recorded",
      ],
    }),
  },
  {
    id: "nce-breaks",
    name: "Non-Contingent Escape / Scheduled Breaks (FT10)",
    category: "Behavior Reduction",
    protocol: withFallbackChecklist({
      definition:
        "Provide scheduled breaks during non-preferred tasks to reduce escape-maintained problem behavior; thin schedule over time.",
      defaultSteps: [
        "Identify baseline tolerance for task engagement.",
        "Schedule breaks before problem behavior typically occurs (e.g., FT10 or shorter initially).",
        "Deliver brief break, then return to task.",
        "Lengthen intervals proportionally; later move to variable interval (VI) for maintenance.",
        "Track behavior and adjust schedule based on data.",
      ],
      defaultChecklist: [
        "Break schedule matches learner tolerance",
        "Break delivered non-contingently (not after problem behavior)",
        "Schedule thinning is gradual and data-based",
        "Return-to-task routine consistent",
        "Data recorded",
      ],
    }),
  },

  // =========================
  // Programs
  // =========================
  {
    id: "satiation-deprivation",
    name: "Satiation/Deprivation Procedures",
    category: "Programs",
    protocol: withFallbackChecklist({
      definition:
        "Alter reinforcer effectiveness by pre-session satiation (or planned deprivation) to change behavior frequency.",
      defaultSteps: [
        "Identify reinforcer historically maintaining behavior.",
        "Pre-session: provide copious contact with reinforcer (satiation) when clinically appropriate.",
        "Run session and monitor changes in behavior frequency and attending.",
        "Adjust amounts based on observed effects.",
        "Record notes on reinforcer effectiveness shifts.",
      ],
      defaultChecklist: [
        "Target reinforcer identified correctly",
        "Pre-session procedure implemented as planned",
        "Session data collected to verify effect",
        "Procedure adjusted safely",
        "Documentation completed",
      ],
    }),
  },
  {
    id: "grad-exposure",
    name: "Graduated Exposure / Systematic Desensitization",
    category: "Programs",
    protocol: withFallbackChecklist({
      definition:
        "Create hierarchy of feared stimuli; expose gradually; pair with relaxation; monitor and pace progress safely.",
      defaultSteps: [
        "Build hierarchy from least → most anxiety-provoking.",
        "Start exposure at lowest manageable step.",
        "Pair with relaxation (deep muscle relaxation) as needed.",
        "Advance only when readiness criteria met; pace based on tolerance.",
        "Monitor distress continuously and document progress.",
      ],
      defaultChecklist: [
        "Hierarchy defined and followed",
        "Pacing is learner-led/data-based",
        "Relaxation procedures implemented correctly",
        "Continuous monitoring for distress",
        "Data and safeguards documented",
      ],
    }),
  },
  {
    id: "habit-reversal",
    name: "Habit Reversal",
    category: "Programs",
    protocol: withFallbackChecklist({
      definition:
        "Teach awareness + competing responses; reinforce incompatible behavior to reduce maladaptive habit patterns.",
      defaultSteps: [
        "Teach awareness of the behavior (identify triggers and early signs).",
        "Teach a competing incompatible response.",
        "Reinforce competing response contingent on occurrence.",
        "Practice in relevant contexts; generalize across settings.",
        "Track frequency/intensity over time.",
      ],
      defaultChecklist: [
        "Awareness training implemented",
        "Competing response taught clearly",
        "Reinforcement contingent on competing response",
        "Practice/generalization occurs",
        "Data recorded",
      ],
    }),
  },
  {
    id: "picky-eating",
    name: "Picky Eating Intervention Program",
    category: "Programs",
    protocol: withFallbackChecklist({
      definition:
        "Food exposure hierarchy + reinforcement/modeling; caregiver involvement to broaden food acceptance over time.",
      defaultSteps: [
        "Create food hierarchy from most similar/accepted → least familiar.",
        "Start exposures at easiest items; model and reinforce approach/interaction.",
        "Gradually progress to less familiar foods.",
        "Train caregivers on mealtime environment and response strategies.",
        "Track acceptance and adjust based on progress.",
      ],
      defaultChecklist: [
        "Hierarchy defined and used",
        "Reinforcement/modeling implemented",
        "Progression is gradual",
        "Caregiver training included",
        "Data recorded",
      ],
    }),
  },
]
