export type InterventionCategory =
  | "Communication"
  | "Reinforcement"
  | "Differential Reinforcement"
  | "Teaching Tech"
  | "Behavior Reduction"
  | "Programs"

export type Intervention = {
  id: string
  name: string
  category: InterventionCategory
  description?: string
  defaultTargetFidelity?: number
  defaultMasterySessions?: number
  defaultChecklist?: string[]
}

export const interventionLibrary: Intervention[] = [
  // Communication / VB
  {
    id: "fct",
    name: "Functional Communication Training (FCT)",
    category: "Communication",
    defaultTargetFidelity: 90,
    defaultMasterySessions: 3,
  },
  { id: "cpp", name: "Cues–Pause–Point Language Training", category: "Communication" },
  { id: "echoic", name: "Echoic Training", category: "Communication" },
  { id: "mand", name: "Mand Training", category: "Communication" },
  { id: "intraverbal", name: "Intraverbal Training", category: "Communication" },
  { id: "tact", name: "Tact Training", category: "Communication" },
  { id: "listener", name: "Listener Training", category: "Communication" },
  { id: "ssp", name: "Stimulus–Stimulus Pairing", category: "Communication" },
  { id: "vb-shaping", name: "Shaping (Verbal Behavior)", category: "Communication" },
  { id: "pecs", name: "Picture Exchange Communication System (PECS)", category: "Communication" },
  { id: "prt", name: "Pivotal Response Training (PRT)", category: "Communication" },

  // Reinforcement / Motivation
  { id: "ncr-attn", name: "Non-Contingent Reinforcement (Attention) – NCR", category: "Reinforcement" },
  { id: "behavior-momentum", name: "High Probability Request Sequence (Behavior Momentum)", category: "Reinforcement" },
  { id: "premack", name: "Premack Principle", category: "Reinforcement" },
  { id: "token-economy", name: "Token Economy", category: "Reinforcement" },
  { id: "contingency-contract", name: "Contingency Contract", category: "Reinforcement" },

  // Differential Reinforcement
  {
    id: "dra",
    name: "Differential Reinforcement of Alternative Behavior (DRA)",
    category: "Differential Reinforcement",
  },
  {
    id: "dri",
    name: "Differential Reinforcement of Incompatible Behavior (DRI)",
    category: "Differential Reinforcement",
  },
  { id: "dro", name: "Differential Reinforcement of Other Behavior (DRO)", category: "Differential Reinforcement" },
  { id: "drh", name: "Differential Reinforcement of High Rates (DRH)", category: "Differential Reinforcement" },
  { id: "drl", name: "Differential Reinforcement of Low Rates (DRL)", category: "Differential Reinforcement" },
  { id: "drd", name: "Differential Reinforcement of Diminished Rates (DRD)", category: "Differential Reinforcement" },

  // Teaching Tech
  { id: "prompting", name: "Prompting (Physical / Modeling / Gestural / Verbal / Visual)", category: "Teaching Tech" },
  { id: "discrimination", name: "Discrimination Training (SD vs SΔ)", category: "Teaching Tech" },
  { id: "errorless", name: "Errorless Teaching", category: "Teaching Tech" },
  { id: "total-task-chaining", name: "Total Task Chaining", category: "Teaching Tech" },
  { id: "shaping-general", name: "General Shaping Procedures", category: "Teaching Tech" },

  // Behavior Reduction
  { id: "planned-ignoring", name: "Planned Ignoring", category: "Behavior Reduction" },
  { id: "rird", name: "Response Interruption and Redirection (RIRD)", category: "Behavior Reduction" },
  { id: "redirection", name: "Redirection to an Alternative Response", category: "Behavior Reduction" },
  { id: "response-block", name: "Response Block", category: "Behavior Reduction" },
  { id: "response-effort", name: "Response Effort", category: "Behavior Reduction" },
  { id: "escape-extinction", name: "Escape Extinction", category: "Behavior Reduction" },
  { id: "nce-breaks", name: "Non-Contingent Escape / Scheduled Breaks (FT10)", category: "Behavior Reduction" },

  // Programs
  { id: "satiation-deprivation", name: "Satiation/Deprivation Procedures", category: "Programs" },
  { id: "grad-exposure", name: "Graduated Exposure / Systematic Desensitization", category: "Programs" },
  { id: "habit-reversal", name: "Habit Reversal", category: "Programs" },
  { id: "picky-eating", name: "Picky Eating Intervention Program", category: "Programs" },
]

export function getInterventionsByCategory(category: InterventionCategory): Intervention[] {
  return interventionLibrary.filter((i) => i.category === category)
}

export function getIntervention(id: string): Intervention | undefined {
  return interventionLibrary.find((i) => i.id === id)
}

export const categoryColors: Record<InterventionCategory, string> = {
  Communication: "bg-blue-100 text-blue-700 border-blue-300",
  Reinforcement: "bg-green-100 text-green-700 border-green-300",
  "Differential Reinforcement": "bg-purple-100 text-purple-700 border-purple-300",
  "Teaching Tech": "bg-orange-100 text-orange-700 border-orange-300",
  "Behavior Reduction": "bg-red-100 text-red-700 border-red-300",
  Programs: "bg-indigo-100 text-indigo-700 border-indigo-300",
}
