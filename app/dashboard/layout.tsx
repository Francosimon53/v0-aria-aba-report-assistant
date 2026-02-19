import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppNav } from "@/components/app-nav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single()

  const navUser = {
    email: user.email || "",
    fullName: profile?.full_name || undefined,
    avatarUrl: profile?.avatar_url || undefined,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav user={navUser} />
      <div className="pt-16">{children}</div>
    </div>
  )
}
