import { DEMO_CLIENT_DATA } from "./sample-demo-data"

/**
 * Load sample demo data into localStorage for demonstration purposes
 */
export function loadDemoData(): boolean {
  try {
    // Clear any existing ARIA data first (except user preferences)
    const keysToPreserve = ["aria-user-preferences", "aria-theme"]

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("aria-") && !keysToPreserve.includes(key)) {
        localStorage.removeItem(key)
      }
    })

    // Load all demo data into localStorage
    Object.entries(DEMO_CLIENT_DATA).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value))
    })

    // Set demo mode flag
    localStorage.setItem("aria-demo-mode", "true")

    return true
  } catch (error) {
    console.error("[v0] Error loading demo data:", error)
    return false
  }
}

/**
 * Check if the app is currently in demo mode
 */
export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("aria-demo-mode") === "true"
}

/**
 * Exit demo mode and clear all demo data
 */
export function exitDemoMode(): void {
  try {
    // Clear all ARIA data
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("aria-")) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.error("[v0] Error exiting demo mode:", error)
  }
}

/**
 * Get the demo client name for display
 */
export function getDemoClientName(): string {
  return "Marcus Johnson"
}
