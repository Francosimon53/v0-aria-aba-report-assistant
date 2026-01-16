import type { ClientData, AssessmentData, SelectedGoal } from "@/lib/types"

export const sampleClientData: ClientData = {
  id: "sample-1",
  firstName: "Sample",
  lastName: "Client",
  dateOfBirth: "2018-05-15",
  diagnosis: "Autism Spectrum Disorder",
  insuranceProvider: "Blue Cross",
  insuranceId: "123456789",
  guardianName: "Jane Doe",
  guardianPhone: "(555) 123-4567",
  guardianEmail: "jane.doe@email.com",
  referralSource: "Pediatrician",
  referralDate: "2024-01-01",
  assessmentDate: "2024-01-15",
  assessor: "Dr. Smith",
  supervisingBCBA: "Dr. Johnson",
}

export const sampleAssessmentData: AssessmentData = {
  clientId: "sample-1",
  assessmentType: "Initial",
  assessmentDate: "2024-01-15",
  domains: [],
  strengths: ["Good eye contact", "Follows simple instructions"],
  deficits: ["Limited verbal communication", "Difficulty with transitions"],
  barriers: ["Sensory sensitivities"],
  recommendations: ["ABA therapy 20 hours/week"],
  hoursRecommended: 20,
  hoursJustification: "Based on assessment results and clinical judgment",
}

export const sampleSelectedGoals: SelectedGoal[] = []

export const sampleNarrativeSections = [
  { title: "Background", content: "Sample background content", order: 1 },
  { title: "Assessment Results", content: "Sample results", order: 2 },
]

export const sampleReport = {
  clientData: sampleClientData,
  assessmentData: sampleAssessmentData,
  selectedGoals: sampleSelectedGoals,
  narrativeSections: sampleNarrativeSections,
}
