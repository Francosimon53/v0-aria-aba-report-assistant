"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Lock,
  Key,
  FileText,
  Database,
  Layers,
  CheckCircle,
  Mail,
  Loader2,
  Award,
  Search,
  Fingerprint,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function HIPAAPage() {
  const router = useRouter()
  const { toast } = useToast()
  const baaFormRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState({
    organizationName: "",
    contactName: "",
    email: "",
    phone: "",
    organizationType: "",
    numberOfBcbas: "",
    message: "",
    authorized: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const scrollToBAA = () => {
    baaFormRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.organizationName ||
      !formData.contactName ||
      !formData.email ||
      !formData.organizationType ||
      !formData.authorized
    ) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields and confirm authorization.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/request-baa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to submit request")
      }

      setIsSubmitted(true)
      toast({
        title: "BAA Request Submitted",
        description: "Our compliance team will send your BAA within 1-2 business days.",
      })
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly at security@ariaba.app",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const complianceCards = [
    {
      icon: ShieldCheck,
      title: "HIPAA Compliant Infrastructure",
      description:
        "All data is processed and stored in HIPAA-compliant cloud infrastructure with signed Business Associate Agreements from all vendors",
    },
    {
      icon: Award,
      title: "SOC 2 Type II Aligned",
      description:
        "Our security practices align with SOC 2 Type II standards for data security, availability, and confidentiality",
    },
    {
      icon: Search,
      title: "Regular Security Audits",
      description:
        "We conduct regular security assessments and penetration testing to identify and address vulnerabilities",
    },
  ]

  const securityMeasures = [
    {
      icon: Lock,
      title: "Encryption at Rest & Transit",
      description: "All data encrypted using AES-256 encryption at rest and TLS 1.3 in transit",
    },
    {
      icon: Key,
      title: "Access Controls",
      description: "Role-based access control (RBAC) ensures users only access data they need",
    },
    {
      icon: FileText,
      title: "Audit Logging",
      description: "Comprehensive audit trails track all access to PHI for compliance reporting",
    },
    {
      icon: Database,
      title: "Automatic Backups",
      description: "Daily encrypted backups with 30-day retention and disaster recovery",
    },
    {
      icon: Fingerprint,
      title: "Secure Authentication",
      description: "Multi-factor authentication available, secure session management, automatic timeouts",
    },
    {
      icon: Layers,
      title: "Data Isolation",
      description: "Each organization's data is logically isolated with strict access boundaries",
    },
  ]

  const faqs = [
    {
      question: "What is a Business Associate Agreement (BAA)?",
      answer:
        "A BAA is a legal contract required by HIPAA between a covered entity (like your ABA practice) and a business associate (like ARIA) that will handle PHI. It ensures both parties understand their responsibilities for protecting patient data.",
    },
    {
      question: "Is ARIA a Covered Entity or Business Associate?",
      answer:
        "ARIA operates as a Business Associate. When you use ARIA to create assessment reports containing PHI, we process that data on your behalf under the terms of our BAA.",
    },
    {
      question: "Where is my data stored?",
      answer:
        "All data is stored in SOC 2 compliant data centers located in the United States. We use Supabase (built on AWS) for our database infrastructure, which maintains its own HIPAA compliance and BAA.",
    },
    {
      question: "Can I get a copy of your security policies?",
      answer:
        "Yes, enterprise customers can request detailed security documentation including our security policies, incident response procedures, and compliance certifications. Contact our security team for more information.",
    },
    {
      question: "What happens if there's a data breach?",
      answer:
        "We have a comprehensive incident response plan. In the unlikely event of a breach involving PHI, we will notify affected customers within 24 hours and work with you to meet all HIPAA breach notification requirements.",
    },
    {
      question: "Do you conduct employee background checks?",
      answer:
        "Yes, all employees with access to customer data undergo background checks and complete HIPAA training annually.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
              <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">ARIA</span>
            </div>
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-teal-50/50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-teal-700 text-sm font-medium mb-6">
            <Lock className="h-4 w-4" />
            HIPAA Compliant
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 text-balance">
            Your Data Security is Our Priority
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8 text-pretty">
            ARIA is built from the ground up to meet HIPAA requirements and protect your clients' Protected Health
            Information (PHI)
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={scrollToBAA} className="bg-teal-600 hover:bg-teal-700">
              Request BAA
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push("/contact")}>
              Contact Security Team
            </Button>
          </div>
        </div>
      </section>

      {/* Compliance Overview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {complianceCards.map((card, index) => (
              <Card key={index} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center mb-4">
                    <card.icon className="h-6 w-6 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-gray-600 text-sm">{card.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Measures */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How We Protect PHI</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityMeasures.map((measure, index) => (
              <div key={index} className="flex gap-4 p-4">
                <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <measure.icon className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{measure.title}</h3>
                  <p className="text-sm text-gray-600">{measure.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BAA Request Form */}
      <section ref={baaFormRef} className="py-16 bg-white scroll-mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Request a Business Associate Agreement</h2>
            <p className="text-gray-600">
              Healthcare providers and covered entities can request a signed BAA to use ARIA for PHI
            </p>
          </div>

          {isSubmitted ? (
            <Card className="border-teal-200 bg-teal-50">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Request Submitted!</h3>
                <p className="text-gray-600">
                  Thank you! Our compliance team will send your BAA within 1-2 business days.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-lg">
              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="organizationName">Organization Name *</Label>
                      <Input
                        id="organizationName"
                        value={formData.organizationName}
                        onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                        placeholder="ABC Therapy Services"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Contact Name *</Label>
                      <Input
                        id="contactName"
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        placeholder="Dr. Jane Smith"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="jane@abctherapy.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="organizationType">Organization Type *</Label>
                      <Select
                        value={formData.organizationType}
                        onValueChange={(value) => setFormData({ ...formData, organizationType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aba-agency">ABA Agency</SelectItem>
                          <SelectItem value="private-practice">Private Practice</SelectItem>
                          <SelectItem value="school-district">School District</SelectItem>
                          <SelectItem value="hospital-clinic">Hospital/Clinic</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numberOfBcbas">Number of BCBAs</Label>
                      <Select
                        value={formData.numberOfBcbas}
                        onValueChange={(value) => setFormData({ ...formData, numberOfBcbas: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-5">1-5</SelectItem>
                          <SelectItem value="6-15">6-15</SelectItem>
                          <SelectItem value="16-50">16-50</SelectItem>
                          <SelectItem value="50+">50+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message/Notes (Optional)</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Any additional information or questions..."
                      rows={4}
                    />
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="authorized"
                      checked={formData.authorized}
                      onCheckedChange={(checked) => setFormData({ ...formData, authorized: checked as boolean })}
                    />
                    <Label htmlFor="authorized" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                      I confirm I am authorized to sign agreements on behalf of this organization
                    </Label>
                  </div>

                  <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Request BAA"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white rounded-lg border border-gray-200 px-6"
              >
                <AccordionTrigger className="text-left font-medium text-gray-900 hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-4">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Contact Security Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Have Security Questions?</h2>
          <p className="text-gray-600 mb-6">
            Our security team is available to answer questions about our HIPAA compliance program
          </p>
          <a
            href="mailto:security@ariaba.app"
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium mb-6"
          >
            <Mail className="h-5 w-5" />
            security@ariaba.app
          </a>
          <div>
            <Button variant="outline" onClick={() => router.push("/contact")}>
              Contact Security Team
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <footer className="py-8 border-t bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            Last updated: January 2026. ARIA is committed to maintaining the highest standards of data protection. This
            page describes our current security practices and compliance status.
          </p>
          <p className="text-sm text-gray-400 mt-4">© 2026 ARIA. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
