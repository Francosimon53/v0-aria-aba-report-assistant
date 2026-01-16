"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  LayoutDashboard,
  Activity,
  Users,
  FileCheck,
  ClipboardList,
  FileText,
  DollarSign,
  AlertTriangle,
  Settings,
  ExternalLink,
  Menu,
  X,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/status", icon: Activity, label: "System Status" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/baa", icon: FileCheck, label: "BAA Requests" },
  { href: "/admin/assessments", icon: ClipboardList, label: "Assessments" },
  { href: "/admin/reports", icon: FileText, label: "Reports" },
  { href: "/admin/revenue", icon: DollarSign, label: "Revenue" },
  { href: "/admin/errors", icon: AlertTriangle, label: "Errors" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
]

// List of admin email addresses
const ADMIN_EMAILS = ["francosimon@hotmail.com", "simon@ariaba.app"]

function NavItem({
  href,
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
  href: string
  icon: React.ElementType
  label: string
  isActive: boolean
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
        isActive ? "bg-teal-500/20 text-teal-400" : "text-slate-400 hover:text-white hover:bg-slate-800",
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<{ email: string; full_name?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push("/login?redirect=/admin")
        return
      }

      // Check if user is an admin
      if (!ADMIN_EMAILS.includes(authUser.email || "")) {
        router.push("/dashboard")
        return
      }

      // Get profile
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", authUser.id).single()

      setUser({
        email: authUser.email || "",
        full_name: profile?.full_name,
      })
      setIsAuthorized(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Dark Sidebar */}
      <aside
        className={cn(
          "w-64 bg-slate-900 text-white fixed h-full z-40 transition-transform duration-300",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold">ARIA Admin</h1>
          <p className="text-slate-400 text-sm">Management Dashboard</p>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))}
              onClick={() => setSidebarOpen(false)}
            />
          ))}
        </nav>

        {/* External link to ARIA */}
        <div className="absolute bottom-32 left-0 right-0 px-4">
          <a
            href="https://ariaba.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Open ARIA App
          </a>
        </div>

        {/* Admin user */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-sm font-medium">
                {user?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{user?.full_name || "Admin"}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">{children}</main>
    </div>
  )
}
