"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusIcon, XIcon, SaveIcon } from "@/components/icons"
import { useToast } from "@/hooks/use-toast"

interface ScheduleRow {
  id: string
  activity: string
  startTime: string
  description: string
}

interface DailyScheduleTableProps {
  onSave?: (scheduleData: ScheduleRow[]) => void
}

const defaultRows: ScheduleRow[] = [
  { id: "1", activity: "Wake Up", startTime: "", description: "" },
  { id: "2", activity: "Activity (e.g., Going to School)", startTime: "", description: "" },
  { id: "3", activity: "Lunch", startTime: "", description: "" },
  { id: "4", activity: "Activity (e.g., Coming Home)", startTime: "", description: "" },
  { id: "5", activity: "Activity (Any Activity at Home)", startTime: "", description: "" },
  { id: "6", activity: "Dinner", startTime: "", description: "" },
  { id: "7", activity: "Activity (Any Activity at Home)", startTime: "", description: "" },
  { id: "8", activity: "Bed Time", startTime: "", description: "" },
]

export function DailyScheduleTable({ onSave }: DailyScheduleTableProps) {
  const { toast } = useToast()
  const [rows, setRows] = useState<ScheduleRow[]>(defaultRows)

  const handleInputChange = (id: string, field: keyof ScheduleRow, value: string) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
  }

  const addRow = () => {
    const newRow: ScheduleRow = {
      id: `row-${Date.now()}`,
      activity: "",
      startTime: "",
      description: "",
    }
    setRows((prev) => [...prev, newRow])
  }

  const removeRow = (id: string) => {
    if (rows.length <= 1) {
      toast({
        title: "Cannot Remove",
        description: "At least one row must remain in the schedule",
        variant: "destructive",
      })
      return
    }
    setRows((prev) => prev.filter((row) => row.id !== id))
  }

  const handleSave = () => {
    onSave?.(rows)
    toast({
      title: "Schedule Saved",
      description: "Daily schedule has been saved successfully",
    })
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0D9488] text-white">
              <th className="px-4 py-3 text-left text-sm font-semibold">Activity</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Approximate Start Time</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Description/Comments</th>
              <th className="px-4 py-3 text-center text-sm font-semibold w-20">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.id}
                className={`transition-colors duration-200 ease-out hover:bg-gray-100 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <td className="px-4 py-3 border-b border-gray-200">
                  <Input
                    value={row.activity}
                    onChange={(e) => handleInputChange(row.id, "activity", e.target.value)}
                    placeholder="Enter activity"
                    className="border-0 focus:ring-2 focus:ring-[#0D9488] bg-transparent"
                  />
                </td>
                <td className="px-4 py-3 border-b border-gray-200">
                  <Input
                    type="time"
                    value={row.startTime}
                    onChange={(e) => handleInputChange(row.id, "startTime", e.target.value)}
                    className="border-0 focus:ring-2 focus:ring-[#0D9488] bg-transparent"
                  />
                </td>
                <td className="px-4 py-3 border-b border-gray-200">
                  <Input
                    value={row.description}
                    onChange={(e) => handleInputChange(row.id, "description", e.target.value)}
                    placeholder="Enter description or comments"
                    className="border-0 focus:ring-2 focus:ring-[#0D9488] bg-transparent"
                  />
                </td>
                <td className="px-4 py-3 border-b border-gray-200 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRow(row.id)}
                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stack */}
      <div className="md:hidden space-y-4">
        {rows.map((row, index) => (
          <div
            key={row.id}
            className={`p-4 rounded-xl border border-gray-200 space-y-3 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Activity {index + 1}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeRow(row.id)}
                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Activity</label>
              <Input
                value={row.activity}
                onChange={(e) => handleInputChange(row.id, "activity", e.target.value)}
                placeholder="Enter activity"
                className="focus:ring-2 focus:ring-[#0D9488]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Approximate Start Time</label>
              <Input
                type="time"
                value={row.startTime}
                onChange={(e) => handleInputChange(row.id, "startTime", e.target.value)}
                className="focus:ring-2 focus:ring-[#0D9488]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Description/Comments</label>
              <Input
                value={row.description}
                onChange={(e) => handleInputChange(row.id, "description", e.target.value)}
                placeholder="Enter description"
                className="focus:ring-2 focus:ring-[#0D9488]"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={addRow} className="gap-2 bg-transparent">
          <PlusIcon className="h-4 w-4" />
          Add Row
        </Button>
        <Button onClick={handleSave} className="gap-2 bg-[#0D9488] hover:bg-[#0a6b62]">
          <SaveIcon className="h-4 w-4" />
          Save Schedule
        </Button>
      </div>
    </div>
  )
}
