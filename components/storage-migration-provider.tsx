"use client"

import type React from "react"

import { useEffect } from "react"
import { runStorageMigration } from "@/lib/storage-migration"

/**
 * Client component that runs storage migration once on mount
 * Should be placed high in the component tree (e.g., in root layout)
 */
export function StorageMigrationProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Run migration on client-side mount
    runStorageMigration()
  }, [])

  return <>{children}</>
}
