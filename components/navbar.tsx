"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { ShieldIcon } from "@/components/icons"

export function Navbar() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "Home" },
    { href: "/assessment/new", label: "New Assessment" },
    { href: "/assessments", label: "My Assessments" },
    { href: "/chat", label: "Chat Helper" },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xl shadow-md">
            A
          </div>
          <div>
            <div className="text-xl font-bold text-foreground">ARIA</div>
            <div className="text-[10px] leading-tight text-muted-foreground hidden sm:block">
              ABA Report & Intervention Assistant
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                pathname === link.href ? "text-blue-600" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className="hidden sm:flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <ShieldIcon className="h-3.5 w-3.5" />
            HIPAA Compliant
          </Badge>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold text-sm cursor-pointer hover:opacity-80 transition-opacity">
            U
          </div>
        </div>
      </div>
    </header>
  )
}
