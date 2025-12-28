"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeftIcon,
  CheckIcon,
  ArrowRightIcon,
  ClipboardIcon,
  FileTextIcon,
  CopyIcon,
  TrashIcon,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AssessmentSidebar } from "@/components/assessment-sidebar"
import { safeSetJSON, safeGetString } from "@/lib/safe-storage"

// Define types and interfaces
type AssessmentSetting = "clinic" | "home" | "school" | "telehealth" | "multiple"
type CooperationLevel = "highly-cooperative" | "variable" | "limited"
type EngagementLevel = "high" | "moderate" | "variable" | "low"
type PerformanceLevel = "significantly-below" | "below" | "near" | "at" | "above"

interface AssessmentTool {
  id: string
  label: string
}

interface SkillDomain {
  id: string
  name: string
  performanceLevel: PerformanceLevel | null
  strengths: string
  needs: string
  rating: number
}

// After line ~520, add new interface for preference items
interface PreferenceItem {
  id: string
  name: string
  category: "Tangible" | "Edible" | "Social" | "Activity"
  selectionPercentage: number
  rank: number
  notes: string
}

interface AssessmentData {
  // Assessment Tools & Context
  setting: AssessmentSetting | null
  dateStart: string
  dateEnd: string
  tools: string[]
  cooperationLevel: CooperationLevel | null
  contextNarrative: string

  // Direct Observation
  observationSettings: string[]
  observationDuration: string
  engagementLevel: EngagementLevel | null
  observedBehaviors: string
  functionalImpact: string
  observationNarrative: string

  // Skill Domains
  domains: SkillDomain[]

  // Preferences & Motivation
  preferredItems: string[]
  effectiveReinforcers: string
  ineffectiveReinforcers: string
  motivationNotes: string
  motivationNarrative: string

  // Preference Assessment Results
  preferenceResults: PreferenceItem[]
}

// Mock data for assessment tools
const ASSESSMENT_TOOLS: AssessmentTool[] = [
  { id: "structured-observation", label: "Structured observation" },
  { id: "vb-mapp", label: "VB-MAPP" },
  { id: "ablls-r", label: "ABLLS-R" },
  { id: "afls", label: "AFLS" },
  { id: "functional-skills", label: "Functional skills checklist" },
  { id: "parent-interview", label: "Parent/caregiver interview" },
  { id: "teacher-report", label: "Teacher report" },
]

// Mock data for default skill domains
const DEFAULT_DOMAINS: Omit<SkillDomain, "id">[] = [
  { name: "Communication", performanceLevel: null, strengths: "", needs: "", rating: 3 },
  { name: "Social & Play", performanceLevel: null, strengths: "", needs: "", rating: 3 },
  { name: "Adaptive / Daily Living", performanceLevel: null, strengths: "", needs: "", rating: 3 },
  { name: "Learning & Compliance / Executive Function", performanceLevel: null, strengths: "", needs: "", rating: 3 },
  { name: "Safety & Awareness", performanceLevel: null, strengths: "", needs: "", rating: 3 },
]

// Define mock preference items
const MOCK_PREFERENCE_ITEMS: PreferenceItem[] = [
  {
    id: "pref-1",
    name: "Toy Car",
    category: "Tangible",
    selectionPercentage: 75,
    rank: 1,
    notes: "Highly motivated by fast cars.",
  },
  {
    id: "pref-2",
    name: "Crackers",
    category: "Edible",
    selectionPercentage: 60,
    rank: 2,
    notes: "Enjoys crunchy snacks.",
  },
  {
    id: "pref-3",
    name: "High-Five",
    category: "Social",
    selectionPercentage: 50,
    rank: 3,
    notes: "Responds well to positive social praise.",
  },
  {
    id: "pref-4",
    name: "Playdough",
    category: "Activity",
    selectionPercentage: 80,
    rank: 1,
    notes: "Engages for extended periods.",
  },
]

// Added interface for Templates
interface Template {
  id: string
  title: string
  content: string
  category: string
}

