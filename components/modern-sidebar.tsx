"use client"

import type React from "react"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  UserIcon,
  ClipboardListIcon,
  TargetIcon,
  FileTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  FileIcon,
  BarChart3Icon,
  SparklesIcon,
} from "@/components/icons"

type ActiveView =
  | "client"
  | "background"
  | "assessment"
  | "abc"
  | "risk"
  | "reassessment"
  | "progressdashboard"
  | "integration"
  | "goals"
  | "goalstracker"
  | "interventions"
  | "protocols"
  | "parenttraining"
  | "schedule"
  | "cptauth"
  | "consent"
  | "medicalnecessity"
  | "report"
  | "timesaved"
  | "support"

interface NavGroup {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  items: {
    id: ActiveView
    label: string
    description?: string
  }[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: "client-info",
    label: "Client Info",
    icon: UserIcon,
    items: [
      { id: "client", label: "Client Details", description: "Demographics & insurance" },
      { id: "background", label: "Background History", description: "Developmental history" },
    ],
  },
  {
    id: "assessment-group",
    label: "Assessment",
    icon: ClipboardListIcon,
    items: [
      { id: "assessment", label: "Assessment Form", description: "Enter assessment data" },
      { id: "abc", label: "ABC Observations", description: "Behavioral observations" },
      { id: "risk", label: "Risk Assessment", description: "Safety evaluation" },
    ],
  },
  {
    id: "goals-treatment",
    label: "Goals & Treatment",
    icon: TargetIcon,
    items: [
      { id: "goalstracker", label: "Goals Tracker", description: "Monitor progress" },
      { id: "goals", label: "Goal Bank", description: "Select treatment goals" },
      { id: "interventions", label: "Interventions Library", description: "Evidence-based strategies" },
    ],
  },
  {
    id: "protocols",
    label: "Protocols",
    icon: FileTextIcon,
    items: [
      { id: "protocols", label: "Teaching Protocols", description: "Step-by-step programs" },
      { id: "parenttraining", label: "Parent Training", description: "Track curriculum" },
    ],
  },
  {
    id: "authorization",
    label: "Authorization",
    icon: FileIcon,
    items: [
      { id: "cptauth", label: "CPT Codes", description: "Service requests" },
      { id: "medicalnecessity", label: "Medical Necessity", description: "AI-powered justification" },
      { id: "schedule", label: "Service Schedule", description: "Weekly planning" },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3Icon,
    items: [
      { id: "progressdashboard", label: "Progress Dashboard", description: "Visual outcomes" },
      { id: "report", label: "Generate Report", description: "Export final report" },
    ],
  },
]

interface ModernSidebarProps {
  activeView: ActiveView
  onViewChange: (view: ActiveView) => void
  collapsed: boolean
  onToggleCollapse: () => void
  completedSteps: ActiveView[]
}

export function ModernSidebar({
  activeView,
  onViewChange,
  collapsed,
  onToggleCollapse,
  completedSteps,
}: ModernSidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["client-info"])

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => (prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]))
  }

  // Auto-expand group containing active view
  const autoExpandGroup = (view: ActiveView) => {
    const group = NAV_GROUPS.find((g) => g.items.some((item) => item.id === view))
    if (group && !expandedGroups.includes(group.id)) {
      setExpandedGroups((prev) => [...prev, group.id])
    }
  }

  const handleViewChange = (view: ActiveView) => {
    autoExpandGroup(view)
    onViewChange(view)
  }

  const totalSteps = NAV_GROUPS.reduce((acc, group) => acc + group.items.length, 0)
  const completionPercentage = Math.round((completedSteps.length / totalSteps) * 100)

  return (
    <div
      className={cn(
        "flex flex-col h-screen border-r border-gray-200 bg-white transition-all duration-300",
        collapsed ? "w-16" : "w-[280px]",
      )}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-bold text-lg shadow-md">
              A
            </div>
            <div className="flex flex-col">
              <h1 className="font-bold text-gray-900 text-lg">ARIA</h1>
              <div className="flex items-center gap-1">
                <SparklesIcon className="h-3 w-3 text-teal-600" />
                <span className="text-xs font-medium text-teal-600">AI-Powered</span>
              </div>
            </div>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          {collapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
        </Button>
      </div>

      {!collapsed && (
        <div className="px-3 py-4 border-b border-gray-200">
          <Button className="w-full h-10 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-md gap-2">
            <PlusIcon className="h-4 w-4" />
            New Assessment
          </Button>
        </div>
      )}

      {!collapsed && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">Progress</span>
            <span className="text-xs font-bold text-teal-600">{completionPercentage}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-600 to-cyan-600 transition-all duration-500 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-2">
        {NAV_GROUPS.map((group) => {
          const GroupIcon = group.icon
          const isExpanded = expandedGroups.includes(group.id)
          const hasActiveItem = group.items.some((item) => item.id === activeView)
          const groupCompleted = group.items.every((item) => completedSteps.includes(item.id))

          return (
            <div key={group.id} className="mb-1">
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors",
                    hasActiveItem ? "bg-teal-50 text-teal-900" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex items-center justify-center h-5 w-5 rounded-md",
                        hasActiveItem ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-600",
                      )}
                    >
                      <GroupIcon className="h-3 w-3" />
                    </div>
                    <span>{group.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {groupCompleted && <CheckCircle2Icon className="h-4 w-4 text-teal-600" />}
                    {isExpanded ? (
                      <ChevronUpIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </button>
              )}

              {!collapsed && isExpanded && (
                <div className="py-1">
                  {group.items.map((item) => {
                    const isActive = activeView === item.id
                    const isCompleted = completedSteps.includes(item.id)

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleViewChange(item.id)}
                        className={cn(
                          "w-full flex items-center gap-3 pl-12 pr-4 py-2.5 text-sm transition-all",
                          isActive
                            ? "bg-gradient-to-r from-teal-50 to-transparent border-l-2 border-teal-600 text-teal-900 font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                        )}
                      >
                        <div
                          className={cn(
                            "flex items-center justify-center h-5 w-5 rounded-full transition-all",
                            isCompleted
                              ? "bg-teal-600 text-white"
                              : isActive
                                ? "bg-teal-100 ring-2 ring-teal-600 text-teal-600"
                                : "bg-gray-200 text-gray-400",
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle2Icon className="h-3 w-3" />
                          ) : (
                            <div className="h-1.5 w-1.5 rounded-full bg-current" />
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="leading-tight">{item.label}</div>
                          {item.description && <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {!collapsed && (
          <>
            <div className="h-px bg-gray-200 my-4" />

            <div className="px-4 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recent</h3>
              <div className="space-y-1">
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-sm font-medium text-gray-700">John Doe - Initial</div>
                  <div className="text-xs text-gray-500">2 hours ago</div>
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-sm font-medium text-gray-700">Jane Smith - 6mo</div>
                  <div className="text-xs text-gray-500">1 day ago</div>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {!collapsed && (
        <div className="border-t border-gray-200 p-4">
          <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-teal-600 to-cyan-600 flex items-center justify-center text-white font-semibold text-sm">
              JD
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-gray-900">Dr. John Doe</div>
              <div className="text-xs text-gray-500">BCBA-D</div>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
