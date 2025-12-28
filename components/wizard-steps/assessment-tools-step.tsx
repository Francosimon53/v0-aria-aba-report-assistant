"use client"
import { Checkbox } from "../ui/checkbox"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Button } from "../ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import type { StepComponentProps } from "@/lib/wizard-types"
import { useState } from "react"
import { TemplateModal } from "../template-modal"

export function AssessmentToolsStep({ data, onUpdate }: StepComponentProps) {
  const [showTemplates, setShowTemplates] = useState(false)

  const assessmentTools = [
    "VB-MAPP",
    "ABLLS-R",
    "AFLS",
    "Vineland-3",
    "PLS-5",
    "Direct Observation",
    "Parent Interview",
  ]

  const templates = [
    {
      id: "initial",
      name: "Initial Assessment Core Tools",
      description: "Standard set of tools for comprehensive initial assessments",
      data: {
        tools: ["VB-MAPP", "Direct Observation", "Parent Interview"],
      },
    },
    {
      id: "reassessment",
      name: "Reassessment Focused Tools",
      description: "Streamlined tool set for progress reassessments",
      data: {
        tools: ["VB-MAPP", "Direct Observation"],
      },
    },
  ]

  return (
    <div className="container max-w-5xl mx-auto p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Assessment</h2>
        <p className="text-muted-foreground">
          Document assessment tools used and summarize findings across key skill domains.
        </p>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setShowTemplates(true)}>
          Use standard assessment set
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["tools", "domains"]} className="space-y-4">
        <AccordionItem value="tools" className="border rounded-lg px-6">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            Assessment Tools & Context
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              {assessmentTools.map((tool) => (
                <div key={tool} className="flex items-center space-x-2">
                  <Checkbox
                    id={tool}
                    checked={data.tools?.includes(tool)}
                    onCheckedChange={(checked) => {
                      const tools = data.tools || []
                      if (checked) {
                        onUpdate({ tools: [...tools, tool] })
                      } else {
                        onUpdate({ tools: tools.filter((t: string) => t !== tool) })
                      }
                    }}
                  />
                  <Label htmlFor={tool}>{tool}</Label>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Label htmlFor="context">Assessment Context</Label>
              <Textarea
                id="context"
                value={data.context || ""}
                onChange={(e) => onUpdate({ context: e.target.value })}
                placeholder="Describe the assessment setting, duration, and any relevant contextual factors..."
                rows={4}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="domains" className="border rounded-lg px-6">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            Skill Domains & Performance
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div>
              <Label htmlFor="domains-summary">Domains Summary</Label>
              <Textarea
                id="domains-summary"
                value={data.domainsSummary || ""}
                onChange={(e) => onUpdate({ domainsSummary: e.target.value })}
                placeholder="Summarize performance across communication, social skills, adaptive skills, etc..."
                rows={6}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <TemplateModal
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        title="Assessment Tool Templates"
        description="Choose a template to quickly fill common assessment tool combinations"
        templates={templates}
        onApplyTemplate={(templateData) => onUpdate(templateData)}
      />
    </div>
  )
}
