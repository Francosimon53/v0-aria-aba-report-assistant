"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ClipboardIcon, ClipboardCopyIcon, FileTextIcon, CheckIcon } from "@/components/icons"
import { premiumToast } from "@/components/ui/premium-toast"
import { safeGetJSON, safeSetJSON } from "@/lib/safe-storage"

interface DomainData {
  severity: "none" | "mild" | "moderate" | "severe" | ""
  narrative: string
}

interface DomainsData {
  communication: DomainData
  socialPlay: DomainData
  adaptive: DomainData
  academic: DomainData
  maladaptive: DomainData
  flexibility: DomainData
  globalSummary: string
}

interface DomainsAndFunctionalImpactProps {
  onSave?: (data: DomainsData) => void
}

const DOMAIN_LABELS = {
  communication: "Communication",
  socialPlay: "Social / Play",
  adaptive: "Adaptive / Daily Living",
  academic: "Academic / Cognitive",
  maladaptive: "Maladaptive Behaviors",
  flexibility: "Flexibility / Tolerance",
}

const SEVERITY_OPTIONS = [
  { value: "none", label: "None / WNL" },
  { value: "mild", label: "Mild" },
  { value: "moderate", label: "Moderate" },
  { value: "severe", label: "Severe" },
]

const TEMPLATES = {
  communication: [
    "Client demonstrates limited functional communication, primarily relying on single words and gestures to express wants and needs across settings.",
    "Expressive language is significantly delayed compared to same-age peers, impacting ability to request, protest, and engage in social exchanges.",
  ],
  socialPlay: [
    "Client exhibits limited peer interaction, preferring solitary play activities over cooperative or reciprocal play with others.",
    "Social initiations are infrequent and brief, with minimal sustained engagement in age-appropriate social activities.",
  ],
  adaptive: [
    "Client requires substantial assistance with self-care routines including toileting, dressing, and mealtime behaviors.",
    "Independence in daily living activities is limited, requiring caregiver prompting and supervision for basic routines.",
  ],
  academic: [
    "Academic skills are significantly below grade-level expectations, particularly in areas requiring sustained attention and task completion.",
    "Learning progress is impacted by difficulty following multi-step instructions and generalizing learned skills across contexts.",
  ],
  maladaptive: [
    "Interfering behaviors including aggression and property destruction occur multiple times weekly, impacting learning opportunities and safety.",
    "Challenging behaviors manifest across home and community settings, requiring intensive supervision and intervention.",
  ],
  flexibility: [
    "Client demonstrates significant difficulty tolerating changes in routine, with behavioral escalation during transitions.",
    "Rigidity around preferences and routines interferes with participation in varied activities and adaptive functioning.",
  ],
}

