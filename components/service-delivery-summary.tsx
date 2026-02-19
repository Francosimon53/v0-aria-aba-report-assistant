"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BarChartIcon, SaveIcon } from "@/components/icons"

interface ServiceDeliverySummaryProps {
  onSave?: () => void
}

export function ServiceDeliverySummary({ onSave }: ServiceDeliverySummaryProps) {
  const [data, setData] = useState({
    authPeriodStart: "",
    authPeriodEnd: "",
    hoursAuthorized: 0,
    hoursDelivered: 0,
    sessionsScheduled: 0,
    sessionsAttended: 0,
    cancellationsByFamily: 0,
    cancellationsByProvider: 0,
    notes: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("aria-reassessment-service-delivery")
      if (saved) {
        setData(JSON.parse(saved))
      }
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem("aria-reassessment-service-delivery", JSON.stringify(data))
    onSave?.()
  }

  const deliveryRate = data.hoursAuthorized > 0 ? Math.round((data.hoursDelivered / data.hoursAuthorized) * 100) : 0

  const attendanceRate =
    data.sessionsScheduled > 0 ? Math.round((data.sessionsAttended / data.sessionsScheduled) * 100) : 0

  return (
    <div className="space-y-6">
      <Card className="border-orange-200">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-500 flex items-center justify-center">
              <BarChartIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-orange-800">Service Delivery Summary</CardTitle>
              <CardDescription>Review hours authorized vs delivered during the previous period</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Authorization Period */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Authorization Period Start</Label>
              <Input
                type="date"
                value={data.authPeriodStart}
                onChange={(e) => setData({ ...data, authPeriodStart: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Authorization Period End</Label>
              <Input
                type="date"
                value={data.authPeriodEnd}
                onChange={(e) => setData({ ...data, authPeriodEnd: e.target.value })}
              />
            </div>
          </div>

          {/* Hours */}
          <div className="p-4 bg-orange-50 rounded-lg space-y-4">
            <h3 className="font-semibold text-orange-800">Service Hours</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hours Authorized</Label>
                <Input
                  type="number"
                  value={data.hoursAuthorized}
                  onChange={(e) => setData({ ...data, hoursAuthorized: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Hours Delivered</Label>
                <Input
                  type="number"
                  value={data.hoursDelivered}
                  onChange={(e) => setData({ ...data, hoursDelivered: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Delivery Rate</span>
                <span
                  className={`font-bold ${deliveryRate >= 80 ? "text-green-600" : deliveryRate >= 60 ? "text-orange-600" : "text-red-600"}`}
                >
                  {deliveryRate}%
                </span>
              </div>
              <Progress value={deliveryRate} className="h-3" />
            </div>
          </div>

          {/* Sessions */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <h3 className="font-semibold text-gray-800">Session Attendance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sessions Scheduled</Label>
                <Input
                  type="number"
                  value={data.sessionsScheduled}
                  onChange={(e) => setData({ ...data, sessionsScheduled: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Sessions Attended</Label>
                <Input
                  type="number"
                  value={data.sessionsAttended}
                  onChange={(e) => setData({ ...data, sessionsAttended: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cancellations by Family</Label>
                <Input
                  type="number"
                  value={data.cancellationsByFamily}
                  onChange={(e) => setData({ ...data, cancellationsByFamily: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Cancellations by Provider</Label>
                <Input
                  type="number"
                  value={data.cancellationsByProvider}
                  onChange={(e) => setData({ ...data, cancellationsByProvider: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Attendance Rate</span>
                <span
                  className={`font-bold ${attendanceRate >= 80 ? "text-green-600" : attendanceRate >= 60 ? "text-orange-600" : "text-red-600"}`}
                >
                  {attendanceRate}%
                </span>
              </div>
              <Progress value={attendanceRate} className="h-3" />
            </div>
          </div>

          <Button onClick={handleSave} className="w-full bg-orange-500 hover:bg-orange-600">
            <SaveIcon className="h-4 w-4 mr-2" />
            Save & Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
