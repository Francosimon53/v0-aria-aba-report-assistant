"use client"

import { HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface FieldHelpProps {
  title: string
  description: string
  examples?: string[]
}

export function FieldHelp({ title, description, examples }: FieldHelpProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-teal-500 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600"
            aria-label={`Help: ${title}`}
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">{title}</p>
            <p className="text-sm">{description}</p>
            {examples && examples.length > 0 && (
              <div className="mt-2 space-y-1 border-t border-slate-500 pt-2">
                <p className="text-xs font-semibold">Examples:</p>
                <ul className="list-inside list-disc space-y-0.5 text-xs">
                  {examples.map((example, idx) => (
                    <li key={idx}>{example}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
