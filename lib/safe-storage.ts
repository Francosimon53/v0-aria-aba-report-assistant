"use client"

/**
 * Safe storage utilities for client-side localStorage access
 * Handles SSR scenarios where localStorage is not available
 */

export function safeGetItem(key: string): string | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    return localStorage.getItem(key)
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error)
    return null
  }
}

export function safeSetItem(key: string, value: string): boolean {
  if (typeof window === "undefined") {
    return false
  }

  try {
    localStorage.setItem(key, value)
    return true
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error)
    return false
  }
}

export function safeRemoveItem(key: string): boolean {
  if (typeof window === "undefined") {
    return false
  }

  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error)
    return false
  }
}

export function safeClear(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  try {
    localStorage.clear()
    return true
  } catch (error) {
    console.error("Error clearing localStorage:", error)
    return false
  }
}
