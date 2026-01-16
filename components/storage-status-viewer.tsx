"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2Icon, XCircleIcon, RefreshCwIcon, DownloadIcon, DatabaseIcon, ClockIcon } from "@/components/icons"
import { getStorageStatus, exportAssessmentAsJSON, updateCompleteAssessment } from "@/lib/assessment-storage"

interface StorageStatusViewerProps {
  compact?: boolean
}

export function StorageStatusViewer({ compact = false }: StorageStatusViewerProps) {
  const [status, setStatus] = useState<ReturnType<typeof getStorageStatus>>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshStatus = () => {
    setIsRefreshing(true)
    updateCompleteAssessment()
    setStatus(getStorageStatus())
    setTimeout(() => setIsRefreshing(false), 500)
  }

  useEffect(() => {
    refreshStatus()
    // Refresh every 5 seconds
    const interval = setInterval(refreshStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const completedCount = status.filter((s) => s.hasData).length
  const totalCount = status.length

  const handleExport = () => {
    const json = exportAssessmentAsJSON()
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `aria-assessment-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "Never"
    return date.toLocaleString()
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <DatabaseIcon className="h-4 w-4 text-gray-500" />
        <span className="text-gray-600">
          {completedCount}/{totalCount} sections saved
        </span>
        <Button variant="ghost" size="sm" onClick={refreshStatus} disabled={isRefreshing}>
          <RefreshCwIcon className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <DatabaseIcon className="h-5 w-5 text-teal-600" />
            Assessment Data Storage
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refreshStatus} disabled={isRefreshing}>
              <RefreshCwIcon className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <DownloadIcon className="h-4 w-4 mr-1" />
              Export JSON
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <Badge
            variant={completedCount === totalCount ? "default" : "secondary"}
            className="bg-teal-100 text-teal-800"
          >
            {completedCount} of {totalCount} sections have data
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {status.map((item) => (
            <div
              key={item.key}
              className={`flex items-center justify-between p-2 rounded-lg ${
                item.hasData ? "bg-green-50" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2">
                {item.hasData ? (
                  <CheckCircle2Icon className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircleIcon className="h-4 w-4 text-gray-400" />
                )}
                <span className={item.hasData ? "text-gray-900 font-medium" : "text-gray-500"}>{item.section}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {item.hasData && (
                  <>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="h-3 w-3" />
                      {formatDate(item.savedAt)}
                    </span>
                    <span className="text-gray-400">{item.dataSize}</span>
                  </>
                )}
                <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{item.key}</code>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
          <strong>How it works:</strong> Each section saves to localStorage with a unique key. When you generate the
          final report, all sections are combined from the "Complete Assessment" document. Data persists in your browser
          until you clear it.
        </div>
      </CardContent>
    </Card>
  )
}
