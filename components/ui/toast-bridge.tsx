"use client"
import { useToastContextBridge } from "./premium-toast"

/**
 * Bridge component to connect premium toast context to the API
 * Must be rendered within ToastProvider
 */
export function ToastBridge() {
  useToastContextBridge()
  return null
}
