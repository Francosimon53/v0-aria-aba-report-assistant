export interface BehaviorTemplate {
  id: string
  name: string
  category:
    | "aggression"
    | "self-injury"
    | "property-destruction"
    | "elopement"
    | "non-compliance"
    | "tantrum"
    | "stereotypy"
    | "vocal-disruption"
    | "social-avoidance"
  description: string
  operationalDefinition: string
  commonFunctions: ("attention" | "escape" | "tangible" | "sensory")[]
  commonAntecedents: string[]
  typicalInterventions: string[]
  replacementBehaviors: string[]
  safetyRisk: "low" | "medium" | "high"
}

export const behaviorLibrary: BehaviorTemplate[] = [
  // Aggression
  {
    id: "hitting",
    name: "Hitting",
    category: "aggression",
    description: "Physical contact with another person using hands or fists",
    operationalDefinition:
      "Any instance of the client making forceful contact with another person using an open or closed hand, resulting in audible or visible impact.",
    commonFunctions: ["attention", "escape", "tangible"],
    commonAntecedents: ["Demand presented", "Denied access to preferred item", "Transition required", "Peer proximity"],
    typicalInterventions: [
      "Functional Communication Training (FCT)",
      "Differential Reinforcement of Alternative Behavior (DRA)",
      "Non-contingent Reinforcement (NCR)",
      "Antecedent modification",
    ],
    replacementBehaviors: [
      "Requesting break using communication device",
      "Asking for help",
      "Using calm-down strategies",
    ],
    safetyRisk: "high",
  },
  {
    id: "biting",
    name: "Biting",
    category: "aggression",
    description: "Using teeth to make contact with another person's body",
    operationalDefinition:
      "Any instance of the client making contact with another person's skin or clothing using teeth, whether or not it leaves a mark.",
    commonFunctions: ["attention", "escape", "sensory"],
    commonAntecedents: ["Physical prompting", "Crowded environment", "Overstimulation", "Denied request"],
    typicalInterventions: [
      "FCT for requesting space",
      "DRO (Differential Reinforcement of Other Behavior)",
      "Sensory diet implementation",
      "Teaching replacement communication",
    ],
    replacementBehaviors: [
      "Using 'stop' sign or gesture",
      "Requesting personal space",
      "Using chewy toy or sensory tool",
    ],
    safetyRisk: "high",
  },
  {
    id: "kicking",
    name: "Kicking",
    category: "aggression",
    description: "Using feet or legs to make forceful contact with others",
    operationalDefinition:
      "Any instance of the client using feet or legs to make forceful contact with another person, resulting in physical impact.",
    commonFunctions: ["escape", "attention", "tangible"],
    commonAntecedents: ["Academic demand", "Physical proximity of others", "Transition time", "Item removed"],
    typicalInterventions: [
      "Escape extinction with FCT",
      "Teaching compliance skills",
      "Token economy system",
      "Behavioral momentum",
    ],
    replacementBehaviors: [
      "Requesting break appropriately",
      "Following first-then instructions",
      "Using visual schedule",
    ],
    safetyRisk: "high",
  },
  {
    id: "scratching",
    name: "Scratching Others",
    category: "aggression",
    description: "Using fingernails to scrape or dig into another person's skin",
    operationalDefinition:
      "Any instance of the client dragging fingernails across another person's skin with sufficient force to cause redness or marks.",
    commonFunctions: ["attention", "escape", "tangible"],
    commonAntecedents: ["Physical contact initiated by others", "Demand to share", "Loss of preferred item"],
    typicalInterventions: [
      "DRA with communication training",
      "Redirection to appropriate touch",
      "Sensory substitution",
    ],
    replacementBehaviors: ["Gentle touch training", "Requesting desired item", "Using fidget tool"],
    safetyRisk: "medium",
  },
  {
    id: "spitting",
    name: "Spitting",
    category: "aggression",
    description: "Expelling saliva toward another person",
    operationalDefinition:
      "Any instance of the client forcefully expelling saliva from the mouth in the direction of another person.",
    commonFunctions: ["attention", "escape", "tangible"],
    commonAntecedents: ["Non-preferred activity", "Attention on others", "Denied request"],
    typicalInterventions: ["Planned ignoring", "FCT", "Response cost", "Teaching appropriate protest"],
    replacementBehaviors: ["Saying 'no' appropriately", "Requesting break", "Using rejection card"],
    safetyRisk: "medium",
  },
  {
    id: "hair-pulling",
    name: "Hair Pulling",
    category: "aggression",
    description: "Grasping and pulling another person's hair",
    operationalDefinition:
      "Any instance of the client grasping another person's hair with one or both hands and pulling with sufficient force to cause the person to move or react.",
    commonFunctions: ["attention", "tangible", "sensory"],
    commonAntecedents: ["Peer interaction", "Caregiver attention on sibling", "Sensory seeking"],
    typicalInterventions: ["Gentle touch training", "DRA", "Sensory integration activities"],
    replacementBehaviors: ["Appropriate attention-seeking", "Requesting sensory input", "Using hair brush on doll"],
    safetyRisk: "medium",
  },

  // Self-Injury
  {
    id: "head-banging",
    name: "Head Banging",
    category: "self-injury",
    description: "Forcefully hitting head against surfaces",
    operationalDefinition:
      "Any instance of the client forcefully making contact between the head and a hard surface (wall, floor, furniture) with sufficient force to produce a sound.",
    commonFunctions: ["escape", "attention", "sensory"],
    commonAntecedents: ["Difficult task presented", "Transition required", "Sensory overload", "Left alone"],
    typicalInterventions: [
      "NCR with escape",
      "Protective equipment during transition",
      "Sensory alternatives",
      "Emergency intervention plan",
    ],
    replacementBehaviors: ["Requesting break", "Using calming strategies", "Pressing head against pillow"],
    safetyRisk: "high",
  },
  {
    id: "self-scratching",
    name: "Self-Scratching",
    category: "self-injury",
    description: "Using fingernails to scratch own skin",
    operationalDefinition:
      "Any instance of the client dragging fingernails across own skin with sufficient force to cause redness, marks, or tissue damage.",
    commonFunctions: ["sensory", "escape", "attention"],
    commonAntecedents: ["Anxiety-provoking situations", "Boredom", "Skin irritation", "Overstimulation"],
    typicalInterventions: ["Sensory substitution", "Relaxation training", "Medical evaluation", "DRO"],
    replacementBehaviors: ["Using fidget tools", "Applying lotion", "Deep pressure input"],
    safetyRisk: "medium",
  },
  {
    id: "self-biting",
    name: "Self-Biting",
    category: "self-injury",
    description: "Using teeth to bite own body parts",
    operationalDefinition:
      "Any instance of the client placing teeth on own skin (typically hand, arm, or wrist) and applying sufficient pressure to leave marks or cause tissue damage.",
    commonFunctions: ["escape", "sensory", "attention"],
    commonAntecedents: ["Difficult demand", "Denied access", "Frustration", "Sensory seeking"],
    typicalInterventions: ["FCT", "Sensory diet with oral input", "Protective equipment", "DRA"],
    replacementBehaviors: ["Using chewy toy", "Requesting break", "Verbal protest"],
    safetyRisk: "high",
  },
  {
    id: "skin-picking",
    name: "Skin Picking",
    category: "self-injury",
    description: "Repeatedly picking at skin causing damage",
    operationalDefinition:
      "Any instance of the client using fingers to pick, pull, or dig at own skin, resulting in redness, bleeding, or scabbing.",
    commonFunctions: ["sensory", "escape"],
    commonAntecedents: ["Stress", "Idle time", "Visible skin imperfection", "Anxiety"],
    typicalInterventions: ["Habit reversal training", "Competing response training", "Fidget tools", "Mindfulness"],
    replacementBehaviors: ["Using stress ball", "Picking at putty", "Wearing protective covering"],
    safetyRisk: "medium",
  },

  // Property Destruction
  {
    id: "throwing-objects",
    name: "Throwing Objects",
    category: "property-destruction",
    description: "Forcefully projecting objects through the air",
    operationalDefinition:
      "Any instance of the client grasping an object and propelling it through the air with sufficient force that it travels at least 3 feet from the starting point.",
    commonFunctions: ["escape", "attention", "tangible"],
    commonAntecedents: ["Denied request", "Difficult task", "Transition", "Peer conflict"],
    typicalInterventions: ["FCT", "Teaching alternative expression", "Response cost", "Precorrection"],
    replacementBehaviors: ["Requesting break", "Using 'help' card", "Appropriate object placement"],
    safetyRisk: "medium",
  },
  {
    id: "breaking-items",
    name: "Breaking/Destroying Items",
    category: "property-destruction",
    description: "Intentionally damaging or destroying materials or property",
    operationalDefinition:
      "Any instance of the client applying force to an object resulting in the object becoming broken, torn, or otherwise damaged and unable to function as intended.",
    commonFunctions: ["escape", "attention"],
    commonAntecedents: ["Non-preferred activity", "Denied access", "Peer takes item"],
    typicalInterventions: ["Teaching appropriate protest", "Restitution procedure", "Antecedent strategies"],
    replacementBehaviors: ["Requesting different activity", "Expressing frustration verbally", "Taking break"],
    safetyRisk: "low",
  },
  {
    id: "tearing-paper",
    name: "Tearing Paper/Materials",
    category: "property-destruction",
    description: "Ripping or shredding paper, books, or similar materials",
    operationalDefinition:
      "Any instance of the client grasping paper or similar material and applying force to cause it to separate or tear.",
    commonFunctions: ["escape", "sensory"],
    commonAntecedents: ["Academic work presented", "Unsupervised time", "Sensory seeking"],
    typicalInterventions: ["Providing appropriate tearing materials", "Escape extinction with FCT", "Sensory schedule"],
    replacementBehaviors: ["Tearing designated paper", "Requesting break from work", "Using fidget"],
    safetyRisk: "low",
  },

  // Elopement
  {
    id: "running-away",
    name: "Elopement/Running Away",
    category: "elopement",
    description: "Leaving designated area without permission",
    operationalDefinition:
      "Any instance of the client moving beyond the designated boundaries (classroom, therapy room, yard) without adult permission or supervision.",
    commonFunctions: ["escape", "sensory", "attention"],
    commonAntecedents: ["Demand presented", "Transition time", "Preferred item visible elsewhere", "Loud noises"],
    typicalInterventions: [
      "Safety plan",
      "Teaching stay/wait skills",
      "NCR with breaks",
      "Environmental modifications",
    ],
    replacementBehaviors: ["Requesting break", "Asking for walk", "Using break card"],
    safetyRisk: "high",
  },
  {
    id: "leaving-seat",
    name: "Leaving Seat/Area",
    category: "elopement",
    description: "Standing up and leaving assigned seat or work area",
    operationalDefinition:
      "Any instance of the client's bottom leaving contact with the assigned seat for more than 3 seconds without permission.",
    commonFunctions: ["escape", "attention"],
    commonAntecedents: ["Difficult work", "Long sitting requirement", "Preferred activity elsewhere"],
    typicalInterventions: ["Teaching in-seat behavior", "Choice-making", "Visual timer", "DRI"],
    replacementBehaviors: ["Requesting break", "Raising hand for help", "Using movement break"],
    safetyRisk: "low",
  },

  // Non-Compliance
  {
    id: "refusal",
    name: "Refusal/Non-Compliance",
    category: "non-compliance",
    description: "Not following instructions or directives within reasonable time",
    operationalDefinition:
      "Failure to initiate compliance with an instruction within 5 seconds of the instruction being given, or stopping compliance before completion.",
    commonFunctions: ["escape", "attention"],
    commonAntecedents: ["Non-preferred task", "Difficult demand", "Multiple-step instruction"],
    typicalInterventions: ["Behavioral momentum", "High-probability request sequence", "Choice within tasks"],
    replacementBehaviors: ["Requesting break", "Asking for help", "Negotiating alternative"],
    safetyRisk: "low",
  },
  {
    id: "ignoring",
    name: "Ignoring Instructions",
    category: "non-compliance",
    description: "Failing to acknowledge or respond to directions",
    operationalDefinition:
      "No verbal or physical response within 5 seconds of a clear instruction being delivered while the client is within 5 feet and oriented toward the instructor.",
    commonFunctions: ["escape", "attention"],
    commonAntecedents: ["Engaged in preferred activity", "Multiple instructions given", "Non-preferred task"],
    typicalInterventions: ["Prompting hierarchy", "Compliance training", "Attention to task behavior"],
    replacementBehaviors: ["Acknowledging instruction", "Requesting clarification", "Indicating understanding"],
    safetyRisk: "low",
  },

  // Tantrum
  {
    id: "crying-tantrum",
    name: "Crying/Tantrum",
    category: "tantrum",
    description: "Loud crying, screaming, or tantrum behavior",
    operationalDefinition:
      "Any instance of loud crying or screaming lasting more than 5 seconds, may include falling to floor, flailing limbs, or other tantrum behaviors.",
    commonFunctions: ["escape", "attention", "tangible"],
    commonAntecedents: ["Denied request", "Difficult task", "Transition", "Unmet expectation"],
    typicalInterventions: ["Planned ignoring", "Teaching emotional regulation", "FCT", "Providing choices"],
    replacementBehaviors: ["Using words to express frustration", "Requesting help", "Taking calming break"],
    safetyRisk: "low",
  },
  {
    id: "whining",
    name: "Whining",
    category: "tantrum",
    description: "High-pitched, drawn-out vocal behavior indicating displeasure",
    operationalDefinition:
      "Any instance of vocalization with high pitch and drawn-out tone that differs from the client's typical speaking voice and indicates protest or displeasure.",
    commonFunctions: ["attention", "tangible", "escape"],
    commonAntecedents: ["Request denied", "Waiting required", "Non-preferred task"],
    typicalInterventions: [
      "Differential reinforcement of appropriate voice",
      "Teaching polite requesting",
      "Ignoring procedure",
    ],
    replacementBehaviors: ["Using appropriate voice tone", "Waiting patiently", "Using visual supports"],
    safetyRisk: "low",
  },

  // Stereotypy
  {
    id: "hand-flapping",
    name: "Hand Flapping",
    category: "stereotypy",
    description: "Repetitive hand and arm movements",
    operationalDefinition:
      "Any instance of rapid, repetitive back-and-forth or up-and-down movement of one or both hands and arms without functional purpose.",
    commonFunctions: ["sensory"],
    commonAntecedents: ["Excitement", "Stress", "Idle time", "Overstimulation"],
    typicalInterventions: [
      "Response interruption and redirection (RIRD)",
      "Differential reinforcement",
      "Sensory diet",
    ],
    replacementBehaviors: ["Appropriate stimming with fidget", "Functional hand activities", "Deep pressure"],
    safetyRisk: "low",
  },
  {
    id: "body-rocking",
    name: "Body Rocking",
    category: "stereotypy",
    description: "Repetitive rocking back and forth of torso",
    operationalDefinition:
      "Any instance of rhythmic forward and backward or side-to-side movement of the trunk while seated or standing, continuing for at least 3 seconds.",
    commonFunctions: ["sensory"],
    commonAntecedents: ["Unstimulating environment", "Transition", "Stress"],
    typicalInterventions: ["Providing appropriate sensory input", "Increasing engagement", "RIRD"],
    replacementBehaviors: ["Using rocking chair", "Vestibular activities", "Fidget tools"],
    safetyRisk: "low",
  },
  {
    id: "spinning",
    name: "Spinning/Twirling",
    category: "stereotypy",
    description: "Repetitive spinning of body or objects",
    operationalDefinition:
      "Any instance of rapid circular rotation of the body (spinning in place) or repetitive spinning of objects, continuing for at least 3 seconds.",
    commonFunctions: ["sensory"],
    commonAntecedents: ["Unstimulating activity", "Available spinning objects", "Transition time"],
    typicalInterventions: ["Scheduled sensory breaks", "Functional activity training", "Environmental modification"],
    replacementBehaviors: ["Using spinning toys appropriately", "Vestibular activities", "Active play"],
    safetyRisk: "low",
  },

  // Vocal Disruption
  {
    id: "screaming",
    name: "Screaming/Yelling",
    category: "vocal-disruption",
    description: "Loud vocalizations that disrupt environment",
    operationalDefinition:
      "Any instance of vocalization loud enough to be heard from at least 20 feet away and significantly louder than the client's typical speaking voice.",
    commonFunctions: ["attention", "escape", "sensory"],
    commonAntecedents: ["Demand", "Denied access", "Overstimulation", "Seeking attention"],
    typicalInterventions: ["FCT for gaining attention", "Teaching quiet voice", "Sensory strategies"],
    replacementBehaviors: ["Using appropriate voice volume", "Raising hand", "Using communication device"],
    safetyRisk: "low",
  },
  {
    id: "scripting",
    name: "Scripting/Echolalia",
    category: "vocal-disruption",
    description: "Repetitive non-functional speech or echoing",
    operationalDefinition:
      "Any instance of repetitive verbalization of words, phrases, or sounds from movies, books, or previous conversations without functional communication purpose.",
    commonFunctions: ["sensory", "escape"],
    commonAntecedents: ["Unstimulating activity", "Anxiety", "Transition"],
    typicalInterventions: ["Teaching functional communication", "RIRD", "Increasing engagement"],
    replacementBehaviors: ["Appropriate conversation", "Quiet vocalization", "Written expression"],
    safetyRisk: "low",
  },
  {
    id: "humming",
    name: "Humming/Vocal Stereotypy",
    category: "vocal-disruption",
    description: "Repetitive non-word vocalizations",
    operationalDefinition:
      "Any instance of repetitive humming, singing without words, or other non-word vocalizations continuing for at least 5 seconds.",
    commonFunctions: ["sensory", "escape"],
    commonAntecedents: ["Independent work time", "Unstimulating task", "Boredom"],
    typicalInterventions: [
      "Response interruption",
      "Differential reinforcement of quiet",
      "Increasing task engagement",
    ],
    replacementBehaviors: ["Using headphones with music", "Silent reading", "Appropriate singing times"],
    safetyRisk: "low",
  },

  // Social Avoidance
  {
    id: "social-withdrawal",
    name: "Social Withdrawal/Avoidance",
    category: "social-avoidance",
    description: "Avoiding or withdrawing from social interactions",
    operationalDefinition:
      "Any instance of the client moving away from peers or adults who initiate social interaction, or remaining isolated for entire available social opportunity.",
    commonFunctions: ["escape", "sensory"],
    commonAntecedents: ["Peer approach", "Group activity", "Loud social environment"],
    typicalInterventions: ["Social skills training", "Gradual exposure", "Peer mediated intervention"],
    replacementBehaviors: ["Appropriate social engagement", "Requesting break", "Parallel play"],
    safetyRisk: "low",
  },
  {
    id: "covering-ears",
    name: "Covering Ears",
    category: "social-avoidance",
    description: "Placing hands over ears to block sounds",
    operationalDefinition:
      "Any instance of the client placing one or both hands over ears for more than 2 seconds, preventing engagement in activity.",
    commonFunctions: ["escape", "sensory"],
    commonAntecedents: ["Loud environment", "Multiple voices", "Unexpected sounds"],
    typicalInterventions: ["Sensory accommodations", "Desensitization", "Teaching tolerance"],
    replacementBehaviors: ["Requesting quieter environment", "Using noise-canceling headphones", "Requesting break"],
    safetyRisk: "low",
  },
]

