"use client"

import { useEffect, useCallback } from "react"

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  action: () => void
}

interface ShortcutOptions {
  shortcuts?: KeyboardShortcut[]
  onSave?: () => void
  onNext?: () => void
  onPrevious?: () => void
  onShowShortcuts?: () => void
}

export function useKeyboardShortcuts(input?: KeyboardShortcut[] | ShortcutOptions | null) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!input) return

      let shortcuts: KeyboardShortcut[] = []

      if (Array.isArray(input)) {
        shortcuts = input
      } else if (typeof input === "object") {
        const options = input as ShortcutOptions

        if (Array.isArray(options.shortcuts)) {
          shortcuts = [...options.shortcuts]
        }

        if (typeof options.onSave === "function") {
          shortcuts.push({ key: "s", ctrlKey: true, action: options.onSave })
        }
        if (typeof options.onNext === "function") {
          shortcuts.push({ key: "ArrowRight", altKey: true, action: options.onNext })
        }
        if (typeof options.onPrevious === "function") {
          shortcuts.push({ key: "ArrowLeft", altKey: true, action: options.onPrevious })
        }
        if (typeof options.onShowShortcuts === "function") {
          shortcuts.push({ key: "?", shiftKey: true, action: options.onShowShortcuts })
        }
      }

      if (shortcuts.length === 0) return

      shortcuts.forEach(({ key, ctrlKey, altKey, shiftKey, metaKey, action }) => {
        const keyMatch = event.key.toLowerCase() === key.toLowerCase()
        const ctrlMatch = !!event.ctrlKey === !!ctrlKey
        const altMatch = !!event.altKey === !!altKey
        const shiftMatch = !!event.shiftKey === !!shiftKey
        const metaMatch = !!event.metaKey === !!metaKey

        if (keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch) {
          event.preventDefault()
          if (typeof action === "function") {
            action()
          }
        }
      })
    },
    [input],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])
}

export default useKeyboardShortcuts
