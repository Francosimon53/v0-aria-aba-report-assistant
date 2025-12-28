"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { QuickPasteCard } from "../quick-paste-card"
import { Button } from "../ui/button"
import { Switch } from "../ui/switch"
import { Badge } from "../ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import type { StepComponentProps } from "@/lib/wizard-types"

interface ClientInformationStepProps extends StepComponentProps {
  isReassessment: boolean
  onReassessmentToggle: (value: boolean) => void
}

export function ClientInformationStep({
  data,
  onUpdate,
  isReassessment,
  onReassessmentToggle,
}: ClientInformationStepProps) {
  const handleQuickPaste = (suggestions: Record<string, string>) => {
    onUpdate(suggestions)
  }

  const handleImportPrevious = () => {
    // Simulate importing previous assessment data
    const mockPreviousData = {
      clientName: "John Smith",
      dateOfBirth: "2018-03-15",
      diagnosis: "F84.0",
      insuranceCompany: "Blue Cross Blue Shield",
      imported: true,
    }
    onUpdate(mockPreviousData)
  }

  return (
    <div className="container max-w-5xl mx-auto p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Client Information</h2>
        <p className="text-muted-foreground">
          Gather basic demographic and contact information for the client and their family.
        </p>
      </div>

      {/* Assessment Mode Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="reassessment-mode" className="text-base font-semibold">
                Assessment Type
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Choose between Initial Assessment or Reassessment mode
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={!isReassessment ? "font-semibold" : "text-muted-foreground"}>Initial Assessment</span>
              <Switch id="reassessment-mode" checked={isReassessment} onCheckedChange={onReassessmentToggle} />
              <span className={isReassessment ? "font-semibold" : "text-muted-foreground"}>Reassessment</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reassessment Import */}
      {isReassessment && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle>Reassessment Mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Import data from previous assessment to speed up this reassessment.
            </p>
            <Button onClick={handleImportPrevious} variant="default" className="w-full">
              Import previous assessment
            </Button>
            {data.imported && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Badge variant="default">Data Imported</Badge>
                <span>Previous assessment data has been loaded</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Paste */}
      <QuickPasteCard onApplySuggestions={handleQuickPaste} />

      {/* Form Sections */}
      <Accordion type="multiple" defaultValue={["client", "guardian", "insurance"]} className="space-y-4">
        <AccordionItem value="client" className="border rounded-lg px-6">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">Client Details</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">
                  Full Name{" "}
                  {data.imported && (
                    <Badge variant="secondary" className="ml-2">
                      Imported
                    </Badge>
                  )}
                </Label>
                <Input
                  id="clientName"
                  value={data.clientName || ""}
                  onChange={(e) => onUpdate({ clientName: e.target.value })}
                  placeholder="John Smith"
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={data.dateOfBirth || ""}
                  onChange={(e) => onUpdate({ dateOfBirth: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  value={data.age || ""}
                  onChange={(e) => onUpdate({ age: e.target.value })}
                  placeholder="6"
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={data.gender || ""} onValueChange={(v) => onUpdate({ gender: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="guardian" className="border rounded-lg px-6">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            Guardian & Contact Information
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guardianName">Guardian Name</Label>
                <Input
                  id="guardianName"
                  value={data.guardianName || ""}
                  onChange={(e) => onUpdate({ guardianName: e.target.value })}
                  placeholder="Jane Smith"
                />
              </div>
              <div>
                <Label htmlFor="relationship">Relationship</Label>
                <Select value={data.relationship || ""} onValueChange={(v) => onUpdate({ relationship: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mother">Mother</SelectItem>
                    <SelectItem value="father">Father</SelectItem>
                    <SelectItem value="guardian">Legal Guardian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={data.phone || ""}
                  onChange={(e) => onUpdate({ phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email || ""}
                  onChange={(e) => onUpdate({ email: e.target.value })}
                  placeholder="jane.smith@example.com"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="insurance" className="border rounded-lg px-6">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">Insurance & Funding</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="insuranceCompany">Insurance Company</Label>
                <Input
                  id="insuranceCompany"
                  value={data.insuranceCompany || ""}
                  onChange={(e) => onUpdate({ insuranceCompany: e.target.value })}
                  placeholder="Blue Cross Blue Shield"
                />
              </div>
              <div>
                <Label htmlFor="policyNumber">Policy Number</Label>
                <Input
                  id="policyNumber"
                  value={data.policyNumber || ""}
                  onChange={(e) => onUpdate({ policyNumber: e.target.value })}
                  placeholder="ABC123456789"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