export const behaviorCategories = [
  { id: "all", name: "All Behaviors", count: behaviorLibrary.length },
  {
    id: "aggression",
    name: "Aggression",
    count: behaviorLibrary.filter((b) => b.category === "aggression").length,
    color: "red",
  },
  {
    id: "self-injury",
    name: "Self-Injury",
    count: behaviorLibrary.filter((b) => b.category === "self-injury").length,
    color: "orange",
  },
  {
    id: "property-destruction",
    name: "Property Destruction",
    count: behaviorLibrary.filter((b) => b.category === "property-destruction").length,
    color: "yellow",
  },
  {
    id: "elopement",
    name: "Elopement",
    count: behaviorLibrary.filter((b) => b.category === "elopement").length,
    color: "purple",
  },
  {
    id: "non-compliance",
    name: "Non-Compliance",
    count: behaviorLibrary.filter((b) => b.category === "non-compliance").length,
    color: "blue",
  },
  {
    id: "tantrum",
    name: "Tantrum",
    count: behaviorLibrary.filter((b) => b.category === "tantrum").length,
    color: "pink",
  },
  {
    id: "stereotypy",
    name: "Stereotypy",
    count: behaviorLibrary.filter((b) => b.category === "stereotypy").length,
    color: "green",
  },
  {
    id: "vocal-disruption",
    name: "Vocal Disruption",
    count: behaviorLibrary.filter((b) => b.category === "vocal-disruption").length,
    color: "cyan",
  },
  {
    id: "social-avoidance",
    name: "Social Avoidance",
    count: behaviorLibrary.filter((b) => b.category === "social-avoidance").length,
    color: "indigo",
  },
]
