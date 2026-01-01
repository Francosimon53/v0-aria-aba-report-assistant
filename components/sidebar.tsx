"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  UserIcon,
  ClipboardListIcon,
  TargetIcon,
  FileTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircle2Icon,
  RepeatIcon,
  DatabaseIcon,
  HelpCircleIcon,
  HomeIcon,
  ClockIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  UsersIcon,
  CalendarIcon,
  EditIcon,
  FileIcon,
} from "@/components/icons"
import type { ClientData, AssessmentData } from "@/lib/types"

type ActiveView =
  | "chat"
  | "client"
  | "assessment"
  | "reassessment"
  | "goals"
  | "report"
  | "integration"
  | "support"
  | "timesaved"
  | "abc" // Added ABC observation view type
  | "interventions" // Added interventions view type
  | "protocols" // Added protocols view type
  | "risk" // Added risk view type
  | "goalstracker" // Added goalstracker view type
  | "parenttraining" // Added parent training view type
  | "schedule" // Added schedule view type
  | "consent" // Added consent view type
  | "background" // Added background view type
  | "medicalnecessity" // Added medical necessity view type
  | "cptauth" // Added cptauth view type
  | "dashboard" // Added dashboard view type

interface SidebarProps {
  activeView: ActiveView
  onViewChange: (view: ActiveView) => void
  collapsed: boolean
  onToggleCollapse: () => void
  clientData: ClientData | null
  assessmentData: AssessmentData | null
  selectedGoalsCount: number
}

export function Sidebar({
  activeView,
  onViewChange,
  collapsed,
  onToggleCollapse,
  clientData,
  assessmentData,
  selectedGoalsCount,
}: SidebarProps) {
  const navItems = [
    {
      id: "dashboard" as const,
      label: "Dashboard",
      icon: HomeIcon,
      description: "Overview & quick actions",
      completed: false,
    },
    {
      id: "client" as const,
      label: "Client Info",
      icon: UserIcon,
      description: "Demographics & insurance",
      completed: !!clientData,
    },
    {
      id: "background" as const,
      label: "Background & History",
      icon: FileIcon,
      description: "Developmental & clinical history",
    },
    {
      id: "assessment" as const,
      label: "Assessment",
      icon: ClipboardListIcon,
      description: "Enter assessment data",
      completed: !!assessmentData,
    },
    {
      id: "reassessment" as const,
      label: "Reassessment",
      icon: RepeatIcon,
      description: "Track progress & update",
      completed: false,
    },
    {
      id: "abc" as const,
      label: "ABC Observation",
      icon: ClipboardListIcon,
      description: "Record behavioral observations",
    },
    {
      id: "risk" as const,
      label: "Risk Assessment",
      icon: AlertTriangleIcon,
      description: "Safety evaluation & crisis plan",
    },
    {
      id: "interventions" as const,
      label: "Interventions",
      icon: TargetIcon,
      description: "Evidence-based strategies",
    },
    {
      id: "protocols" as const,
      label: "Teaching Protocols",
      icon: FileTextIcon,
      description: "Build step-by-step programs",
    },
    {
      id: "integration" as const,
      label: "Data Integration",
      icon: DatabaseIcon,
      description: "Import & visualize data",
    },
    {
      id: "goals" as const,
      label: "Goal Bank",
      icon: TargetIcon,
      description: "Select treatment goals",
      badge: selectedGoalsCount > 0 ? selectedGoalsCount : undefined,
    },
    {
      id: "goalstracker" as const,
      label: "Goals Tracker",
      icon: TrendingUpIcon,
      description: "Monitor progress & outcomes",
    },
    {
      id: "parenttraining" as const,
      label: "Parent Training",
      icon: UsersIcon,
      description: "Track curriculum & fidelity",
    },
    {
      id: "schedule" as const,
      label: "Service Schedule",
      icon: CalendarIcon,
      description: "Weekly CPT code planning",
    },
    {
      id: "cptauth" as const,
      label: "CPT Auth Request",
      icon: FileTextIcon,
      description: "Service request & justification",
    },
    {
      id: "consent" as const,
      label: "Consent Forms",
      icon: EditIcon,
      description: "Digital signatures & legal docs",
    },
    {
      id: "timesaved" as const,
      label: "Time Saved",
      icon: ClockIcon,
      description: "Track your productivity",
    },
    {
      id: "support" as const,
      label: "Compliance & Support",
      icon: HelpCircleIcon,
      description: "HIPAA, regulations & FAQs",
    },
    {
      id: "medicalnecessity" as const,
      label: "Medical Necessity",
      icon: FileTextIcon,
      description: "AI-powered justification writer",
    },
    {
      id: "report" as const,
      label: "Generate Report",
      icon: FileTextIcon,
      description: "Generate & export",
    },
  ]

  return (
    <div
      className={cn(
        "flex flex-col h-screen border-r border-border bg-card transition-all duration-300 overflow-hidden",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              A
            </div>
            <div>
              <h1 className="font-semibold text-foreground">ARIA</h1>
              <p className="text-xs text-muted-foreground">ABA Assistant</p>
            </div>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="h-8 w-8">
          {collapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id
            const isCompleted = item.completed

            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn("w-full justify-start gap-3 h-auto py-3", collapsed && "justify-center px-2")}
                onClick={() => {
                  if (item.id === "dashboard") {
                    window.location.href = "/dashboard"
                  } else {
                    onViewChange(item.id)
                  }
                }}
              >
                <div className="relative">
                  <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                  {isCompleted && <CheckCircle2Icon className="absolute -top-1 -right-1 h-3 w-3 text-green-500" />}
                </div>
                {!collapsed && (
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn("text-sm font-medium", isActive ? "text-foreground" : "text-muted-foreground")}
                      >
                        {item.label}
                      </span>
                      {item.badge && (
                        <Badge variant="secondary" className="h-5 min-w-[20px] px-1.5 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </div>
                )}
              </Button>
            )
          })}
        </nav>
      </div>

      {!collapsed && (
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2">Report Progress</div>
          <div className="flex gap-1">
            {navItems.slice(1).map((item) => (
              <div
                key={item.id}
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  item.completed || (item.id === "goals" && selectedGoalsCount > 0) ? "bg-primary" : "bg-muted",
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