// Define mock templates
const TEMPLATES: Template[] = [
  // Assessment Context Templates
  {
    id: "ctx-1",
    title: "Multiple data sources",
    content:
      "Assessment data were obtained using a combination of structured observation, caregiver interview, and standardized assessment tools, providing a comprehensive picture of the client's current functioning.",
    category: "Assessment Context",
  },
  {
    id: "ctx-2",
    title: "Limited cooperation",
    content:
      "The client required frequent breaks due to low attending and variable cooperation, which may have impacted the validity of certain assessment results.",
    category: "Assessment Context",
  },
  {
    id: "ctx-3",
    title: "High cooperation",
    content:
      "The client demonstrated excellent cooperation throughout the assessment process, maintaining high levels of attention and engagement across all administered tools.",
    category: "Assessment Context",
  },

  // Tools Used Templates
  {
    id: "tool-1",
    title: "VB-MAPP description",
    content:
      "The Verbal Behavior Milestones Assessment and Placement Program (VB-MAPP) was administered to assess verbal and related skills across manding, tacting, listener responding, and social behavior domains.",
    category: "Tools Used",
  },
  {
    id: "tool-2",
    title: "ABLLS-R description",
    content:
      "The Assessment of Basic Language and Learning Skills-Revised (ABLLS-R) was used to evaluate language, academic, self-help, and motor skills, identifying skill gaps and priorities for intervention.",
    category: "Tools Used",
  },
  {
    id: "tool-3",
    title: "Preference assessment",
    content:
      "A preference assessment was conducted using a multiple-stimulus without replacement (MSWO) format to identify highly preferred items and activities for use as reinforcers during intervention.",
    category: "Tools Used",
  },

  // Communication Domain Templates
  {
    id: "comm-1",
    title: "Baseline manding",
    content:
      "The client demonstrates limited independent manding, primarily using single words or gestures to request highly preferred items. Expansion of mand repertoire and generalization across communication partners is a priority target.",
    category: "Communication",
  },
  {
    id: "comm-2",
    title: "Receptive language",
    content:
      "Receptive language skills are emerging, with the client demonstrating the ability to follow simple one-step directions in structured contexts with visual supports.",
    category: "Communication",
  },
  {
    id: "comm-3",
    title: "AAC use",
    content:
      "The client utilizes an augmentative and alternative communication (AAC) device to supplement verbal communication, demonstrating proficiency with high-frequency requests and comments.",
    category: "Communication",
  },

  // Social/Play Templates
  {
    id: "social-1",
    title: "Peer engagement",
    content:
      "The client demonstrates minimal independent peer engagement, typically engaging in parallel play rather than interactive or cooperative play activities.",
    category: "Social/Play",
  },
  {
    id: "social-2",
    title: "Joint attention",
    content:
      "Joint attention skills are emerging, with the client demonstrating inconsistent responding to bids for shared attention and limited initiation of joint attention episodes.",
    category: "Social/Play",
  },

  // Adaptive Skills Templates
  {
    id: "adaptive-1",
    title: "Self-care baseline",
    content:
      "The client requires moderate to maximum assistance with self-care routines including dressing, grooming, and hygiene activities. Increasing independence in these functional life skills is a priority intervention target.",
    category: "Adaptive Skills",
  },
  {
    id: "adaptive-2",
    title: "Feeding skills",
    content:
      "Feeding skills demonstrate age-appropriate independence with typical utensil use and self-feeding across meal contexts.",
    category: "Adaptive Skills",
  },

  // Behavior Reduction Templates
  {
    id: "behavior-1",
    title: "Escape-maintained behavior",
    content:
      "Challenging behaviors appear to be maintained by escape from non-preferred tasks or demands, occurring with increased frequency during academic and self-care activities.",
    category: "Behavior Reduction",
  },
  {
    id: "behavior-2",
    title: "Attention-seeking behavior",
    content:
      "The client engages in attention-seeking behaviors including calling out and physical contact with adults, particularly during periods of low adult attention or engagement.",
    category: "Behavior Reduction",
  },

  // Summary Templates
  {
    id: "summary-1",
    title: "Medically necessary statement",
    content:
      "Findings indicate clinically significant deficits across communication, social, and adaptive skill domains that substantially interfere with the client's ability to function independently across home, school, and community settings. ABA services are medically necessary to address these deficits and support functional skill development.",
    category: "Summary of Findings",
  },
]

