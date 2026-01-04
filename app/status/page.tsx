"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Clock, Activity, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface HealthCheck {
  timestamp: string
  status: "healthy" | "degraded" | "down"
  responseTime: number
}

export default function PublicStatusPage() {
  const [currentStatus, setCurrentStatus] = useState<"healthy" | "degraded" | "down" | "checking">("checking")
  const [responseTime, setResponseTime] = useState<number>(0)
  const [lastChecked, setLastChecked] = useState<string>("")
  const [uptimeHistory, setUptimeHistory] = useState<HealthCheck[]>([])

  const checkHealth = async () => {
    const start = Date.now()
    try {
      const res = await fetch("/api/health", { cache: "no-store" })
      const data = await res.json()
      const responseTime = Date.now() - start

      setCurrentStatus(data.status)
      setResponseTime(responseTime)
      setLastChecked(new Date().toLocaleTimeString())

      setUptimeHistory((prev) => [
        { timestamp: new Date().toISOString(), status: data.status, responseTime },
        ...prev.slice(0, 49),
      ])
    } catch {
      setCurrentStatus("down")
      setResponseTime(0)
      setLastChecked(new Date().toLocaleTimeString())
    }
  }

  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 60000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-500"
      case "degraded":
        return "bg-yellow-500"
      case "down":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const uptimePercentage =
    uptimeHistory.length > 0
      ? ((uptimeHistory.filter((h) => h.status === "healthy").length / uptimeHistory.length) * 100).toFixed(1)
      : "100.0"

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to ARIA
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ARIA Status</h1>
            <p className="text-gray-600">Real-time system status for ARIA ABA Report Assistant</p>
          </div>
        </div>

        {/* Current Status */}
        <Card
          className="mb-6 border-2"
          style={{
            borderColor:
              currentStatus === "healthy"
                ? "#22c55e"
                : currentStatus === "degraded"
                  ? "#eab308"
                  : currentStatus === "down"
                    ? "#ef4444"
                    : "#9ca3af",
          }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {currentStatus === "healthy" ? (
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                ) : currentStatus === "checking" ? (
                  <Activity className="h-12 w-12 text-gray-400 animate-pulse" />
                ) : (
                  <XCircle className="h-12 w-12 text-red-500" />
                )}
                <div>
                  <h2 className="text-2xl font-bold">
                    {currentStatus === "healthy"
                      ? "All Systems Operational"
                      : currentStatus === "degraded"
                        ? "Partial Outage"
                        : currentStatus === "down"
                          ? "Major Outage"
                          : "Checking..."}
                  </h2>
                  <p className="text-gray-500">Last checked: {lastChecked || "Checking..."}</p>
                </div>
              </div>
              <Badge variant={currentStatus === "healthy" ? "default" : "destructive"} className="text-lg px-4 py-2">
                {currentStatus.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600">{uptimePercentage}%</p>
              <p className="text-sm text-gray-500">Uptime</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-blue-600">{responseTime}ms</p>
              <p className="text-sm text-gray-500">Response Time</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-purple-600">{uptimeHistory.length}</p>
              <p className="text-sm text-gray-500">Checks Today</p>
            </CardContent>
          </Card>
        </div>

        {/* Uptime History Bar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Uptime History (Last 50 checks)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1">
              {uptimeHistory
                .slice(0, 50)
                .reverse()
                .map((check, i) => (
                  <div
                    key={i}
                    className={`h-8 w-2 rounded ${getStatusColor(check.status)}`}
                    title={`${new Date(check.timestamp).toLocaleString()} - ${check.status} (${check.responseTime}ms)`}
                  />
                ))}
              {uptimeHistory.length === 0 && <p className="text-gray-400 text-sm">Collecting data...</p>}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Each bar represents one health check. Green = healthy, Yellow = degraded, Red = down
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-8">
          Powered by ARIA Health Monitor • Updates every 60 seconds
        </p>
      </div>
    </div>
  )
}
