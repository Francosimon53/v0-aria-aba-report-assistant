"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeftIcon,
  SparklesIcon,
  SearchIcon,
  BookOpenIcon,
  MessageCircleIcon,
  MailIcon,
  CheckCircleIcon,
} from "@/components/icons"
import { useRouter } from "next/navigation"

const faqs = [
  {
    question: "How do I generate my first report?",
    answer:
      "Navigate to the Assessment tab, fill in the client information and assessment data, then click 'Generate Report'. Our AI will create a comprehensive draft that you can review and edit.",
  },
  {
    question: "Is ARIA HIPAA compliant?",
    answer:
      "Yes, ARIA is designed with HIPAA compliance in mind. All data is encrypted at rest and in transit, and we implement appropriate administrative, physical, and technical safeguards.",
  },
  {
    question: "Can I customize report templates?",
    answer:
      "Yes! Professional and Enterprise plans include customizable templates. You can modify section order, add custom fields, and save templates for future use.",
  },
  {
    question: "How do I cancel my subscription?",
    answer:
      "You can cancel anytime from your Account Settings. Your access will continue until the end of your current billing period.",
  },
  {
    question: "What insurance formats do you support?",
    answer:
      "ARIA supports major insurance formats including Medicaid, TRICARE, and most private insurers. Our templates are designed to meet common documentation requirements.",
  },
  {
    question: "Can multiple team members use one account?",
    answer:
      "Team collaboration is available on Professional (up to 5 users) and Enterprise (unlimited users) plans. Each user gets their own login credentials.",
  },
]

export default function SupportPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" })
  const [submitted, setSubmitted] = useState(false)

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
              <div className="w-8 h-8 bg-gradient-to-br from-[#0D9488] to-[#0891B2] rounded-lg flex items-center justify-center">
                <SparklesIcon className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">ARIA</span>
            </div>
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 bg-gradient-to-r from-[#0D9488] to-[#0891B2] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">How can we help?</h1>
          <p className="text-xl opacity-90 mb-8">Search our knowledge base or contact our support team</p>
          <div className="max-w-xl mx-auto relative">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-lg bg-white text-gray-900 border-0"
            />
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 -mt-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 bg-[#0D9488]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BookOpenIcon className="h-6 w-6 text-[#0D9488]" />
                </div>
                <CardTitle className="text-lg">Documentation</CardTitle>
                <CardDescription>Guides and tutorials</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 bg-[#0D9488]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <MessageCircleIcon className="h-6 w-6 text-[#0D9488]" />
                </div>
                <CardTitle className="text-lg">Live Chat</CardTitle>
                <CardDescription>Chat with our team</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 bg-[#0D9488]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <MailIcon className="h-6 w-6 text-[#0D9488]" />
                </div>
                <CardTitle className="text-lg">Email Support</CardTitle>
                <CardDescription>Response within 24h</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
            {filteredFaqs.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No results found. Try a different search or contact us directly.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Still need help?</h2>
          {submitted ? (
            <Card className="text-center py-12">
              <CardContent>
                <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-600">We&apos;ll get back to you within 24 hours.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <Textarea
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-[#0D9488] hover:bg-[#0D9488]/90">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-gray-50">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          © 2025 ARIA. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
