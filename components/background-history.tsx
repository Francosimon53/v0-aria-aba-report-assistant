"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { SparklesIcon, SaveIcon, ClipboardCopyIcon, TrashIcon, CheckIcon } from "@/components/icons"
import { toast } from "@/hooks/use-toast"
import type { ClientData } from "@/lib/types"
import { cn } from "@/lib/utils"
import { safeGetJSON, safeSetJSON } from "@/lib/safe-storage"

interface BackgroundHistoryProps {
  clientData?: ClientData | null
  onSave?: () => void
}

const TEMPLATES: Record<string, string[]> = {
  developmental: [
    "Pregnancy and birth were reported as unremarkable with no complications.",
    "Motor milestones (walking, running) were achieved within typical developmental ranges.",
    "Language milestones showed delays, with first words emerging later than expected.",
  ],
  medical: [
    "Client has a diagnosis of Autism Spectrum Disorder (ASD).",
    "No current medications reported at this time.",
    "Sleep difficulties reported, including difficulty falling asleep.",
  ],
  behavioral: [
    "Primary behavioral concerns include tantrums and non-compliance.",
    "Aggressive behaviors observed including hitting and kicking.",
    "Behaviors occur most frequently during transitions.",
  ],
  communication: [
    "Client uses single words and 2-3 word phrases to communicate.",
    "Uses AAC device for communication needs.",
    "Receptive language appears stronger than expressive abilities.",
  ],
  adaptive: [
    "Client requires moderate assistance with self-care activities.",
    "Independent in basic self-care with minimal prompting.",
    "Requires full assistance for safety awareness in community.",
  ],
  social: [
    "Client shows limited spontaneous social engagement with peers.",
    "Play skills are primarily sensory-based and repetitive.",
    "Prefers solitary play but will engage with adult facilitation.",
  ],
  school: [
    "Client attends a specialized autism support classroom.",
    "Current IEP goals address communication and social skills.",
    "Receives speech therapy and occupational therapy services.",
  ],
  family: [
    "Parents report primary challenges include managing behaviors at home.",
    "Family demonstrates strong commitment to client's progress.",
    "Consistent strategies are used including visual supports.",
  ],
  previous: [
    "Client received ABA services for 2 years at 20 hours per week.",
    "Client responded well to visual supports and positive reinforcement.",
    "Previous treatment targeted communication and behavior reduction.",
  ],
}

const SECTIONS = [
  { id: "developmental", title: "Developmental History", color: "bg-blue-500" },
  { id: "medical", title: "Medical History", color: "bg-red-500" },
  { id: "behavioral", title: "Behavioral Concerns", color: "bg-orange-500" },
  { id: "communication", title: "Communication Skills", color: "bg-purple-500" },
  { id: "adaptive", title: "Adaptive Skills", color: "bg-green-500" },
  { id: "social", title: "Social & Play Skills", color: "bg-pink-500" },
  { id: "school", title: "School History / IEP", color: "bg-yellow-500" },
  { id: "family", title: "Family Interview", color: "bg-teal-500" },
  { id: "previous", title: "Previous ABA Services", color: "bg-indigo-500" },
]

export function BackgroundHistory({ clientData, onSave }: BackgroundHistoryProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({
    developmental: "",
    medical: "",
    behavioral: "",
    communication: "",
    adaptive: "",
    social: "",
    school: "",
    family: "",
    previous: "",
  })

  useEffect(() => {
    const saved = safeGetJSON("aria_background_history", null)
    if (saved) {
      setNotes(saved)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      handleAutoSave()
    }, 2000)
    return () => clearTimeout(timer)
  }, [notes])

  const handleAutoSave = () => {
    setIsSaving(true)
    safeSetJSON("aria_background_history", notes)
    setTimeout(() => {
      setIsSaving(false)
      setLastSaved(new Date())
    }, 500)
  }

  const updateNote = (section: string, value: string) => {
    setNotes((prev) => ({ ...prev, [section]: value }))
  }

  const insertTemplate = (section: string, template: string) => {
    setNotes((prev) => ({
      ...prev,
      [section]: prev[section] + (prev[section] ? "\n\n" : "") + template,
    }))
    toast({ title: "Inserted!", description: "Template added to section." })
  }

  const copySection = (section: string) => {
    navigator.clipboard.writeText(notes[section] || "")
    toast({ title: "Copied!", description: "Section copied to clipboard." })
  }

  const clearSection = (section: string) => {
    setNotes((prev) => ({ ...prev, [section]: "" }))
    toast({ title: "Cleared", description: "Section cleared." })
  }

  const handleContinue = () => {
    toast({ title: "Background saved", description: "Moving to next step..." })
    if (onSave) {
      onSave()
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Background & History</h2>
          <p className="text-muted-foreground mt-1">Comprehensive developmental, medical, and behavioral history</p>
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["developmental"]} className="space-y-3">
        {SECTIONS.map((section) => (
          <AccordionItem key={section.id} value={section.id} className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <div className={cn("h-2 w-2 rounded-full", section.color)} />
                <span className="font-medium">{section.title}</span>
                {notes[section.id] && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {notes[section.id].length} chars
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-4">
              <div className="flex flex-wrap gap-2">
                {TEMPLATES[section.id]?.map((template, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="cursor-pointer hover:bg-muted transition-colors text-xs"
                    onClick={() => insertTemplate(section.id, template)}
                  >
                    <SparklesIcon className="h-3 w-3 mr-1" />
                    {template.substring(0, 30)}...
                  </Badge>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={section.id + "-notes"}>{section.title} Notes</Label>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => copySection(section.id)}>
                      <ClipboardCopyIcon className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => clearSection(section.id)}>
                      <TrashIcon className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <Textarea
                  id={section.id + "-notes"}
                  placeholder={"Enter " + section.title.toLowerCase() + " details..."}
                  value={notes[section.id] || ""}
                  onChange={(e) => updateNote(section.id, e.target.value)}
                  rows={5}
                  className="resize-none"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="fixed bottom-6 left-6 z-40">
        <div
          className={cn(
            "px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium transition-all",
            isSaving ? "bg-muted text-muted-foreground" : "bg-green-50 text-green-700 border border-green-200",
          )}
        >
          {isSaving ? (
            <>
              <SaveIcon className="h-4 w-4 animate-pulse" />
              Saving...
            </>
          ) : (
            <>
              <CheckIcon className="h-4 w-4" />
              All changes saved
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t">
        <Button variant="outline">Back</Button>
        <div className="flex items-center gap-3">
          <Button variant="ghost">Save & Exit</Button>
          <Button onClick={handleContinue}>Continue</Button>
        </div>
      </div>
    </div>
  )
}
