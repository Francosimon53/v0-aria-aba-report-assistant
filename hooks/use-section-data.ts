"use client"

import { useState, useEffect, useCallback } from "react"
import { useAutoSaveContext } from "@/contexts/auto-save-context"
import { useToast } from "@/hooks/use-toast"
import { safeParseDate } from "@/lib/safe-date"

function reviveDates(obj: any): any {
  if (obj === null || obj === undefined) return obj

  if (Array.isArray(obj)) {
    return obj.map(reviveDates)
  }

  if (typeof obj === "object") {
    const result: any = {}
    for (const key in obj) {
      // Convert known date fields
      if (key === "timestamp" || key === "createdAt" || key === "updatedAt" || key === "date") {
        const parsed = safeParseDate(obj[key])
        result[key] = parsed || new Date()
      } else {
        result[key] = reviveDates(obj[key])
      }
    }
    return result
  }

  return obj
}

export function useSectionData<T>(sectionKey: string, initialData: T) {
  const { saveData, loadData } = useAutoSaveContext()
  const { toast } = useToast()
  const [data, setData] = useState<T>(initialData)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load saved data on mount
  useEffect(() => {
    try {
      const savedData = loadData(sectionKey)
      if (savedData) {
        const revivedData = reviveDates(savedData)
        setData(revivedData)
        toast({
          title: "Draft restored",
          description: `Your ${sectionKey.replace(/-/g, " ")} data has been loaded`,
          duration: 3000,
        })
      }
    } catch (error) {
      console.error(`Error loading ${sectionKey}:`, error)
      // Don't show error to user, just use initial data
    } finally {
      setIsLoaded(true)
    }
  }, [sectionKey, loadData, toast])

  // Update data and trigger auto-save
  const updateData = useCallback(
    (newData: T | ((prev: T) => T)) => {
      setData((prev) => {
        const updated = typeof newData === "function" ? (newData as (prev: T) => T)(prev) : newData

        // Save to context (triggers auto-save)
        saveData(sectionKey, updated)

        return updated
      })
    },
    [sectionKey, saveData],
  )

  // Update a single field
  const updateField = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      updateData((prev) => ({ ...prev, [field]: value }))
    },
    [updateData],
  )

  return {
    data,
    setData: updateData,
    updateField,
    isLoaded,
  }
}
