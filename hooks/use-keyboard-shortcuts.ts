"use client"

import { useEffect } from "react"

interface ShortcutHandler {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  handler: () => void
}

export function useKeyboardShortcuts(shortcuts: ShortcutHandler[]) {
  useEffect(() => {
    if (!Array.isArray(shortcuts)) {
      console.warn("[v0] useKeyboardShortcuts: shortcuts is not an array", shortcuts)
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatches = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey
        const altMatches = shortcut.alt ? event.altKey : !event.altKey

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
          event.preventDefault()
          shortcut.handler()
        }
      })
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [shortcuts])
}
