"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeftIcon, SparklesIcon, MailIcon, ClockIcon, CheckCircleIcon } from "@/components/icons"
import { Globe, Linkedin, Twitter } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ContactPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
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
          <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl opacity-90">
            We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                <p className="text-gray-600">
                  Have questions about ARIA? Want to schedule a demo? Our team is here to help.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#0D9488]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MailIcon className="h-5 w-5 text-[#0D9488]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <a
                      href="mailto:francosimon@hotmail.com"
                      className="block text-gray-600 hover:text-[#0D9488] transition-colors"
                    >
                      support@ariaba.app
                    </a>
                    <a
                      href="mailto:francosimon@hotmail.com"
                      className="block text-gray-600 hover:text-[#0D9488] transition-colors"
                    >
                      sales@ariaba.app
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#0D9488]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="h-5 w-5 text-[#0D9488]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Location</h3>
                    <p className="text-gray-600">Ave Maria, Florida</p>
                    <p className="text-gray-600">United States</p>
                    <p className="text-sm text-gray-500 mt-1">Serving BCBAs across the United States</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#0D9488]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ClockIcon className="h-5 w-5 text-[#0D9488]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Support Hours</h3>
                    <p className="text-gray-600">Monday - Friday: 9am - 6pm EST</p>
                    <p className="text-gray-600">Weekend: Email support only</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-3">Follow Us</h3>
                <div className="flex gap-4">
                  <span className="text-gray-400 flex items-center gap-2 cursor-not-allowed">
                    <Linkedin className="h-5 w-5" />
                    LinkedIn (Coming soon)
                  </span>
                  <span className="text-gray-400 flex items-center gap-2 cursor-not-allowed">
                    <Twitter className="h-5 w-5" />
                    Twitter (Coming soon)
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <Card className="text-center py-16">
                  <CardContent>
                    <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Thank You!</h3>
                    <p className="text-gray-600 mb-6">
                      Your message has been received. We&apos;ll get back to you within 1 business day.
                    </p>
                    <Button onClick={() => router.push("/")} className="bg-[#0D9488] hover:bg-[#0D9488]/90">
                      Back to Home
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="John Smith"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="john@example.com"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Company/Organization</label>
                          <Input
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            placeholder="ABC Therapy Services"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                          <Input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="(555) 123-4567"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subject <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          placeholder="How can we help?"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Message <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                          rows={6}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Tell us more about your needs..."
                          required
                        />
                      </div>
                      <Button type="submit" size="lg" className="w-full bg-[#0D9488] hover:bg-[#0D9488]/90">
                        Send Message
                      </Button>
                      <p className="text-sm text-gray-500 text-center">
                        By submitting this form, you agree to our{" "}
                        <a href="/privacy" className="text-[#0D9488] hover:underline">
                          Privacy Policy
                        </a>
                        .
                      </p>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
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
