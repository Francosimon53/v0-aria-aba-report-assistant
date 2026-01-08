"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Pencil, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface EditableAIFieldProps {
  value: string
  onChange: (value: string) => void
  onGenerate?: () => Promise<void> | void
  isGenerating?: boolean
  label: string
  placeholder?: string
  minHeight?: string
  className?: string
  showWordCount?: boolean
  wordCountTarget?: string
  disabled?: boolean
}

export function EditableAIField({
  value,
  onChange,
  onGenerate,
  isGenerating = false,
  label,
  placeholder = "No content yet. Click 'Generate with AI' to create content.",
  minHeight = "150px",
  className,
  showWordCount = false,
  wordCountTarget,
  disabled = false,
}: EditableAIFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedValue, setEditedValue] = useState(value)

  const handleSave = () => {
    onChange(editedValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedValue(value)
    setIsEditing(false)
  }

  const handleEdit = () => {
    setEditedValue(value)
    setIsEditing(true)
  }

  // Update editedValue when value prop changes (e.g., from AI generation)
  if (!isEditing && editedValue !== value) {
    setEditedValue(value)
  }

  const wordCount = value ? value.split(/\s+/).filter(Boolean).length : 0

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <div className="flex gap-2">
          {onGenerate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onGenerate}
              disabled={isGenerating || disabled}
              className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 hover:from-violet-600 hover:to-purple-700"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              {isGenerating ? "Generating..." : "AI Generate"}
            </Button>
          )}
          {value && !isEditing && !disabled && (
            <Button variant="ghost" size="sm" onClick={handleEdit} className="text-gray-600 hover:text-gray-900">
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editedValue}
            onChange={(e) => setEditedValue(e.target.value)}
            style={{ minHeight }}
            className="w-full resize-none"
            placeholder={placeholder}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} className="bg-teal-600 hover:bg-teal-700 text-white">
              <Check className="h-4 w-4 mr-1" />
              Save Changes
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div
            className={cn(
              "p-3 bg-gray-50 rounded-md whitespace-pre-wrap border border-gray-200",
              !value && "text-gray-400",
            )}
            style={{ minHeight }}
          >
            {value || placeholder}
          </div>
          {showWordCount && (
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{wordCount} words</span>
              {wordCountTarget && <span>{wordCountTarget}</span>}
            </div>
          )}
        </>
      )}
    </div>
  )
}