export function DomainsAndFunctionalImpact({ onSave }: DomainsAndFunctionalImpactProps) {
  const [data, setData] = useState<DomainsData>({
    communication: { severity: "", narrative: "" },
    socialPlay: { severity: "", narrative: "" },
    adaptive: { severity: "", narrative: "" },
    academic: { severity: "", narrative: "" },
    maladaptive: { severity: "", narrative: "" },
    flexibility: { severity: "", narrative: "" },
    globalSummary: "",
  })

  const [smartPasteOpen, setSmartPasteOpen] = useState(false)
  const [currentDomain, setCurrentDomain] = useState<keyof DomainsData | null>(null)
  const [pasteText, setPasteText] = useState("")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  // Load data from localStorage
  useEffect(() => {
    const saved = safeGetJSON("aria_domains_data", null)
    if (saved) {
      setData(saved)
    }
  }, [])

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      safeSetJSON("aria_domains_data", data)
      setLastSaved(new Date())
    }, 1000)
    return () => clearTimeout(timer)
  }, [data])

  const handleSeverityChange = (domain: keyof Omit<DomainsData, "globalSummary">, severity: string) => {
    setData((prev) => ({
      ...prev,
      [domain]: {
        ...prev[domain],
        severity: severity as "none" | "mild" | "moderate" | "severe",
      },
    }))
  }

  const handleNarrativeChange = (domain: keyof DomainsData, value: string) => {
    setData((prev) => ({
      ...prev,
      [domain]: typeof prev[domain] === "object" ? { ...prev[domain], narrative: value } : value,
    }))
  }

  const handleSmartPaste = (domain: keyof DomainsData) => {
    setCurrentDomain(domain)
    setSmartPasteOpen(true)
    setPasteText("")
  }

  const handleCleanAndInsert = () => {
    if (currentDomain && pasteText.trim()) {
      // Clean the text
      const cleaned = pasteText
        .replace(/\n{3,}/g, "\n\n") // Collapse multiple line breaks
        .replace(/ {2,}/g, " ") // Collapse multiple spaces
        .trim()

      // Insert into the domain
      if (currentDomain === "globalSummary") {
        setData((prev) => ({ ...prev, globalSummary: cleaned }))
      } else {
        setData((prev) => ({
          ...prev,
          [currentDomain]: { ...prev[currentDomain as keyof Omit<DomainsData, "globalSummary">], narrative: cleaned },
        }))
      }

      premiumToast.success("Text inserted", "Content has been cleaned and added")
      setSmartPasteOpen(false)
      setPasteText("")
    }
  }

  const handleInsertTemplate = (domain: keyof DomainsData, template: string) => {
    if (domain === "globalSummary") {
      setData((prev) => ({
        ...prev,
        globalSummary: prev.globalSummary ? `${prev.globalSummary}\n\n${template}` : template,
      }))
    } else {
      setData((prev) => ({
        ...prev,
        [domain]: {
          ...prev[domain as keyof Omit<DomainsData, "globalSummary">],
          narrative: prev[domain as keyof Omit<DomainsData, "globalSummary">].narrative
            ? `${prev[domain as keyof Omit<DomainsData, "globalSummary">].narrative}\n\n${template}`
            : template,
        },
      }))
    }
    premiumToast.success("Template added", "Content has been appended")
  }

  const handleCopySection = async (domain: keyof DomainsData) => {
    const text =
      domain === "globalSummary"
        ? data.globalSummary
        : data[domain as keyof Omit<DomainsData, "globalSummary">].narrative
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSection(domain)
      premiumToast.success("Copied", "Section copied to clipboard")
      setTimeout(() => setCopiedSection(null), 2000)
    } catch (err) {
      premiumToast.error("Copy failed", "Unable to copy to clipboard")
    }
  }

  const getSeverityBadge = (severity: string) => {
    if (!severity) return null
    const colors = {
      none: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      mild: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
      moderate: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
      severe: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    }
    const labels = {
      none: "None / WNL",
      mild: "Mild Impairment",
      moderate: "Moderate Impairment",
      severe: "Severe Impairment",
    }
    return <Badge className={colors[severity as keyof typeof colors]}>{labels[severity as keyof typeof labels]}</Badge>
  }

  const renderToolbar = (domain: keyof DomainsData) => (
    <div className="flex items-center gap-2 mb-3">
      <Button variant="outline" size="sm" onClick={() => handleSmartPaste(domain)}>
        <ClipboardIcon className="w-4 h-4 mr-2" />
        Smart Paste
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <FileTextIcon className="w-4 h-4 mr-2" />
            Insert Template
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[400px]">
          {domain !== "globalSummary" &&
            TEMPLATES[domain as keyof typeof TEMPLATES]?.map((template, idx) => (
              <DropdownMenuItem key={idx} onClick={() => handleInsertTemplate(domain, template)} className="text-sm">
                {template.substring(0, 60)}...
              </DropdownMenuItem>
            ))}
          {domain === "globalSummary" && (
            <DropdownMenuItem
              onClick={() =>
                handleInsertTemplate(
                  domain,
                  "Overall, client demonstrates multi-domain impairments that significantly impact daily functioning across home, school, and community settings. ABA intervention is medically necessary to address these pervasive developmental delays and prevent further functional decline.",
                )
              }
              className="text-sm"
            >
              Template: Multi-domain impact summary
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="outline" size="sm" onClick={() => handleCopySection(domain)}>
        {copiedSection === domain ? (
          <CheckIcon className="w-4 h-4 mr-2 text-green-600" />
        ) : (
          <ClipboardCopyIcon className="w-4 h-4 mr-2" />
        )}
        Copy Section
      </Button>
    </div>
  )

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Auto-save indicator */}
      {lastSaved && (
        <div className="fixed top-20 right-6 text-xs text-muted-foreground bg-card/95 backdrop-blur-sm px-3 py-2 rounded-full shadow-md border animate-in fade-in-0 slide-in-from-right-2">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Saved {lastSaved.toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="border-b bg-card px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="text-xs">
                Step 5 of 18
              </Badge>
              <h1 className="text-2xl font-semibold text-foreground">Domains & Functional Impact</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Summarize how autism-related challenges affect communication, social, adaptive, and behavioral
              functioning.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {/* Overview Card */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Overview</h2>
          <p className="text-sm text-muted-foreground">
            Rate severity by domain and describe how each area impacts learning, safety, and daily living. Focus on
            observable, functional limitations rather than labels.
          </p>
        </Card>

        {/* Domain Severity Grid */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Domain Severity Grid</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm">Domain</th>
                  {SEVERITY_OPTIONS.map((opt) => (
                    <th key={opt.value} className="text-center py-3 px-4 font-medium text-sm">
                      {opt.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(Object.keys(DOMAIN_LABELS) as Array<keyof typeof DOMAIN_LABELS>).map((domain) => (
                  <tr key={domain} className="border-b">
                    <td className="py-3 px-4 text-sm">{DOMAIN_LABELS[domain]}</td>
                    {SEVERITY_OPTIONS.map((opt) => (
                      <td key={opt.value} className="text-center py-3 px-4">
                        <input
                          type="radio"
                          name={`severity-${domain}`}
                          value={opt.value}
                          checked={data[domain].severity === opt.value}
                          onChange={() => handleSeverityChange(domain, opt.value)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Per-Domain Narrative Cards */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Domain Narratives</h2>
          <Accordion type="multiple" className="space-y-2">
            {(Object.keys(DOMAIN_LABELS) as Array<keyof typeof DOMAIN_LABELS>).map((domain) => (
              <AccordionItem key={domain} value={domain}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{DOMAIN_LABELS[domain]}</span>
                    {getSeverityBadge(data[domain].severity)}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  {renderToolbar(domain)}
                  <div>
                    <Label htmlFor={`${domain}-narrative`} className="text-sm font-medium mb-2 block">
                      Functional Impact & Clinical Notes
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Describe how difficulties in this domain affect daily functioning, learning, safety, or caregiver
                      burden. Use objective, behavioral language.
                    </p>
                    <Textarea
                      id={`${domain}-narrative`}
                      value={data[domain].narrative}
                      onChange={(e) => handleNarrativeChange(domain, e.target.value)}
                      rows={6}
                      className="resize-none"
                      placeholder={`Enter clinical notes for ${DOMAIN_LABELS[domain].toLowerCase()}...`}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        {/* Global Functional Summary */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Global Functional Summary</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Optional: Summarize overall functional impact across domains in 1–2 concise paragraphs.
          </p>
          {renderToolbar("globalSummary")}
          <Textarea
            value={data.globalSummary}
            onChange={(e) => setData((prev) => ({ ...prev, globalSummary: e.target.value }))}
            rows={6}
            className="resize-none"
            placeholder="Enter global summary..."
          />
        </Card>
      </div>

      {/* Smart Paste Modal */}
      <Dialog open={smartPasteOpen} onOpenChange={setSmartPasteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Smart Paste –{" "}
              {currentDomain === "globalSummary"
                ? "Global Summary"
                : currentDomain
                  ? DOMAIN_LABELS[currentDomain as keyof typeof DOMAIN_LABELS]
                  : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={8}
              placeholder="Paste raw text from reports, notes, or previous assessments about this domain..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSmartPasteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCleanAndInsert}>Clean & Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
