"use client"

import Link from "next/link"
import { HelpCircle, Shield, Mail } from "lucide-react"

export function AppFooter() {
  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-gray-600">
          <Link href="/help" className="hover:text-teal-600 flex items-center gap-1 transition-colors">
            <HelpCircle className="h-4 w-4" />
            Help Center
          </Link>
          <Link href="/hipaa" className="hover:text-teal-600 flex items-center gap-1 transition-colors">
            <Shield className="h-4 w-4" />
            HIPAA Compliance
          </Link>
          <a href="mailto:support@ariaba.app" className="hover:text-teal-600 flex items-center gap-1 transition-colors">
            <Mail className="h-4 w-4" />
            Contact Support
          </a>
          <Link href="/privacy" className="hover:text-teal-600 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-teal-600 transition-colors">
            Terms of Service
          </Link>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">© 2025 ARIA. All rights reserved.</p>
      </div>
    </footer>
  )
}
