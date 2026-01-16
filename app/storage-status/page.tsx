"use client"

import { StorageStatusViewer } from "@/components/storage-status-viewer"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "@/components/icons"

export default function StorageStatusPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => (window.location.href = "/dashboard")} className="mb-4">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Assessment Data Storage</h1>
          <p className="text-gray-600 mt-1">
            View where your assessment data is stored and verify that everything is being saved correctly.
          </p>
        </div>

        <StorageStatusViewer />

        <div className="mt-6 p-4 bg-white rounded-lg border">
          <h2 className="font-semibold text-gray-900 mb-3">Storage Location</h2>
          <p className="text-sm text-gray-600 mb-4">
            All assessment data is stored in your browser's <strong>localStorage</strong>. This means:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-2 ml-4">
            <li>Data persists even when you close the browser</li>
            <li>Data is stored locally on your device (not sent to servers until you explicitly save)</li>
            <li>Each section has its own storage key for easy identification</li>
            <li>The "Complete Assessment" combines all sections into one document for the final report</li>
          </ul>

          <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
            <strong>Important:</strong> To keep your data safe permanently, use the "Save All" button which will sync
            your data to the cloud database (Supabase).
          </div>
        </div>
      </div>
    </div>
  )
}
