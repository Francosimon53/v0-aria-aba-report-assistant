"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusIcon, DownloadIcon, PrinterIcon, AlertCircleIcon, CheckCircle2Icon, XIcon } from "@/components/icons"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

type CPTCode = "97153" | "97155" | "97155HN" | "97156" | "97156HN"
type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"
type Location = "Home" | "Community" | "Telehealth"

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
  location: Location
  hours: number
}

interface ServiceSchedule {
  [key: string]: {
    [key in CPTCode]?: TimeSlot[]
  }
}

interface LocationBreakdown {
  Home: number
  Community: number
  Telehealth: number
}

const DAYS: DayOfWeek[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const CPT_CODES: { code: CPTCode; label: string; fullLabel: string; color: string }[] = [
  { code: "97153", label: "RBT", fullLabel: "Behavior Technician", color: "bg-blue-500" },
  { code: "97155", label: "BCBA", fullLabel: "Lead Analyst", color: "bg-purple-500" },
  { code: "97155HN", label: "BCaBA", fullLabel: "Assistant Analyst", color: "bg-indigo-500" },
  { code: "97156", label: "BCBA - Family", fullLabel: "Family Training", color: "bg-[#0D9488]" },
  { code: "97156HN", label: "BCaBA - Family", fullLabel: "Family Training Assistant", color: "bg-cyan-500" },
]

export function CPTAuthorizationRequest() {
  const [schedule, setSchedule] = useState<ServiceSchedule>({})
  const [justification, setJustification] = useState("")
  const [selectedCell, setSelectedCell] = useState<{ day: DayOfWeek; code: CPTCode } | null>(null)
  const [showAddSlot, setShowAddSlot] = useState(false)
  const [newSlot, setNewSlot] = useState<{ startTime: string; endTime: string; location: Location }>({
    startTime: "",
    endTime: "",
    location: "Home",
  })

  const parseTime = (timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(":").map(Number)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    return date
  }

  const calculateSlotHours = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0
    const start = parseTime(startTime)
    const end = parseTime(endTime)
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    return hours > 0 ? hours : 0
  }

  const checkTimeOverlap = (day: DayOfWeek, code: CPTCode, newStart: string, newEnd: string): boolean => {
    const slots = schedule[day]?.[code] || []
    const newStartTime = parseTime(newStart).getTime()
    const newEndTime = parseTime(newEnd).getTime()

    return slots.some((slot) => {
      const slotStart = parseTime(slot.startTime).getTime()
      const slotEnd = parseTime(slot.endTime).getTime()
      return newStartTime < slotEnd && newEndTime > slotStart
    })
  }

  const addTimeSlot = () => {
    if (!selectedCell || !newSlot.startTime || !newSlot.endTime) return

    const { day, code } = selectedCell

    // Check for overlapping times
    if (checkTimeOverlap(day, code, newSlot.startTime, newSlot.endTime)) {
      alert("Time slot overlaps with existing session!")
      return
    }

    const hours = calculateSlotHours(newSlot.startTime, newSlot.endTime)
    if (hours <= 0) {
      alert("End time must be after start time!")
      return
    }

    const slot: TimeSlot = {
      id: `${day}-${code}-${Date.now()}`,
      ...newSlot,
      hours,
    }

    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [code]: [...(prev[day]?.[code] || []), slot],
      },
    }))

    setNewSlot({ startTime: "", endTime: "", location: "Home" })
    setShowAddSlot(false)
    setSelectedCell(null)
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

  const getTotalHoursByCode = (code: CPTCode): number => {
    return DAYS.reduce((total, day) => {
      const slots = schedule[day]?.[code] || []
      return total + slots.reduce((sum, slot) => sum + slot.hours, 0)
    }, 0)
  }

  const getLocationBreakdownByCode = (code: CPTCode): LocationBreakdown => {
    const breakdown: LocationBreakdown = { Home: 0, Community: 0, Telehealth: 0 }
    DAYS.forEach((day) => {
      const slots = schedule[day]?.[code] || []
      slots.forEach((slot) => {
        breakdown[slot.location] += slot.hours
      })
    })
    return breakdown
  }

  const getTotalWeeklyHours = (): number => {
    return CPT_CODES.reduce((total, { code }) => total + getTotalHoursByCode(code), 0)
  }

  const getDailyTotal = (day: DayOfWeek): number => {
    return CPT_CODES.reduce((total, { code }) => {
      const slots = schedule[day]?.[code] || []
      return total + slots.reduce((sum, slot) => sum + slot.hours, 0)
    }, 0)
  }

  // Validation checks
  const totalWeeklyHours = getTotalWeeklyHours()
  const rbtHours = getTotalHoursByCode("97153")
  const bcbaHours = getTotalHoursByCode("97155") + getTotalHoursByCode("97155HN")
  const familyTrainingHours = getTotalHoursByCode("97156") + getTotalHoursByCode("97156HN")
  const supervisionRatio = rbtHours > 0 ? (bcbaHours / rbtHours) * 100 : 0

  const warnings = []
  if (totalWeeklyHours > 40) {
    warnings.push({ type: "error", message: "Total weekly hours exceed 40 (insurance red flag)" })
  }
  if (familyTrainingHours === 0 && rbtHours > 0) {
    warnings.push({ type: "warning", message: "No parent training hours - CPT 97156 typically required" })
  }
  if (supervisionRatio < 5 && rbtHours > 0) {
    warnings.push({
      type: "warning",
      message: "BCBA supervision ratio below 5% minimum (currently " + supervisionRatio.toFixed(1) + "%)",
    })
  }
  if (warnings.length === 0) {
    warnings.push({ type: "success", message: "Service mix looks appropriate" })
  }

  const exportToPDF = () => {
    window.print()
  }

  const copyAsTable = () => {
    let table = "Day\t97153\t97155\t97155HN\t97156\t97156HN\n"
    DAYS.forEach((day) => {
      table += day
      CPT_CODES.forEach(({ code }) => {
        const slots = schedule[day]?.[code] || []
        const summary = slots.map((s) => `${s.startTime}-${s.endTime} (${s.hours}h ${s.location})`).join("; ")
        table += `\t${summary}`
      })
      table += "\n"
    })
    navigator.clipboard.writeText(table)
    alert("Schedule copied to clipboard!")
  }

  const wordCount = justification.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">CPT Code Authorization Request</h1>
          <p className="text-muted-foreground">Plan weekly service schedule and generate authorization justification</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={copyAsTable}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            Copy Table
          </Button>
          <Button variant="outline" onClick={exportToPDF}>
            <PrinterIcon className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Validation Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((warning, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 p-4 rounded-lg border animate-in fade-in-0 slide-in-from-left-2 ${
                warning.type === "error"
                  ? "bg-red-50 border-red-200 text-red-800"
                  : warning.type === "warning"
                    ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                    : "bg-green-50 border-green-200 text-green-800"
              }`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {warning.type === "error" ? (
                <AlertCircleIcon className="h-5 w-5 flex-shrink-0" />
              ) : warning.type === "warning" ? (
                <AlertCircleIcon className="h-5 w-5 flex-shrink-0" />
              ) : (
                <CheckCircle2Icon className="h-5 w-5 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{warning.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Weekly Schedule Table */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50">
          <CardTitle>Weekly Service Schedule</CardTitle>
          <CardDescription>Click "+" on any cell to add time slots. Color-coded by location.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border bg-muted">
                  <th className="p-3 text-left font-semibold min-w-[100px]">Day</th>
                  {CPT_CODES.map(({ code, label, fullLabel }) => (
                    <th key={code} className="p-3 text-left font-semibold min-w-[140px]">
                      <div className="text-xs font-mono mb-1">{code}</div>
                      <div className="text-[10px] text-muted-foreground font-normal">{fullLabel}</div>
                    </th>
                  ))}
                  <th className="p-3 text-right font-semibold min-w-[80px]">Daily Total</th>
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day, dayIdx) => (
                  <tr
                    key={day}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                    style={{
                      animation: `fadeIn 300ms ease-out ${dayIdx * 50}ms backwards`,
                    }}
                  >
                    <td className="p-3 font-medium text-sm bg-muted/30">{day}</td>
                    {CPT_CODES.map(({ code }) => {
                      const slots = schedule[day]?.[code] || []

                      return (
                        <td key={code} className="p-2 align-top">
                          <div className="space-y-2 min-h-[80px]">
                            {slots.map((slot) => (
                              <div
                                key={slot.id}
                                className={`text-xs p-2 rounded-md border-2 shadow-sm group relative transition-all duration-200 hover:shadow-md ${
                                  slot.location === "Home"
                                    ? "bg-blue-50 border-blue-200 text-blue-900"
                                    : slot.location === "Community"
                                      ? "bg-green-50 border-green-200 text-green-900"
                                      : "bg-purple-50 border-purple-200 text-purple-900"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-1">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold truncate">
                                      {slot.startTime} - {slot.endTime}
                                    </div>
                                    <div className="text-[10px] opacity-75">({slot.hours.toFixed(1)} hrs)</div>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      removeTimeSlot(day, code, slot.id)
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                                  >
                                    <XIcon className="h-3 w-3 text-red-500" />
                                  </button>
                                </div>
                                <Badge variant="outline" className="mt-1 text-[9px] h-4 px-1">
                                  {slot.location === "Home" ? "🏠" : slot.location === "Community" ? "🌳" : "💻"}{" "}
                                  {slot.location}
                                </Badge>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedCell({ day, code })
                                setShowAddSlot(true)
                              }}
                              className="w-full h-8 text-xs border-dashed hover:bg-[#0D9488]/10 hover:border-[#0D9488] transition-all duration-300"
                            >
                              <PlusIcon className="h-3 w-3 mr-1" />
                              Add Slot
                            </Button>
                          </div>
                        </td>
                      )
                    })}
                    <td className="p-3 text-right font-bold text-[#0D9488] bg-muted/30">
                      {getDailyTotal(day).toFixed(1)}h
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Time Slot Modal */}
      {showAddSlot && selectedCell && (
        <Card className="border-[#0D9488] border-2 shadow-xl animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
          <CardHeader className="bg-[#0D9488]/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Add Session - {selectedCell.day}</CardTitle>
                <CardDescription className="mt-1">
                  {CPT_CODES.find((c) => c.code === selectedCell.code)?.code} -{" "}
                  {CPT_CODES.find((c) => c.code === selectedCell.code)?.fullLabel}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowAddSlot(false)
                  setSelectedCell(null)
                }}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime" className="text-sm font-semibold">
                  Start Time *
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="endTime" className="text-sm font-semibold">
                  End Time *
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            {newSlot.startTime && newSlot.endTime && (
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                Session Duration:{" "}
                <span className="font-bold text-[#0D9488]">
                  {calculateSlotHours(newSlot.startTime, newSlot.endTime).toFixed(1)} hours
                </span>
              </div>
            )}
            <div>
              <Label htmlFor="location" className="text-sm font-semibold">
                Location *
              </Label>
              <Select
                value={newSlot.location}
                onValueChange={(value) => setNewSlot({ ...newSlot, location: value as Location })}
              >
                <SelectTrigger id="location" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Home">🏠 Home</SelectItem>
                  <SelectItem value="Community">🌳 Community</SelectItem>
                  <SelectItem value="Telehealth">💻 Telehealth</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={addTimeSlot}
                className="flex-1 bg-[#0D9488] hover:bg-[#0F766E] transition-all duration-300"
                disabled={!newSlot.startTime || !newSlot.endTime}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Session
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddSlot(false)
                  setSelectedCell(null)
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {CPT_CODES.map(({ code, label, fullLabel, color }, idx) => {
          const hours = getTotalHoursByCode(code)
          const units = Math.round(hours * 4) // 15-minute units
          const periodUnits = Math.round(units * 26) // 6-month period (26 weeks)
          const locationBreakdown = getLocationBreakdownByCode(code)

          return (
            <Card
              key={code}
              className="overflow-hidden hover:shadow-lg transition-shadow duration-300 animate-in fade-in-0 slide-in-from-bottom-2"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className={`h-2 ${color}`} />
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono">{code}</CardTitle>
                <CardDescription className="text-xs">{fullLabel}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-3xl font-bold text-[#0D9488]">{hours.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">Total Hours/Week</div>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Units/Week:</span>
                    <span className="font-semibold">{units} (×15min)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Units/Period (6mo):</span>
                    <span className="font-semibold">{periodUnits.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average/Week:</span>
                    <span className="font-semibold">{hours.toFixed(1)}h</span>
                  </div>
                </div>
                <div className="border-t pt-3 space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground mb-2">Location Breakdown:</div>
                  {locationBreakdown.Home > 0 && (
                    <div className="flex justify-between text-xs">
                      <span>🏠 Home:</span>
                      <span className="font-semibold text-blue-600">{locationBreakdown.Home.toFixed(1)}h</span>
                    </div>
                  )}
                  {locationBreakdown.Community > 0 && (
                    <div className="flex justify-between text-xs">
                      <span>🌳 Community:</span>
                      <span className="font-semibold text-green-600">{locationBreakdown.Community.toFixed(1)}h</span>
                    </div>
                  )}
                  {locationBreakdown.Telehealth > 0 && (
                    <div className="flex justify-between text-xs">
                      <span>💻 Telehealth:</span>
                      <span className="font-semibold text-purple-600">{locationBreakdown.Telehealth.toFixed(1)}h</span>
                    </div>
                  )}
                  {hours === 0 && <div className="text-xs text-muted-foreground italic">No sessions scheduled</div>}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Justification for Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Justification for Hours</CardTitle>
          <CardDescription>
            Provide detailed rationale for the requested service hours. Aim for 150-300 words.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Based on the severity of [specific behaviors], occurring at a frequency of [X times per day/week], the client requires intensive intervention across multiple settings. The proposed service hours are medically necessary to address [target behaviors/deficits] and achieve the following treatment goals: [list goals]. Research supports intensive intervention for [diagnosis/presentation] with outcomes showing [evidence]. The client's current level of functioning, including [specific deficits], necessitates this service intensity to prevent [risks] and promote [desired outcomes]..."
            rows={10}
            className="text-sm leading-relaxed"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span
                className={
                  wordCount < 150
                    ? "text-yellow-600 font-medium"
                    : wordCount > 300
                      ? "text-red-600 font-medium"
                      : "text-green-600 font-medium"
                }
              >
                {wordCount} words
              </span>
              <span>{justification.length} characters</span>
            </div>
            <div>
              {wordCount < 150 ? (
                <span className="text-yellow-600">⚠ Add more detail</span>
              ) : wordCount > 300 ? (
                <span className="text-red-600">⚠ Too lengthy</span>
              ) : (
                <span className="text-green-600">✓ Good length</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
