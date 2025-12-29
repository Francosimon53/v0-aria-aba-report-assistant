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

  useEffect(() => {
    const cleanupCorruptedData = () => {
      try {
        const keys = Object.keys(localStorage).filter((key) => key.startsWith("aria-"))

        keys.forEach((key) => {
          try {
            const value = localStorage.getItem(key)
            if (value) {
              const parsed = JSON.parse(value)

              // Check if timestamp is valid
              if (parsed.timestamp) {
                const date = new Date(parsed.timestamp)
                if (isNaN(date.getTime())) {
                  console.warn(`Removing corrupted data for ${key}`)
                  localStorage.removeItem(key)
                }
              }
            }
          } catch (e) {
            // If parsing fails, remove the item
            console.warn(`Removing unparseable data for ${key}`)
            localStorage.removeItem(key)
          }
        })
      } catch (e) {
        console.error("Error cleaning up localStorage:", e)
      }
    }

    cleanupCorruptedData()
  }, [])

  const markAsChanged = useCallback(() => {
    setHasUnsavedChanges(true)
  }, [])

  const saveData = useCallback(async (key: string, data: any) => {
    try {
      const storageKey = `aria-assessment-${key}`
      const timestamp = new Date().toISOString()

      // Validate timestamp before saving
      if (isNaN(new Date(timestamp).getTime())) {
        console.error("Invalid timestamp generated")
        return
      }

      localStorage.setItem(
        storageKey,
        JSON.stringify({
          data,
          timestamp,
        }),
      )

      setPendingChanges((prev) => ({ ...prev, [key]: data }))
      setHasUnsavedChanges(true)
    } catch (error) {
      console.error("Error saving data:", error)
    }
  }, [])

  const loadData = useCallback((key: string) => {
    try {
      const storageKey = `aria-assessment-${key}`
      const saved = localStorage.getItem(storageKey)

      if (!saved) return null

      const parsed = JSON.parse(saved)

      // Validate timestamp
      if (parsed.timestamp) {
        const date = new Date(parsed.timestamp)
        if (isNaN(date.getTime())) {
          console.warn(`Invalid timestamp in ${key}, removing`)
          localStorage.removeItem(storageKey)
          return null
        }
      }

      return parsed.data
    } catch (e) {
      console.error(`Failed to load ${key}:`, e)
      return null
    }
  }, [])

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
