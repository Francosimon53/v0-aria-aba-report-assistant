/**
 * Safe localStorage helpers to prevent crashes from corrupted data or JSON errors
 */

export function safeSetItem(key: string, data: any): boolean {
  try {
    // If data is a string, store it directly without JSON.stringify
    const valueToStore = typeof data === "string" ? data : JSON.stringify(data ?? {})
    localStorage.setItem(key, valueToStore)
    return true
  } catch (e) {
    console.error(`[v0] Failed to save to localStorage key "${key}":`, e)
    return false
  }
}

export function safeGetItem<T = any>(key: string, fallback: T = {} as T): T {
  try {
    const item = localStorage.getItem(key)
    if (!item) return fallback

    // Try to parse as JSON, if it fails return the string as-is
    try {
      return JSON.parse(item) as T
    } catch {
      // If JSON parse fails, return the raw string (for plain string values)
      return item as unknown as T
    }
  } catch (e) {
    console.error(`[v0] Failed to parse localStorage key "${key}":`, e)
    // Clean up corrupted data
    try {
      localStorage.removeItem(key)
    } catch (removeError) {
      console.error(`[v0] Failed to remove corrupted key "${key}":`, removeError)
    }
    return fallback
  }
}

export function safeGetString(key: string, fallback: string | null = null): string | null {
  try {
    const item = localStorage.getItem(key)
    if (!item) return fallback

    // Return the raw string value
    return item
  } catch (e) {
    console.error(`[v0] Failed to get localStorage key "${key}":`, e)
    return fallback
  }
}

export function safeSetString(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (e) {
    console.error(`[v0] Failed to set localStorage key "${key}":`, e)
    return false
  }
}

export function safeRemoveItem(key: string): boolean {
  try {
    localStorage.removeItem(key)
    return true
  } catch (e) {
    console.error(`[v0] Failed to remove localStorage key "${key}":`, e)
    return false
  }
}

export const safeGetJSON = safeGetItem
export const safeSetJSON = safeSetItem
