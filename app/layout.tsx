import "./globals.css"
import type { ReactNode } from "react"
import { ToastProvider } from "@/components/ui/premium-toast"
import { ToastBridge } from "@/components/ui/toast-bridge"
import { AIAssistant } from "@/components/ai-assistant"
import { Providers } from "./providers"
import { AssessmentSessionProvider } from "@/components/assessment/AssessmentSessionProvider"
import { StorageMigrationProvider } from "@/components/storage-migration-provider"

export const metadata = {
  title: "ARIA ABA Report Assistant - v5.0",
  description: "Professional ABA assessment report generation - Complete 18-step wizard with AI-powered compliance",
    generator: 'v0.app'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <StorageMigrationProvider>
            <AssessmentSessionProvider>
              <ToastProvider>
                <ToastBridge />
                {children}
                <AIAssistant />
              </ToastProvider>
            </AssessmentSessionProvider>
          </StorageMigrationProvider>
        </Providers>
      </body>
    </html>
  )
}
