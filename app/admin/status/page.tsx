"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Activity,
  Database,
  Brain,
  HardDrive,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

interface HealthData {
  timestamp: string
  status: "healthy" | "degraded" | "down"
  version: string
  services: {
    supabase: { status: string; latencyMs: number }
    ai: { status: string; latencyMs: number }
    storage: { status: string; documentCount: number }
  }
}

export default function StatusPage() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [history, setHistory] = useState<{ time: Date; status: string }[]>([])

  const fetchHealth = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/health", { cache: "no-store" })
      const data = await res.json()
      setHealth(data)
      setLastRefresh(new Date())
      setHistory((prev) => [...prev.slice(-19), { time: new Date(), status: data.status }])
    } catch (e) {
      setHealth({
        timestamp: new Date().toISOString(),
        status: "down",
        version: "unknown",
        services: {
          supabase: { status: "error", latencyMs: 0 },
          ai: { status: "error", latencyMs: 0 },
          storage: { status: "error", documentCount: 0 },
        },
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchHealth()
    const interval = setInterval(fetchHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === "healthy") return <CheckCircle2 className="h-5 w-5 text-green-500" />
    if (status === "warning") return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      healthy: "bg-green-100 text-green-800 border-green-200",
      warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
      error: "bg-red-100 text-red-800 border-red-200",
      degraded: "bg-yellow-100 text-yellow-800 border-yellow-200",
      down: "bg-red-100 text-red-800 border-red-200",
      unknown: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status] || colors.unknown}`}>
        {status.toUpperCase()}
      </span>
    )
  }

  const ServiceIcon = ({ name }: { name: string }) => {
    const icons: Record<string, React.ElementType> = {
      supabase: Database,
      ai: Brain,
      storage: HardDrive,
    }
    const Icon = icons[name] || Activity
    return <Icon className="h-5 w-5 text-muted-foreground" />
  }

  const serviceLabels: Record<string, string> = {
    supabase: "Database",
    ai: "AI Services",
    storage: "Document Storage",
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">System Status</h1>
            <p className="text-muted-foreground">ARIA Health Monitor</p>
          </div>
          <Button onClick={fetchHealth} disabled={loading} variant="outline" size="lg" className="gap-2 bg-transparent">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {health && (
          <>
            {/* Overall Status Card */}
            <Card
              className={`mb-6 border-2 ${
                health.status === "healthy"
                  ? "border-green-500 bg-green-50/50"
                  : health.status === "degraded"
                    ? "border-yellow-500 bg-yellow-50/50"
                    : "border-red-500 bg-red-50/50"
              }`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        health.status === "healthy"
                          ? "bg-green-100"
                          : health.status === "degraded"
                            ? "bg-yellow-100"
                            : "bg-red-100"
                      }`}
                    >
                      <StatusIcon status={health.status} />
                    </div>
                    <div>
                      <span className="text-xl">Overall Status</span>
                      <p className="text-sm font-normal text-muted-foreground">
                        {health.status === "healthy"
                          ? "All systems operational"
                          : health.status === "degraded"
                            ? "Some services experiencing issues"
                            : "Major outage detected"}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={health.status} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Version: {health.version}</span>
                  <span>Last checked: {lastRefresh?.toLocaleTimeString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Services Grid */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              {Object.entries(health.services).map(([name, service]) => (
                <Card key={name} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ServiceIcon name={name} />
                      {serviceLabels[name] || name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-3">
                      <StatusIcon status={service.status} />
                      <StatusBadge status={service.status} />
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {"latencyMs" in service && service.latencyMs > 0 && (
                        <p className="flex justify-between">
                          <span>Latency:</span>
                          <span className={service.latencyMs > 500 ? "text-yellow-600" : "text-green-600"}>
                            {service.latencyMs}ms
                          </span>
                        </p>
                      )}
                      {"documentCount" in service && (
                        <p className="flex justify-between">
                          <span>Documents:</span>
                          <span>{service.documentCount.toLocaleString()}</span>
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Status History */}
            {history.length > 1 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-1 items-center">
                    {history.map((h, i) => (
                      <div
                        key={i}
                        className={`h-8 w-3 rounded-sm ${
                          h.status === "healthy"
                            ? "bg-green-500"
                            : h.status === "degraded"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        title={`${h.time.toLocaleTimeString()}: ${h.status}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Last {history.length} checks</p>
                </CardContent>
              </Card>
            )}

            {/* Auto-refresh indicator */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              <span className="inline-flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                Auto-refreshes every 30 seconds
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
