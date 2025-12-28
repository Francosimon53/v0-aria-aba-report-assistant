"use client"

import { useEffect } from "react"
import { runStorageMigration } from "@/lib/storage-migration"

/**
 * StorageBootstrap Component
 *
 * Runs storage migration once per session BEFORE any page code executes.
 * Ensures aria_evaluation_type and other keys are properly normalized.
 *
 * This component should be included near the root of the app layout.
 */
export default function StorageBootstrap() {
  useEffect(() => {
    // Run migration immediately on mount
    runStorageMigration()
  }, [])

  // This component renders nothing
  return null
}
