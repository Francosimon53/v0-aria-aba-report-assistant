"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, X } from "lucide-react"
import { isDemoMode, exitDemoMode, getDemoClientName } from "@/lib/load-demo-data"
import { Button } from "@/components/ui/button"

export function DemoModeBanner() {
  const router = useRouter()
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    setIsDemo(isDemoMode())
  }, [])

  if (!isDemo) return null

  const handleExitDemo = () => {
    exitDemoMode()
    router.push("/")
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-100">
          <Sparkles className="h-4 w-4 text-amber-600" />
        </div>
        <div>
          <span className="text-amber-900 text-sm font-semibold">Demo Mode</span>
          <span className="text-amber-700 text-sm ml-2">Viewing sample data for {getDemoClientName()}</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleExitDemo}
        className="text-amber-700 hover:text-amber-900 hover:bg-amber-100 gap-1.5"
      >
        <X className="h-4 w-4" />
        Exit Demo
      </Button>
    </div>
  )
}
