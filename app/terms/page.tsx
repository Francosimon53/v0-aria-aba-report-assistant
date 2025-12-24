"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeftIcon, SparklesIcon } from "@/components/icons"
import { useRouter } from "next/navigation"

export default function TermsPage() {
  const router = useRouter()

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

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: December 2, 2025</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using ARIA ABA Report Assistant, you agree to be bound by these Terms of Service. If you
              do not agree to these terms, do not use our services. These terms apply to all users, including BCBAs,
              RBTs, and administrative staff.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-600 leading-relaxed">
              ARIA provides AI-assisted tools for generating ABA assessment reports, treatment plans, progress notes,
              and related clinical documentation. Our service is designed to assist qualified professionals and does not
              replace professional clinical judgment.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>You must be a licensed or credentialed ABA professional to use clinical features</li>
              <li>You are responsible for verifying and approving all AI-generated content</li>
              <li>You must comply with HIPAA and other applicable healthcare regulations</li>
              <li>You must maintain the confidentiality of your account credentials</li>
              <li>You must not use the service for any unlawful purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. AI-Generated Content Disclaimer</h2>
            <p className="text-gray-600 leading-relaxed">
              ARIA uses artificial intelligence to assist in generating clinical documentation. All AI-generated content
              is intended as a starting point and must be reviewed, edited, and approved by a qualified professional
              before use. ARIA does not provide medical advice, diagnosis, or treatment recommendations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Subscription and Payment</h2>
            <p className="text-gray-600 leading-relaxed">
              ARIA offers subscription-based pricing. By subscribing, you agree to pay the applicable fees.
              Subscriptions automatically renew unless cancelled. Refunds are available within 14 days of initial
              purchase if you are not satisfied with the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              You retain ownership of all client data and clinical content you create using ARIA. ARIA retains ownership
              of the platform, AI models, templates, and underlying technology. You grant ARIA a limited license to
              process your data solely to provide the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              ARIA is provided &quot;as is&quot; without warranties of any kind. We are not liable for any indirect,
              incidental, or consequential damages arising from your use of the service. Our total liability is limited
              to the amount you paid for the service in the past 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Termination</h2>
            <p className="text-gray-600 leading-relaxed">
              Either party may terminate this agreement at any time. Upon termination, you may request an export of your
              data within 30 days. We reserve the right to suspend or terminate accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              For questions about these Terms, contact us at legal@aria-aba.com.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t bg-gray-50">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          © 2025 ARIA. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
