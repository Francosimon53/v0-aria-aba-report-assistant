"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sparkles, Loader2, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react"
import { generateContent, type AIRequestOptions, type AIResult } from "@/lib/ai-utils"

interface AIGenerateButtonProps {
  type: string
  data: object
  onSuccess: (content: string) => void
  options?: AIRequestOptions
  buttonText?: string
  loadingText?: string
  className?: string
  variant?: "default" | "outline" | "ghost" | "gradient"
  size?: "sm" | "default" | "lg"
  disabled?: boolean
}

export function AIGenerateButton({
  type,
  data,
  onSuccess,
  options = {},
  buttonText = "AI Generate",
  loadingText = "Generating...",
  className = "",
  variant = "gradient",
  size = "default",
  disabled = false,
}: AIGenerateButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleGenerate = async () => {
    setIsLoading(true)
    setError(null)
    setShowSuccess(false)

    const result: AIResult = await generateContent(type, data, {
      maxRetries: 3,
      timeoutMs: 45000,
      fallbackResponse: "Unable to generate content at this time. Please try again or write manually.",
      ...options,
    })

    setIsLoading(false)

    if (result.success) {
      onSuccess(result.content)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } else {
      setError(result.error || "Generation failed")
      // If we have fallback content, still call onSuccess
      if (result.usedFallback && result.content) {
        onSuccess(result.content)
      }
    }
  }

  const buttonClasses =
    variant === "gradient"
      ? `bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all ${className}`
      : className

  const sizeClasses = {
    sm: "h-8 px-3 text-xs",
    default: "h-10 px-4",
    lg: "h-12 px-6 text-lg",
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleGenerate}
        disabled={isLoading || disabled}
        variant={variant === "gradient" ? "default" : variant}
        className={`${buttonClasses} ${sizeClasses[size]}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {loadingText}
          </>
        ) : showSuccess ? (
          <>
            <CheckCircle2 className="h-4 w-4 mr-2 text-green-300" />
            Generated!
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            {buttonText}
          </>
        )}
      </Button>

      {error && (
        <Alert variant="destructive" className="py-2 mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm flex-1">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGenerate}
              className="ml-2 h-7 text-destructive-foreground hover:bg-destructive/20"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
