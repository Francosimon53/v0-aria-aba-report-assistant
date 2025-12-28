"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { SparklesIcon } from "@/components/icons"

interface AIFieldHelperProps {
  fieldId: string
  onActivate: (fieldId: string) => void
  className?: string
}

export function AIFieldHelper({ fieldId, onActivate, className }: AIFieldHelperProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`h-7 w-7 p-0 ${className}`}
            onClick={() => onActivate(fieldId)}
          >
            <SparklesIcon className="w-4 h-4 text-purple-500" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Get AI suggestions</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
