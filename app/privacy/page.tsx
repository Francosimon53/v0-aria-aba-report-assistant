"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeftIcon, SparklesIcon } from "@/components/icons"
import { useRouter } from "next/navigation"

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: December 2, 2025</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed">
              ARIA collects information you provide directly to us, including your name, email address, professional
              credentials (BCBA certification), and organization information. We also collect data related to your use
              of our ABA report generation services, including client assessment data you input into our system.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. HIPAA Compliance</h2>
            <p className="text-gray-600 leading-relaxed">
              ARIA is designed to be HIPAA-compliant. We implement appropriate administrative, physical, and technical
              safeguards to protect the privacy and security of Protected Health Information (PHI). All client data is
              encrypted at rest and in transit using industry-standard encryption protocols.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>To provide and maintain our ABA report generation services</li>
              <li>To process transactions and send related information</li>
              <li>To send technical notices, updates, and support messages</li>
              <li>To improve and develop new features and services</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Retention</h2>
            <p className="text-gray-600 leading-relaxed">
              We retain your personal information for as long as your account is active or as needed to provide
              services. Client assessment data is retained according to your organization&apos;s retention policies and
              applicable healthcare regulations, which typically require 7 years for medical records.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We use industry-standard security measures including 256-bit SSL encryption, secure data centers with SOC
              2 Type II certification, regular security audits, and multi-factor authentication to protect your
              information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed">
              You have the right to access, correct, or delete your personal information. You may also request a copy of
              your data in a portable format. To exercise these rights, please contact us at privacy@aria-aba.com.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at:
              <br />
              <br />
              <strong>ARIA ABA Report Assistant</strong>
              <br />
              Email: privacy@aria-aba.com
              <br />
              Address: 123 Healthcare Way, Suite 400, San Francisco, CA 94102
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