export default function AssessmentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [activeDomainId, setActiveDomainId] = useState<string | null>(null)

  const [smartPasteOpen, setSmartPasteOpen] = useState(false)
  const [templatesOpen, setTemplatesOpen] = useState(false)
  const [pastedText, setPastedText] = useState("")
  const [parsedCategories, setParsedCategories] = useState<Record<string, string>>({})

  // NOTE: This form data structure is out of sync with the components below.
  // The components expect properties like 'toolsUsed', 'communication', 'socialPlay', etc.
  // The initial state `formData` needs to be updated to reflect these expected properties.
  const [formData, setFormData] = useState<
    AssessmentData & {
      toolsUsed: string[]
      toolsNarrative: string
      communication: string
      socialPlay: string
      adaptive: string
      motorSkills: string
      cognitiveSkills: string
      academicSkills: string
      behaviorReduction: string
      summaryFindings: string
      participants: string // Added based on usage in the template
      duration: string // Added based on usage in the template
    }
  >({
    // Assessment Context & Tools
    setting: null,
    dateStart: "",
    dateEnd: "",
    tools: [], // This will be replaced by toolsUsed
    toolsNarrative: "",
    cooperationLevel: null,
    contextNarrative: "",
    participants: "", // Added
    duration: "", // Added

    // Direct Observation
    observationSettings: [],
    observationDuration: "",
    engagementLevel: null,
    observedBehaviors: "",
    functionalImpact: "",
    observationNarrative: "",

    // Skill Domains - Initialized with default structure
    domains: DEFAULT_DOMAINS.map((d, i) => ({ ...d, id: `domain-${i}` })),

    // This structure below maps to the new AccordionItem sections and is more accurate.
    // The 'domains' above are for the older structure.
    // We'll need to ensure this syncs up.
    // For now, initializing with placeholders based on the new sections.
    communication: "",
    socialPlay: "",
    adaptive: "",
    motorSkills: "",
    cognitiveSkills: "",
    academicSkills: "",
    behaviorReduction: "",
    summaryFindings: "",
    toolsUsed: [],

    // Preferences & Motivation
    preferredItems: [],
    effectiveReinforcers: "",
    ineffectiveReinforcers: "",
    motivationNotes: "",
    motivationNarrative: "",

    // Preference Assessment Results
    preferenceResults: [...MOCK_PREFERENCE_ITEMS], // Initialize with mock data
  })

  const [aiPreview, setAiPreview] = useState<{
    section: string
    content: string
  } | null>(null)

  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      handleAutoSave()
    }, 2000)

    return () => clearTimeout(timer)
  }, [formData])

  const handleAutoSave = () => {
    setIsSaving(true)
    safeSetJSON("assessment-step4", formData)
    setLastSaved(new Date())
    setTimeout(() => setIsSaving(false), 500)
  }

  const handleSmartPaste = () => {
    // Simulate intelligent text parsing into categories
    const categories: Record<string, string> = {}

    if (pastedText.toLowerCase().includes("vb-mapp") || pastedText.toLowerCase().includes("ablls")) {
      categories["Tools Used"] = "Assessment tools mentioned: VB-MAPP, ABLLS-R"
    }
    if (pastedText.toLowerCase().includes("communication") || pastedText.toLowerCase().includes("language")) {
      categories["Communication"] = pastedText.substring(0, 200) + "..."
    }
    if (pastedText.toLowerCase().includes("social") || pastedText.toLowerCase().includes("peer")) {
      categories["Social/Play"] = pastedText.substring(0, 200) + "..."
    }
    if (pastedText.toLowerCase().includes("adaptive") || pastedText.toLowerCase().includes("self-care")) {
      categories["Adaptive Skills"] = pastedText.substring(0, 200) + "..."
    }

    setParsedCategories(categories)
    toast({
      title: "Text analyzed",
      description: `Detected ${Object.keys(categories).length} relevant sections`,
    })
  }

  // Updated to handle potential type mismatch if category is not in fieldMap
  const insertParsedCategory = (category: string, field: keyof typeof formData) => {
    const text = parsedCategories[category]
    if (text) {
      setFormData((prev) => ({
        ...prev,
        [field]: prev[field] ? `${prev[field]}\n\n${text}` : text,
      }))
      toast({
        title: "Content inserted",
        description: `${category} has been added to the field.`,
      })
    } else {
      toast({
        title: "Insertion failed",
        description: `Category "${category}" not found in parsed text.`,
        variant: "destructive",
      })
    }
  }

  const copySection = (content: string, sectionName: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: "Copied to clipboard",
      description: `${sectionName} content has been copied`,
    })
  }

  const pasteIntoSection = async (field: keyof typeof formData) => {
    try {
      const text = await navigator.clipboard.readText()
      setFormData((prev) => ({
        ...prev,
        [field]: prev[field] ? `${prev[field]}\n\n${text}` : text,
      }))
      toast({
        title: "Content pasted",
        description: "Clipboard content has been added to the field",
      })
    } catch (err) {
      toast({
        title: "Paste failed",
        description: "Unable to read from clipboard",
        variant: "destructive",
      })
    }
  }

  const insertTemplate = (section: keyof typeof formData, text: string) => {
    setFormData((prev) => ({
      ...prev,
      [section]: prev[section] ? `${prev[section]}\n\n${text}` : text,
    }))
    toast({
      title: "Template inserted",
      description: "Clinical text has been added to the field.",
    })
  }

  const insertDomainTemplate = (domainId: string, field: "strengths" | "needs", text: string) => {
    setFormData((prev) => ({
      ...prev,
      domains: prev.domains.map((d) =>
        d.id === domainId ? { ...d, [field]: d[field] ? `${d[field]}\n\n${text}` : text } : d,
      ),
    }))
    toast({
      title: "Template inserted",
      description: "Clinical text has been added to the domain.",
    })
  }

  const toggleTool = (toolId: string) => {
    setFormData((prev) => ({
      ...prev,
      tools: prev.tools.includes(toolId) ? prev.tools.filter((t) => t !== toolId) : [...prev.tools, toolId],
    }))
  }

  const toggleObservationSetting = (setting: string) => {
    setFormData((prev) => ({
      ...prev,
      observationSettings: prev.observationSettings.includes(setting)
        ? prev.observationSettings.filter((s) => s !== setting)
        : [...prev.observationSettings, setting],
    }))
  }

  const addPreferredItem = (item: string) => {
    if (item.trim()) {
      setFormData((prev) => ({
        ...prev,
        preferredItems: [...prev.preferredItems, item.trim()],
      }))
    }
  }

  const removePreferredItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      preferredItems: prev.preferredItems.filter((_, i) => i !== index),
    }))
  }

  const updateDomain = (id: string, updates: Partial<SkillDomain>) => {
    setFormData((prev) => ({
      ...prev,
      domains: prev.domains.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    }))
  }

  const addCustomDomain = () => {
    const newDomain: SkillDomain = {
      id: `custom-${Date.now()}`,
      name: "New Domain",
      performanceLevel: null,
      strengths: "",
      needs: "",
      rating: 3,
    }
    setFormData((prev) => ({
      ...prev,
      domains: [...prev.domains, newDomain],
    }))
  }

  const removeDomain = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      domains: prev.domains.filter((d) => d.id !== id),
    }))
  }

  const generateAINarrative = async (section: string, context: any) => {
    setIsGenerating(true)
    setAiPreview({ section, content: "" })

    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 1500))

    let generatedText = ""

    switch (section) {
      case "context":
        generatedText = `Assessment data were obtained through ${formData.tools.length > 1 ? "multiple sources including" : ""} ${formData.tools
          .map((t) => ASSESSMENT_TOOLS.find((tool) => tool.id === t)?.label)
          .filter(Boolean)
          .join(
            ", ",
          )}. The assessment was conducted in a ${formData.setting} setting over ${formData.dateStart && formData.dateEnd ? "multiple sessions" : "the designated period"}. The client demonstrated ${formData.cooperationLevel === "highly-cooperative" ? "excellent cooperation throughout the assessment process" : formData.cooperationLevel === "variable" ? "variable levels of cooperation requiring frequent breaks and motivational support" : "limited cooperation which may have impacted the validity of certain assessment results"}.`
        break

      case "observation":
        generatedText = `Direct observation was conducted across ${formData.observationSettings.length > 1 ? "multiple settings" : "the primary assessment setting"} for a total duration of ${formData.observationDuration || "[duration]"}. The client's overall engagement was characterized as ${formData.engagementLevel}, requiring ${formData.engagementLevel === "low" || formData.engagementLevel === "variable" ? "frequent prompting and redirection" : "minimal support"} to maintain attention and participation. Observed behavioral patterns included ${formData.observedBehaviors || "[behavioral observations]"}, which significantly impact the client's ability to engage in functional activities across home, school, and community settings.`
        break

      case "domain":
        const domain = formData.domains.find((d) => d.id === activeDomainId)
        if (domain) {
          generatedText = `In the ${domain.name} domain, the client demonstrates performance ${domain.performanceLevel === "significantly-below" ? "significantly below expected levels for chronological age" : domain.performanceLevel === "below" ? "below age-expected levels" : domain.performanceLevel === "near" ? "approaching age-expected benchmarks" : "at or above age-expected levels"}. ${domain.strengths ? `Relative strengths include ${domain.strengths}.` : ""} ${domain.needs ? `Areas requiring intervention support include ${domain.needs}.` : ""} Continued targeted intervention in this domain is recommended to support functional skill development and independence.`
        }
        break

      case "motivation":
        generatedText = `The client responds ${formData.preferredItems.length > 5 ? "well" : "variably"} to a ${formData.preferredItems.length > 3 ? "broad" : "limited"} range of reinforcers including ${formData.preferredItems.slice(0, 3).join(", ")}${formData.preferredItems.length > 3 ? ", and others" : ""}. ${formData.effectiveReinforcers ? `Effective reinforcement strategies include ${formData.effectiveReinforcers}.` : ""} Ongoing preference assessments and systematic reinforcer expansion are recommended to maintain high levels of engagement and optimize learning rates across intervention targets.`
        break
    }

    setAiPreview({ section, content: generatedText })
    setIsGenerating(false)
  }

  const insertAINarrative = () => {
    if (!aiPreview) return

    switch (aiPreview.section) {
      case "context":
        setFormData((prev) => ({ ...prev, contextNarrative: aiPreview.content }))
        break
      case "observation":
        setFormData((prev) => ({ ...prev, observationNarrative: aiPreview.content }))
        break
      case "domain":
        if (activeDomainId) {
          setFormData((prev) => ({
            ...prev,
            domains: prev.domains.map((d) => (d.id === activeDomainId ? { ...d, needs: aiPreview.content } : d)),
          }))
        }
        break
      case "motivation":
        setFormData((prev) => ({ ...prev, motivationNarrative: aiPreview.content }))
        break
    }

    toast({
      title: "AI narrative inserted",
      description: "The generated text has been added to the field.",
    })
    setAiPreview(null)
  }

  const canContinue =
    formData.toolsUsed.length > 0 &&
    (formData.communication.length > 0 ||
      formData.socialPlay.length > 0 ||
      formData.adaptive.length > 0 ||
      formData.motorSkills.length > 0 ||
      formData.cognitiveSkills.length > 0 ||
      formData.academicSkills.length > 0 ||
      formData.behaviorReduction.length > 0)

  return (
    <div className="min-h-screen bg-background flex">
      <AssessmentSidebar />

      <div className="flex-1">
        <div className="border-b bg-card/50 sticky top-0 z-20 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="lg:hidden">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="hidden lg:block">
                  <h1 className="text-lg font-semibold">Assessment Context & Tools</h1>
                  <p className="text-sm text-muted-foreground">Step 4 of 18</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSmartPasteOpen(true)}>
                  <ClipboardIcon className="h-4 w-4 mr-2" />
                  Smart Paste
                </Button>

                <Sheet open={templatesOpen} onOpenChange={setTemplatesOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <FileTextIcon className="h-4 w-4 mr-2" />
                      Templates
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-[500px] overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Templates & Snippets</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                      {[
                        "Assessment Context",
                        "Tools Used",
                        "Communication",
                        "Social/Play",
                        "Adaptive Skills",
                        "Behavior Reduction",
                        "Summary of Findings",
                      ].map((category) => (
                        <div key={category} className="space-y-3">
                          <h3 className="font-semibold text-sm text-muted-foreground">{category}</h3>
                          <div className="space-y-2">
                            {TEMPLATES.filter((t) => t.category === category).map((template) => (
                              <Card key={template.id} className="p-3">
                                <div className="space-y-2">
                                  <p className="font-medium text-sm">{template.title}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-2">{template.content}</p>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs h-7 bg-transparent"
                                      onClick={() => {
                                        navigator.clipboard.writeText(template.content)
                                        toast({ title: "Copied to clipboard" })
                                      }}
                                    >
                                      <CopyIcon className="h-3 w-3 mr-1" />
                                      Copy
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>

                <Button size="sm" variant="outline">
                  Save Draft
                </Button>

                {/* Updated Next button to use new canContinue logic */}
                <Button size="sm" onClick={() => router.push("/assessment/abc-observation")} disabled={!canContinue}>
                  Next
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Accordion type="multiple" defaultValue={["context", "tools", "domains"]} className="space-y-4">
            <AccordionItem value="context" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="hover:no-underline py-5">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      A
                    </div>
                    <span className="font-semibold text-lg">Assessment Context</span>
                  </div>

                  {/* Section-level actions */}
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <ClipboardIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64">
                        <div className="space-y-3">
                          <p className="text-sm font-medium">Paste into section</p>
                          <Textarea placeholder="Paste text here..." rows={4} className="text-xs" />
                          <Button size="sm" className="w-full">
                            Insert
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => copySection(formData.contextNarrative, "Assessment Context")}
                    >
                      <CopyIcon className="h-4 w-4" />
                    </Button>

                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setTemplatesOpen(true)}>
                      <FileTextIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 pt-2">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Setting</Label>
                      <Select
                        value={formData.setting || undefined}
                        onValueChange={(v) => setFormData((prev) => ({ ...prev, setting: v as AssessmentSetting }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select setting..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="clinic">Clinic</SelectItem>
                          <SelectItem value="home">Home</SelectItem>
                          <SelectItem value="school">School</SelectItem>
                          <SelectItem value="telehealth">Telehealth</SelectItem>
                          <SelectItem value="multiple">Multiple settings</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Input
                        placeholder="e.g., 2 hours across 3 sessions"
                        value={formData.duration}
                        onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Participants</Label>
                    <Input
                      placeholder="BCBA, RBT, parent present..."
                      value={formData.participants}
                      onChange={(e) => setFormData((prev) => ({ ...prev, participants: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Context Narrative</Label>
                    <div className="relative group">
                      <Textarea
                        value={formData.contextNarrative}
                        onChange={(e) => setFormData((prev) => ({ ...prev, contextNarrative: e.target.value }))}
                        placeholder="Behavioral conditions, cooperation, engagement, interruptions..."
                        rows={4}
                        className="pr-10"
                      />

                      {/* Field-level utility strip */}
                      <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 bg-background/80 backdrop-blur-sm"
                          onClick={() => pasteIntoSection("contextNarrative")}
                          title="Paste from clipboard"
                        >
                          <ClipboardIcon className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 bg-background/80 backdrop-blur-sm"
                          onClick={() => copySection(formData.contextNarrative, "Context")}
                          title="Copy this content"
                        >
                          <CopyIcon className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 bg-background/80 backdrop-blur-sm"
                          onClick={() => setTemplatesOpen(true)}
                          title="Insert template"
                        >
                          <FileTextIcon className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 bg-background/80 backdrop-blur-sm"
                          onClick={() => setFormData((prev) => ({ ...prev, contextNarrative: "" }))}
                          title="Clear field"
                        >
                          <TrashIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="tools" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="hover:no-underline py-5">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      B
                    </div>
                    <span className="font-semibold text-lg">Assessment Tools Used</span>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => copySection(formData.toolsNarrative, "Tools")}
                    >
                      <CopyIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setTemplatesOpen(true)}>
                      <FileTextIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 pt-2">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {[
                      "VB-MAPP",
                      "ABLLS-R",
                      "AFLS",
                      "PEAK",
                      "ESDM",
                      "Vineland",
                      "BASC",
                      "Functional Assessment",
                      "Preference Assessment",
                    ].map((tool) => (
                      <Badge
                        key={tool}
                        variant={formData.toolsUsed.includes(tool) ? "default" : "outline"}
                        className="cursor-pointer px-3 py-1.5"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            toolsUsed: prev.toolsUsed.includes(tool)
                              ? prev.toolsUsed.filter((t) => t !== tool)
                              : [...prev.toolsUsed, tool],
                          }))
                        }}
                      >
                        {formData.toolsUsed.includes(tool) && <CheckIcon className="h-3 w-3 mr-1" />}
                        {tool}
                      </Badge>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label>Tools Description</Label>
                    <div className="relative group">
                      <Textarea
                        value={formData.toolsNarrative}
                        onChange={(e) => setFormData((prev) => ({ ...prev, toolsNarrative: e.target.value }))}
                        placeholder="Describe how tools were used, special considerations..."
                        rows={4}
                        className="pr-10"
                      />

                      <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 bg-background/80 backdrop-blur-sm"
                          onClick={() => pasteIntoSection("toolsNarrative")}
                        >
                          <ClipboardIcon className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 bg-background/80 backdrop-blur-sm"
                          onClick={() => copySection(formData.toolsNarrative, "Tools")}
                        >
                          <CopyIcon className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 bg-background/80 backdrop-blur-sm"
                          onClick={() => setTemplatesOpen(true)}
                        >
                          <FileTextIcon className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 bg-background/80 backdrop-blur-sm"
                          onClick={() => setFormData((prev) => ({ ...prev, toolsNarrative: "" }))}
                        >
                          <TrashIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="domains" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="hover:no-underline py-5">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    C
                  </div>
                  <span className="font-semibold text-lg">Skill Domains</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 pt-2">
                <div className="space-y-6">
                  {[
                    { key: "communication", label: "Communication" },
                    { key: "socialPlay", label: "Social / Play" },
                    { key: "adaptive", label: "Daily Living / Adaptive" },
                    { key: "motorSkills", label: "Motor Skills" },
                    { key: "cognitiveSkills", label: "Cognitive Skills" },
                    { key: "academicSkills", label: "Academic Skills" },
                    { key: "behaviorReduction", label: "Behavior Reduction" },
                  ].map((domain) => (
                    <div key={domain.key} className="space-y-2">
                      <Label className="text-base font-semibold">{domain.label}</Label>
                      <div className="relative group">
                        <Textarea
                          value={formData[domain.key as keyof typeof formData] as string}
                          onChange={(e) => setFormData((prev) => ({ ...prev, [domain.key]: e.target.value }))}
                          placeholder={`Performance summary, strengths, needs for ${domain.label.toLowerCase()}...`}
                          rows={4}
                          className="pr-10"
                        />

                        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 bg-background/80 backdrop-blur-sm"
                            onClick={() => pasteIntoSection(domain.key as keyof typeof formData)}
                          >
                            <ClipboardIcon className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 bg-background/80 backdrop-blur-sm"
                            onClick={() =>
                              copySection(formData[domain.key as keyof typeof formData] as string, domain.label)
                            }
                          >
                            <CopyIcon className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 bg-background/80 backdrop-blur-sm"
                            onClick={() => setTemplatesOpen(true)}
                          >
                            <FileTextIcon className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 bg-background/80 backdrop-blur-sm"
                            onClick={() => setFormData((prev) => ({ ...prev, [domain.key]: "" }))}
                          >
                            <TrashIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* ADDED SECTION: Preference Assessment Results */}
            <AccordionItem value="preference-assessment" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="hover:no-underline py-5">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    E
                  </div>
                  <span className="font-semibold text-lg">Preference Assessment Results</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 pt-2">
                <div className="space-y-4">
                  <Table>
                    <TableCaption>A list of preferred items and their assessment results.</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Selection %</TableHead>
                        <TableHead>Rank</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.preferenceResults.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.selectionPercentage}%</TableCell>
                          <TableCell>{item.rank}</TableCell>
                          <TableCell>{item.notes}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copySection(item.name, "Preference Item")}
                              >
                                <CopyIcon className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  /* TODO: Implement edit functionality */
                                }}
                              >
                                <FileTextIcon className="h-3 w-3" /> {/* Placeholder for edit icon */}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    preferenceResults: prev.preferenceResults.filter((i) => i.id !== item.id),
                                  }))
                                }
                              >
                                <TrashIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => {
                        /* TODO: Implement add new preference item */
                      }}
                    >
                      Add New Item
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="summary" className="border rounded-lg px-6 bg-card">
              <AccordionTrigger className="hover:no-underline py-5">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      D
                    </div>
                    <span className="font-semibold text-lg">Summary of Findings</span>
                    <Badge variant="secondary">Optional</Badge>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => copySection(formData.summaryFindings, "Summary")}
                    >
                      <CopyIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setTemplatesOpen(true)}>
                      <FileTextIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 pt-2">
                <div className="space-y-2">
                  <div className="relative group">
                    <Textarea
                      value={formData.summaryFindings}
                      onChange={(e) => setFormData((prev) => ({ ...prev, summaryFindings: e.target.value }))}
                      placeholder="Overall summary of assessment findings and medical necessity justification..."
                      rows={6}
                      className="pr-10"
                    />

                    <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 bg-background/80 backdrop-blur-sm"
                        onClick={() => pasteIntoSection("summaryFindings")}
                      >
                        <ClipboardIcon className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 bg-background/80 backdrop-blur-sm"
                        onClick={() => copySection(formData.summaryFindings, "Summary")}
                      >
                        <CopyIcon className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 bg-background/80 backdrop-blur-sm"
                        onClick={() => setTemplatesOpen(true)}
                      >
                        <FileTextIcon className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 bg-background/80 backdrop-blur-sm"
                        onClick={() => setFormData((prev) => ({ ...prev, summaryFindings: "" }))}
                      >
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => {
                const evaluationType = safeGetString("aria_evaluation_type", null)
                const prevRoute =
                  evaluationType === "Reassessment"
                    ? "/assessment/progress-dashboard"
                    : "/assessment/background-history"
                router.push(prevRoute)
              }}
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="flex items-center gap-3">
              <Button variant="outline">Save & Exit</Button>
              {/* Updated Continue button to use new canContinue logic */}
              <Button onClick={() => router.push("/assessment/abc-observation")} disabled={!canContinue}>
                Continue
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={`px-4 py-2 rounded-full text-sm font-medium shadow-lg transition-all ${
              isSaving
                ? "bg-muted text-muted-foreground"
                : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
            }`}
          >
            {isSaving ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4 inline mr-2" />
                All changes saved
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
