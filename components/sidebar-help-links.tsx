"use client"

import Link from "next/link"
import { HelpCircle, Shield } from "lucide-react"

export function SidebarHelpLinks() {
  return (
    <div className="border-t pt-3 mt-3">
      <Link
        href="/help"
        className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
      >
        <HelpCircle className="h-4 w-4" />
        <span>Help & Support</span>
      </Link>
      <Link
        href="/hipaa"
        className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
      >
        <Shield className="h-4 w-4" />
        <span>HIPAA</span>
      </Link>
    </div>
  )
}
