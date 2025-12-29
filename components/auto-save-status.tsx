"use client"

import { useAutoSaveContext } from "@/contexts/auto-save-context"
import { Loader2, CheckCircle2, Cloud, CloudOff, Save } from "@/components/icons"
import { Button } from "@/components/ui/button"

const formatTimeAgo = (date: Date | string | null | undefined): string => {
  if (!date) return ""

  try {
    // Convert to Date if it's a string
    const dateObj = typeof date === "string" ? new Date(date) : date

    // Validate the date
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return ""
    }

    const now = new Date()
    const seconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

    if (seconds < 0) return "just now"
    if (seconds < 60) return "just now"

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`

    const days = Math.floor(hours / 24)
    return `${days}d ago`
  } catch (error) {
    console.warn("formatTimeAgo error:", error)
    return ""
  }
}

const isValidDate = (date: Date | null): boolean => {
  return date instanceof Date && !isNaN(date.getTime())
}

export function AutoSaveStatus() {
  const { isSaving, lastSaved, hasUnsavedChanges, saveAllSections } = useAutoSaveContext()

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm">
        {isSaving ? (
          <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span className="text-xs font-medium">Saving...</span>
          </div>
        ) : hasUnsavedChanges ? (
          <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
            <CloudOff className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Unsaved changes</span>
          </div>
        ) : lastSaved && isValidDate(lastSaved) ? (
          <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Saved {formatTimeAgo(lastSaved)}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
            <Cloud className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Ready</span>
          </div>
        )}
      </div>

      {/* Manual save button */}
      <Button size="sm" onClick={saveAllSections} disabled={isSaving || !hasUnsavedChanges} className="gap-1.5">
        <Save className="h-3.5 w-3.5" />
        Save All
      </Button>
    </div>
  )
}
