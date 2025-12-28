"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"

export default function AssessmentsPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-6">My Assessments</h1>
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Coming soon: View and manage your saved assessments</p>
            <Badge variant="secondary" className="mt-4">
              Database integration in progress
            </Badge>
          </Card>
        </div>
      </div>
    </>
  )
}
