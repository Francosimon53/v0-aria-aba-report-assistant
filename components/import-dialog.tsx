"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { UploadIcon, FileTextIcon, CheckIcon, AlertCircleIcon } from "@/components/icons"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"

interface ImportDialogProps {
  title: string
  description: string
  acceptedFormats: string[]
  onImport: (data: any) => void
  parseFunction: (file: File) => Promise<any>
}

export function ImportDialog({ title, description, acceptedFormats, onImport, parseFunction }: ImportDialogProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any>(null)
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setError("")
    setLoading(true)

    try {
      const parsed = await parseFunction(selectedFile)
      setPreview(parsed)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file")
      setPreview(null)
    } finally {
      setLoading(false)
    }
  }

  const handleImport = () => {
    if (preview) {
      onImport(preview)
      setOpen(false)
      setFile(null)
      setPreview(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UploadIcon className="h-4 w-4 mr-2" />
          Import Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Select File</Label>
            <div className="flex items-center gap-2">
              <input
                id="file-upload"
                type="file"
                accept={acceptedFormats.join(",")}
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("file-upload")?.click()}
                className="w-full"
              >
                <FileTextIcon className="h-4 w-4 mr-2" />
                {file ? file.name : "Choose File"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Supported formats: {acceptedFormats.join(", ")}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          )}

          {/* Preview */}
          {preview && !loading && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckIcon className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-900">Data Preview</h4>
                </div>
                <ScrollArea className="h-64">
                  <pre className="text-xs bg-white p-4 rounded border">{JSON.stringify(preview, null, 2)}</pre>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {preview && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleImport}>
                <CheckIcon className="h-4 w-4 mr-2" />
                Import Data
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
