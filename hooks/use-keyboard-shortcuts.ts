"use client"

import { useEffect } from "react"

interface ShortcutHandler {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  handler: () => void
}

interface ShortcutsOptions {
  onSave?: () => void
  onNext?: () => void
  onPrevious?: () => void
  onShowShortcuts?: () => void
  shortcuts?: ShortcutHandler[]
}

export function useKeyboardShortcuts(input: ShortcutHandler[] | ShortcutsOptions) {
  useEffect(() => {
    let shortcuts: ShortcutHandler[] = []

    if (Array.isArray(input)) {
      shortcuts = input
    } else if (input && typeof input === "object") {
      // Build shortcuts from callback options
      const options = input as ShortcutsOptions

      if (options.shortcuts) {
        shortcuts = [...options.shortcuts]
      }

      if (options.onSave) {
        shortcuts.push({ key: "s", ctrl: true, handler: options.onSave })
      }
      if (options.onNext) {
        shortcuts.push({ key: "ArrowRight", alt: true, handler: options.onNext })
      }
      if (options.onPrevious) {
        shortcuts.push({ key: "ArrowLeft", alt: true, handler: options.onPrevious })
      }
      if (options.onShowShortcuts) {
        shortcuts.push({ key: "?", shift: true, handler: options.onShowShortcuts })
      }
    } else {
      console.warn("[v0] useKeyboardShortcuts: invalid input type", input)
      return
    }

    if (shortcuts.length === 0) {
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
  }, [input])
}
