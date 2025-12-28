"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusIcon, TrashIcon, DownloadIcon, PrinterIcon } from "@/components/icons"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { premiumToast } from "@/components/ui/premium-toast"

type CPTCode = "97153" | "97155" | "97155HN" | "97156" | "97156HN"
type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"
type Location = "Home" | "Community" | "Telehealth"

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  location: Location
}

interface ServiceSchedule {
  [key: string]: {
    [key in CPTCode]?: TimeSlot[]
  }
}

interface ServiceScheduleProps {
  onSave?: () => void
}

const DAYS: DayOfWeek[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const CPT_CODES: { code: CPTCode; label: string; color: string; bgColor: string }[] = [
  { code: "97153", label: "97153 - RBT", color: "text-blue-700", bgColor: "bg-blue-50 hover:bg-blue-100" },
  {
    code: "97155",
    label: "97155 - BCBA/Lead",
    color: "text-purple-700",
    bgColor: "bg-purple-50 hover:bg-purple-100",
  },
  {
    code: "97155HN",
    label: "97155 HN - Assistant",
    color: "text-indigo-700",
    bgColor: "bg-indigo-50 hover:bg-indigo-100",
  },
  { code: "97156", label: "97156 - Family (BCBA)", color: "text-teal-700", bgColor: "bg-teal-50 hover:bg-teal-100" },
  {
    code: "97156HN",
    label: "97156 HN - Family (Asst)",
    color: "text-cyan-700",
    bgColor: "bg-cyan-50 hover:bg-cyan-100",
  },
]

export function ServiceSchedule({ onSave }: ServiceScheduleProps) {
  const [schedule, setSchedule] = useState<ServiceSchedule>({})
  const [comments, setComments] = useState("")
  const [selectedCell, setSelectedCell] = useState<{ day: DayOfWeek; code: CPTCode } | null>(null)
  const [newSlot, setNewSlot] = useState<{ startTime: string; endTime: string; location: Location }>({
    startTime: "",
    endTime: "",
    location: "Home",
  })

  const addTimeSlot = (day: DayOfWeek, code: CPTCode) => {
    if (!newSlot.startTime || !newSlot.endTime) return

    const slot: TimeSlot = {
      id: `${day}-${code}-${Date.now()}`,
      ...newSlot,
    }

    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [code]: [...(prev[day]?.[code] || []), slot],
      },
    }))

    setNewSlot({ startTime: "", endTime: "", location: "Home" })
    setSelectedCell(null)

    if (onSave) {
      premiumToast.success("Session added", "Schedule updated successfully")
      onSave()
    }
  }

  const removeTimeSlot = (day: DayOfWeek, code: CPTCode, slotId: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [code]: prev[day]?.[code]?.filter((slot) => slot.id !== slotId) || [],
      },
    }))
  }

  const calculateHours = (timeSlots: TimeSlot[]): number => {
    return timeSlots.reduce((total, slot) => {
      const start = new Date(`2024-01-01T${slot.startTime}`)
      const end = new Date(`2024-01-01T${slot.endTime}`)
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      return total + (hours > 0 ? hours : 0)
    }, 0)
  }

  const getTotalHoursByCode = (code: CPTCode): number => {
    return DAYS.reduce((total, day) => {
      const slots = schedule[day]?.[code] || []
      return total + calculateHours(slots)
    }, 0)
  }

  const getTotalWeeklyHours = (): number => {
    return CPT_CODES.reduce((total, { code }) => total + getTotalHoursByCode(code), 0)
  }

  const exportToPDF = () => {
    window.print()
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Weekly Service Schedule</h1>
          <p className="text-muted-foreground">Plan and track therapy sessions with CPT code tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToPDF}>
            <PrinterIcon className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={exportToPDF}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-[#0D9488]">{getTotalWeeklyHours().toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Total Hours/Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{getTotalHoursByCode("97153").toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">RBT Hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{getTotalHoursByCode("97155").toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">BCBA Hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-teal-600">{getTotalHoursByCode("97156").toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Family Training</p>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Table */}
      <Card>
        <CardHeader>
          <CardTitle>Service Schedule</CardTitle>
          <CardDescription>Click on a cell to add time slots for each service type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="p-3 text-left font-semibold bg-muted">Day</th>
                  {CPT_CODES.map(({ code, label, color }) => (
                    <th key={code} className={`p-3 text-left font-semibold bg-muted ${color}`}>
                      <div className="text-xs">{label}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day) => (
                  <tr key={day} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-medium text-sm">{day}</td>
                    {CPT_CODES.map(({ code, bgColor }) => {
                      const slots = schedule[day]?.[code] || []
                      const hours = calculateHours(slots)

                      return (
                        <td
                          key={code}
                          className={`p-2 align-top cursor-pointer transition-colors ${bgColor}`}
                          onClick={() => setSelectedCell({ day, code })}
                        >
                          <div className="space-y-1 min-h-[60px]">
                            {slots.map((slot) => (
                              <div
                                key={slot.id}
                                className="text-xs p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 shadow-sm group relative"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">
                                    {slot.startTime} - {slot.endTime}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      removeTimeSlot(day, code, slot.id)
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <TrashIcon className="h-3 w-3 text-red-500 hover:text-red-700" />
                                  </button>
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-1">
                                  <Badge variant="outline" className="text-[10px] h-4 px-1">
                                    {slot.location}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                            {hours > 0 && (
                              <div className="text-[10px] font-semibold text-muted-foreground pt-1">
                                Total: {hours.toFixed(1)}h
                              </div>
                            )}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Time Slot Modal/Card */}
      {selectedCell && (
        <Card className="border-[#0D9488] shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">
              Add Session - {selectedCell.day} ({CPT_CODES.find((c) => c.code === selectedCell.code)?.label})
            </CardTitle>
            <CardDescription>Enter session details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Select
                value={newSlot.location}
                onValueChange={(value) => setNewSlot({ ...newSlot, location: value as Location })}
              >
                <SelectTrigger id="location">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Home">Home</SelectItem>
                  <SelectItem value="Community">Community</SelectItem>
                  <SelectItem value="Telehealth">Telehealth</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => addTimeSlot(selectedCell.day, selectedCell.code)}
                className="flex-1 bg-[#0D9488] hover:bg-[#0F766E]"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Session
              </Button>
              <Button variant="outline" onClick={() => setSelectedCell(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Notes</CardTitle>
          <CardDescription>
            Add comments about the service schedule, special accommodations, or reminders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Enter any notes about the schedule, holidays, special circumstances, etc."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Weekly Summary by Code */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Summary by CPT Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {CPT_CODES.map(({ code, label, color }) => {
              const hours = getTotalHoursByCode(code)
              const units = (hours * 4).toFixed(0) // 15-minute units

              return (
                <div key={code} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`font-mono font-bold ${color}`}>{code}</div>
                    <div className="text-sm text-muted-foreground">{label}</div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-lg font-bold">{hours.toFixed(1)}h</div>
                      <div className="text-xs text-muted-foreground">{units} units</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
