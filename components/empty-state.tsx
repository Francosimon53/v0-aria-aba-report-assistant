"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { FileTextIcon } from "@/components/icons"

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action, secondaryAction }: EmptyStateProps) {
  const DefaultIcon = FileTextIcon

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-6 rounded-full bg-muted p-6">
        {Icon ? (
          <Icon className="h-12 w-12 text-muted-foreground" />
        ) : (
          <DefaultIcon className="h-12 w-12 text-muted-foreground" />
        )}
      </div>
      <h3 className="mb-2 text-xl font-semibold text-foreground">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground leading-relaxed">{description}</p>
      <div className="flex gap-3">
        {action && (
          <Button onClick={action.onClick} className="gap-2">
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button onClick={secondaryAction.onClick} variant="outline" className="gap-2 bg-transparent">
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  )
}
