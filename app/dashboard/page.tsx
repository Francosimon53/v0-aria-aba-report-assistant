"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface Assessment {
  id: string
  clientName: string
  type: "Initial" | "Reassessment"
  progress: number
  lastUpdated: string
  status: "in-progress" | "completed"
}

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/assessments")
  }, [router])

  return null
}
