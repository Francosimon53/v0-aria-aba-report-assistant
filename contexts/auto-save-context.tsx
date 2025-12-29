"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface AutoSaveContextType {
  isSaving: boolean
  lastSaved: Date | null
  hasUnsavedChanges: boolean
  markAsChanged: () => void
  saveData: (key: string, data: any) => Promise<void>
  loadData: (key: string) => any | null
  saveAllSections: () => Promise<void>
}

const AutoSaveContext = createContext<AutoSaveContextType | undefined>(undefined)

export function AutoSaveProvider({ children }: { children: React.ReactNode }) {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({})
  const { toast } = useToast()

  // Mark that there are unsaved changes
  const markAsChanged = useCallback(() => {
    setHasUnsavedChanges(true)
  }, [])

  // Save data for a specific section
  const saveData = useCallback(async (key: string, data: any) => {
    setPendingChanges((prev) => ({ ...prev, [key]: data }))
    setHasUnsavedChanges(true)

    // Save to localStorage immediately
    const storageKey = `aria-assessment-${key}`
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        data,
        timestamp: new Date().toISOString(),
      }),
    )
  }, [])

  // Load data for a specific section
  const loadData = useCallback((key: string) => {
    const storageKey = `aria-assessment-${key}`
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return parsed.data
      } catch (e) {
        console.error(`Failed to load ${key}:`, e)
        return null
      }
    }
    return null
  }, [])

  // Save all sections
  const saveAllSections = useCallback(async () => {
    setIsSaving(true)
    try {
      // Here you could also sync to backend if needed
      // await fetch('/api/save-assessment', { body: JSON.stringify(pendingChanges) })

      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      setPendingChanges({})

      toast({
        title: "All changes saved",
        duration: 2000,
      })
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }, [pendingChanges, toast])

  // Auto-save every 30 seconds when there are changes
  useEffect(() => {
    if (!hasUnsavedChanges) return

    const timer = setTimeout(async () => {
      await saveAllSections()
    }, 30000)

    return () => clearTimeout(timer)
  }, [hasUnsavedChanges, saveAllSections])

  // Warning before leaving page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?"
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges])

  return (
    <AutoSaveContext.Provider
      value={{
        isSaving,
        lastSaved,
        hasUnsavedChanges,
        markAsChanged,
        saveData,
        loadData,
        saveAllSections,
      }}
    >
      {children}
    </AutoSaveContext.Provider>
  )
}

export const useAutoSaveContext = () => {
  const context = useContext(AutoSaveContext)
  if (!context) {
    throw new Error("useAutoSaveContext must be used within AutoSaveProvider")
  }
  return context
}
