import type React from "react"
import { AutoSaveProvider } from "@/contexts/auto-save-context"
import { DemoModeBanner } from "@/components/demo-mode-banner"

export default function ReassessmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AutoSaveProvider>
      <DemoModeBanner />
      {children}
    </AutoSaveProvider>
  )
}
