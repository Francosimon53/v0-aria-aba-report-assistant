"use client"
import { Button, type ButtonProps } from "@/components/ui/button"
import { CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ButtonStatesProps extends ButtonProps {
  isLoading?: boolean
  isSuccess?: boolean
  successMessage?: string
  loadingMessage?: string
}

export function ButtonStates({
  isLoading,
  isSuccess,
  successMessage = "Saved!",
  loadingMessage = "Saving...",
  children,
  disabled,
  className,
  ...props
}: ButtonStatesProps) {
  return (
    <Button
      disabled={disabled || isLoading || isSuccess}
      className={cn("transition-all duration-300", isSuccess && "bg-success hover:bg-success", className)}
      {...props}
    >
      {isLoading && (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {loadingMessage}
        </>
      )}
      {isSuccess && (
        <>
          <CheckCircle2 className="w-4 h-4 mr-2" />
          {successMessage}
        </>
      )}
      {!isLoading && !isSuccess && children}
    </Button>
  )
}
