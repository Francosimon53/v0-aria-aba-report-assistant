"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { AlertTriangle, Clock, User, RefreshCw, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ErrorLog {
  id: string
  error_type: string
  details: {
    message?: string
    stack?: string
    component?: string
    url?: string
  }
  user_id: string | null
  created_at: string
}

export default function ErrorsPage() {
  const [errors, setErrors] = useState<ErrorLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchErrors()
  }, [])

  const fetchErrors = async () => {
    setIsLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from("error_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (!error && data) {
      setErrors(data)
    }
    setIsLoading(false)
  }

  const toggleExpanded = (id: string) => {
    setExpandedErrors((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const getErrorTypeBadge = (type: string) => {
    switch (type?.toLowerCase()) {
      case "ai_generation":
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">AI</Badge>
      case "database":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Database</Badge>
      case "auth":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Auth</Badge>
      default:
        return <Badge variant="secondary">{type || "Unknown"}</Badge>
    }
  }

  // Group errors by type for stats
  const errorStats = errors.reduce(
    (acc, err) => {
      const type = err.error_type || "unknown"
      acc[type] = (acc[type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Error Monitoring</h1>
          <p className="text-muted-foreground">Loading errors...</p>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-200 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Error Monitoring</h1>
          <p className="text-muted-foreground">Recent errors from the application</p>
        </div>
        <Button onClick={fetchErrors} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Errors</p>
                <p className="text-xl font-bold">{errors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {Object.entries(errorStats)
          .slice(0, 3)
          .map(([type, count]) => (
            <Card key={type}>
              <CardContent className="p-4">
                <div>
                  <p className="text-sm text-muted-foreground capitalize">{type.replace("_", " ")}</p>
                  <p className="text-xl font-bold">{count}</p>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Error List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Errors</CardTitle>
        </CardHeader>
        <CardContent>
          {errors.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No errors logged</p>
            </div>
          ) : (
            <div className="space-y-4">
              {errors.map((error) => (
                <div key={error.id} className="border rounded-lg overflow-hidden">
                  <div
                    className="p-4 flex items-start justify-between cursor-pointer hover:bg-slate-50"
                    onClick={() => toggleExpanded(error.id)}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getErrorTypeBadge(error.error_type)}
                          <span className="text-sm font-medium truncate">
                            {error.details?.message || "Unknown error"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(error.created_at).toLocaleString()}
                          </span>
                          {error.user_id && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {error.user_id.slice(0, 8)}...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {expandedErrors.has(error.id) ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                  </div>

                  {expandedErrors.has(error.id) && (
                    <div className="px-4 pb-4 pt-0 border-t bg-slate-50">
                      <div className="space-y-2 mt-3">
                        {error.details?.component && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Component</p>
                            <p className="text-sm font-mono">{error.details.component}</p>
                          </div>
                        )}
                        {error.details?.url && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">URL</p>
                            <p className="text-sm font-mono break-all">{error.details.url}</p>
                          </div>
                        )}
                        {error.details?.stack && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Stack Trace</p>
                            <pre className="text-xs font-mono bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto mt-1">
                              {error.details.stack}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
