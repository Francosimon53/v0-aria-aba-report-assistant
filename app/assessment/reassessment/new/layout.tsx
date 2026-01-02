import type React from "react"
import { AutoSaveProvider } from "@/contexts/auto-save-context"

export default function ReassessmentLayout({ children }: { children: React.ReactNode }) {
  return <AutoSaveProvider>{children}</AutoSaveProvider>
}
