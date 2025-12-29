"use client"

import { useState, useEffect, useCallback } from "react"
import { useAutoSaveContext } from "@/contexts/auto-save-context"
import { useToast } from "@/hooks/use-toast"

export function useSectionData<T>(sectionKey: string, initialData: T) {
  const { saveData, loadData } = useAutoSaveContext()
  const { toast } = useToast()
  const [data, setData] = useState<T>(initialData)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load saved data on mount
  useEffect(() => {
    const savedData = loadData(sectionKey)
    if (savedData) {
      setData(savedData)
      toast({
        title: "Draft restored",
        description: `Your ${sectionKey.replace(/-/g, " ")} data has been loaded`,
        duration: 3000,
      })
    }
    setIsLoaded(true)
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
