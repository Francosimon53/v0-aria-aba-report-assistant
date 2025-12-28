"use client"

import { useEffect } from "react"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Upload, X, ImageIcon, ClipboardPaste, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface LogoUploaderProps {
  value: string
  onChange: (base64: string) => void
  maxSizeKB?: number
}

export function LogoUploader({ value, onChange, maxSizeKB = 500 }: LogoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const processFile = useCallback(
    (file: File) => {
      setError(null)

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file (PNG, JPG, GIF, SVG)")
        return
      }

      // Validate file size
      const fileSizeKB = file.size / 1024
      if (fileSizeKB > maxSizeKB) {
        setError(`Image must be smaller than ${maxSizeKB}KB. Current size: ${Math.round(fileSizeKB)}KB`)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        onChange(base64)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 2000)
      }
      reader.onerror = () => {
        setError("Failed to read file. Please try again.")
      }
      reader.readAsDataURL(file)
    },
    [onChange, maxSizeKB],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = e.dataTransfer.files
      if (files && files.length > 0) {
        processFile(files[0])
      }
    },
    [processFile],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        processFile(files[0])
      }
    },
    [processFile],
  )

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile()
          if (file) {
            processFile(file)
            return
          }
        }
      }
      setError("No image found in clipboard. Try copying an image first.")
    },
    [processFile],
  )

  const handlePasteButton = useCallback(async () => {
    try {
      const clipboardItems = await navigator.clipboard.read()
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type)
            const file = new File([blob], "pasted-image.png", { type })
            processFile(file)
            return
          }
        }
      }
      setError("No image found in clipboard. Try copying an image first.")
    } catch {
      setError("Unable to access clipboard. Please use Ctrl+V or drag & drop.")
    }
  }, [processFile])

  const handleRemove = useCallback(() => {
    onChange("")
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [onChange])

  // Global paste listener when component is focused
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (document.activeElement === dropZoneRef.current) {
        const items = e.clipboardData?.items
        if (items) {
          for (const item of items) {
            if (item.type.startsWith("image/")) {
              const file = item.getAsFile()
              if (file) {
                processFile(file)
                return
              }
            }
          }
        }
      }
    }

    document.addEventListener("paste", handleGlobalPaste)
    return () => document.removeEventListener("paste", handleGlobalPaste)
  }, [processFile])

  if (value) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Agency Logo</span>
          {showSuccess && (
            <span className="text-xs text-teal-600 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Logo saved!
            </span>
          )}
        </div>
        <Card className="p-4 bg-slate-50 border-2 border-dashed border-slate-200">
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 bg-white rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
              <img
                src={value || "/placeholder.svg"}
                alt="Agency Logo"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm text-slate-600">Logo uploaded successfully</p>
              <p className="text-xs text-slate-400">This logo will appear on all exported reports</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs"
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemove}
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                >
                  <X className="h-3 w-3 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </Card>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">Agency Logo (Optional)</span>
        <span className="text-xs text-slate-400">Max {maxSizeKB}KB</span>
      </div>
      <div
        ref={dropZoneRef}
        tabIndex={0}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
        className={`
          relative p-6 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
          ${isDragging ? "border-teal-500 bg-teal-50" : "border-slate-300 hover:border-teal-400 hover:bg-slate-50"}
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className={`
            w-14 h-14 rounded-full flex items-center justify-center transition-colors
            ${isDragging ? "bg-teal-100" : "bg-slate-100"}
          `}
          >
            <ImageIcon className={`h-7 w-7 ${isDragging ? "text-teal-600" : "text-slate-400"}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">
              {isDragging ? "Drop your logo here" : "Upload your agency logo"}
            </p>
            <p className="text-xs text-slate-500 mt-1">Drag & drop, click to browse, or paste from clipboard</p>
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
              className="text-xs"
            >
              <Upload className="h-3 w-3 mr-1" />
              Browse
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handlePasteButton()
              }}
              className="text-xs"
            >
              <ClipboardPaste className="h-3 w-3 mr-1" />
              Paste
            </Button>
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      </div>
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <X className="h-3 w-3" />
          {error}
        </p>
      )}
      <p className="text-xs text-slate-400">
        Supported formats: PNG, JPG, GIF, SVG. Logo will appear in report headers.
      </p>
    </div>
  )
}
