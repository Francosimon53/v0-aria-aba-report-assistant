import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ToastProvider } from "@/components/ui/premium-toast"
import { ToastBridge } from "@/components/ui/toast-bridge"
import { AriaHelpChat } from "@/components/aria-help-chat"
import { AriaMCPProvider } from "@/lib/mcp/aria-mcp-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ARIA - ABA Report Assistant",
  description: "AI-powered assistant for creating comprehensive ABA assessment reports for BCBAs and behavior analysts",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ToastProvider>
          <ToastBridge />
          <AriaMCPProvider>
            {children}
          </AriaMCPProvider>
          <Toaster />
          <AriaHelpChat />
        </ToastProvider>
      </body>
    </html>
  )
}
