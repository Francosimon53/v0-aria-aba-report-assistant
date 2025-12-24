"use client"

import * as React from "react"
import { CheckCircle2Icon, XCircleIcon, AlertCircleIcon, Loader2Icon, XIcon } from "@/components/icons"
import { cn } from "@/lib/utils"

// Toast types and data structures
export type ToastType = "success" | "error" | "loading" | "info"

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastData {
  id: string
  type: ToastType
  message: string
  action?: ToastAction
  duration?: number
  promise?: boolean
}

// Toast context and state management
interface ToastContextType {
  toasts: ToastData[]
  addToast: (toast: Omit<ToastData, "id">) => string
  removeToast: (id: string) => void
  updateToast: (id: string, data: Partial<ToastData>) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function useToastSystem() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToastSystem must be used within ToastProvider")
  }
  return context
}

// Toast Provider Component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastData[]>([])

  const addToast = React.useCallback((toast: Omit<ToastData, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])

    // Auto-dismiss logic
    if (toast.type !== "loading" && toast.duration !== 0) {
      const duration = toast.duration || (toast.type === "error" ? 5000 : 3000)
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }

    return id
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const updateToast = React.useCallback((id: string, data: Partial<ToastData>) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, updateToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

// Individual Toast Component
function Toast({ toast, onRemove }: { toast: ToastData; onRemove: () => void }) {
  const [isHovered, setIsHovered] = React.useState(false)
  const [progress, setProgress] = React.useState(100)

  React.useEffect(() => {
    if (toast.type === "loading" || isHovered || toast.duration === 0) return

    const duration = toast.duration || (toast.type === "error" ? 5000 : 3000)
    const interval = 50
    const decrement = (interval / duration) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev - decrement
        if (next <= 0) {
          clearInterval(timer)
          return 0
        }
        return next
      })
    }, interval)

    return () => clearInterval(timer)
  }, [toast.type, toast.duration, isHovered])

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle2Icon className="h-5 w-5 text-green-600" />
      case "error":
        return <XCircleIcon className="h-5 w-5 text-red-600" />
      case "loading":
        return <Loader2Icon className="h-5 w-5 text-blue-600 animate-spin" />
      case "info":
        return <AlertCircleIcon className="h-5 w-5 text-blue-600" />
    }
  }

  const getAccentColor = () => {
    switch (toast.type) {
      case "success":
        return "border-green-600"
      case "error":
        return "border-red-600"
      case "loading":
      case "info":
        return "border-blue-600"
    }
  }

  const getProgressColor = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-600"
      case "error":
        return "bg-red-600"
      case "loading":
      case "info":
        return "bg-blue-600"
    }
  }

  return (
    <div
      className={cn(
        "toast-slide-in relative flex w-full max-w-[400px] items-start gap-3 rounded-lg border-l-4 bg-white p-4 shadow-lg transition-all duration-300 ease-out hover:shadow-xl",
        getAccentColor(),
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon */}
      <div className="flex-shrink-0 pt-0.5">{getIcon()}</div>

      {/* Content */}
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium text-gray-900">{toast.message}</p>
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="text-sm font-medium text-[#0D9488] transition-colors hover:text-[#0D9488]/80"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={onRemove}
        className="flex-shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
      >
        <XIcon className="h-4 w-4" />
      </button>

      {/* Progress bar */}
      {toast.type !== "loading" && toast.duration !== 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-lg bg-gray-200">
          <div
            className={cn("h-full transition-all duration-100 ease-linear", getProgressColor())}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

// Toast Container Component
function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: ToastData[]
  removeToast: (id: string) => void
}) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex max-h-screen flex-col gap-2">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className="pointer-events-auto"
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          <Toast toast={toast} onRemove={() => removeToast(toast.id)} />
        </div>
      ))}
    </div>
  )
}

// Toast API
export const premiumToast = {
  success: (message: string, options?: { duration?: number }) => {
    const context = getToastContext()
    return context.addToast({ type: "success", message, ...options })
  },

  error: (message: string, options?: { action?: ToastAction; duration?: number }) => {
    const context = getToastContext()
    return context.addToast({ type: "error", message, ...options })
  },

  loading: (message: string) => {
    const context = getToastContext()
    return context.addToast({ type: "loading", message, duration: 0 })
  },

  info: (message: string, options?: { duration?: number }) => {
    const context = getToastContext()
    return context.addToast({ type: "info", message, ...options })
  },

  promise: async <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    },
  ) => {
    const context = getToastContext()
    const loadingId = context.addToast({
      type: "loading",
      message: messages.loading,
      promise: true,
    })

    try {
      const data = await promise
      context.removeToast(loadingId)
      const successMessage = typeof messages.success === "function" ? messages.success(data) : messages.success
      context.addToast({ type: "success", message: successMessage })
      return data
    } catch (error) {
      context.removeToast(loadingId)
      const errorMessage = typeof messages.error === "function" ? messages.error(error) : messages.error
      context.addToast({ type: "error", message: errorMessage })
      throw error
    }
  },

  dismiss: (id: string) => {
    const context = getToastContext()
    context.removeToast(id)
  },
}

// Helper to get context outside of React components
let toastContextRef: ToastContextType | null = null

function getToastContext(): ToastContextType {
  if (!toastContextRef) {
    throw new Error("Toast system not initialized. Wrap your app with ToastProvider")
  }
  return toastContextRef
}

// Hook to expose context to the API
export function useToastContextBridge() {
  const context = useToastSystem()
  React.useEffect(() => {
    toastContextRef = context
    return () => {
      toastContextRef = null
    }
  }, [context])
}
