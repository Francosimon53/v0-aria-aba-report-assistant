"use client"

import type React from "react"

import { useRef, useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PenToolIcon, TypeIcon, TrashIcon, CheckIcon, UndoIcon } from "@/components/icons"

interface SignaturePadProps {
  label: string
  sublabel?: string
  onSignatureChange?: (signature: string | null, name: string, date: string) => void
  className?: string
}

export function SignaturePad({ label, sublabel, onSignatureChange, className }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [typedName, setTypedName] = useState("")
  const [signatureDate, setSignatureDate] = useState(new Date().toISOString().split("T")[0])
  const [mode, setMode] = useState<"draw" | "type">("draw")
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([])
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 150 })

  // Responsive canvas sizing
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const width = Math.min(containerRef.current.offsetWidth - 32, 500)
        setCanvasSize({ width, height: 150 })
      }
    }
    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)
    return () => window.removeEventListener("resize", updateCanvasSize)
  }, [])

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // High DPI support
    const dpr = window.devicePixelRatio || 1
    canvas.width = canvasSize.width * dpr
    canvas.height = canvasSize.height * dpr
    canvas.style.width = `${canvasSize.width}px`
    canvas.style.height = `${canvasSize.height}px`
    ctx.scale(dpr, dpr)

    // Signature style
    ctx.strokeStyle = "#1a1a2e"
    ctx.lineWidth = 2.5
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.shadowBlur = 0.5
    ctx.shadowColor = "#1a1a2e"
  }, [canvasSize])

  const getCoordinates = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    let clientX: number, clientY: number

    if ("touches" in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }, [])

  const saveState = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setStrokeHistory((prev) => [...prev.slice(-10), imageData])
  }, [])

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (!ctx) return

      saveState()
      const { x, y } = getCoordinates(e)
      ctx.beginPath()
      ctx.moveTo(x, y)
      setIsDrawing(true)
    },
    [getCoordinates, saveState],
  )

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return
      e.preventDefault()
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (!ctx) return

      const { x, y } = getCoordinates(e)
      ctx.lineTo(x, y)
      ctx.stroke()
    },
    [isDrawing, getCoordinates],
  )

  const stopDrawing = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false)
      setHasSignature(true)

      // Notify parent of signature change
      const canvas = canvasRef.current
      if (canvas && onSignatureChange) {
        onSignatureChange(canvas.toDataURL("image/png"), typedName, signatureDate)
      }
    }
  }, [isDrawing, onSignatureChange, typedName, signatureDate])

  const undo = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx || strokeHistory.length === 0) return

    const lastState = strokeHistory[strokeHistory.length - 1]
    ctx.putImageData(lastState, 0, 0)
    setStrokeHistory((prev) => prev.slice(0, -1))

    if (strokeHistory.length === 1) {
      setHasSignature(false)
    }
  }, [strokeHistory])

  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    ctx.clearRect(0, 0, canvas!.width / dpr, canvas!.height / dpr)
    setHasSignature(false)
    setStrokeHistory([])
    setTypedName("")

    if (onSignatureChange) {
      onSignatureChange(null, "", signatureDate)
    }
  }, [onSignatureChange, signatureDate])

  const handleTypedNameChange = (value: string) => {
    setTypedName(value)
    if (value && onSignatureChange) {
      onSignatureChange(null, value, signatureDate)
    }
  }

  const handleDateChange = (value: string) => {
    setSignatureDate(value)
    if (onSignatureChange) {
      const canvas = canvasRef.current
      onSignatureChange(hasSignature && canvas ? canvas.toDataURL("image/png") : null, typedName, value)
    }
  }

  const isComplete = hasSignature || typedName.length > 0

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0">
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-primary/5 to-primary/10 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm">{label}</h4>
              {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
            </div>
            {isComplete && (
              <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <CheckIcon className="h-3 w-3" />
                Signed
              </div>
            )}
          </div>
        </div>

        <div className="p-4 space-y-4" ref={containerRef}>
          {/* Mode Tabs */}
          <Tabs value={mode} onValueChange={(v) => setMode(v as "draw" | "type")}>
            <TabsList className="grid w-full grid-cols-2 h-9">
              <TabsTrigger value="draw" className="text-xs gap-1.5">
                <PenToolIcon className="h-3.5 w-3.5" />
                Draw Signature
              </TabsTrigger>
              <TabsTrigger value="type" className="text-xs gap-1.5">
                <TypeIcon className="h-3.5 w-3.5" />
                Type Name
              </TabsTrigger>
            </TabsList>

            <TabsContent value="draw" className="mt-3">
              {/* Canvas */}
              <div className="relative rounded-lg border-2 border-dashed border-muted-foreground/25 bg-white overflow-hidden transition-colors hover:border-primary/50">
                <canvas
                  ref={canvasRef}
                  className="cursor-crosshair touch-none"
                  style={{ width: canvasSize.width, height: canvasSize.height }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {/* Signature line */}
                <div className="absolute bottom-6 left-4 right-4 border-b border-muted-foreground/30" />
                <span className="absolute bottom-2 left-4 text-[10px] text-muted-foreground">Sign above the line</span>

                {/* Empty state */}
                {!hasSignature && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-sm text-muted-foreground/50">Draw your signature here</p>
                  </div>
                )}
              </div>

              {/* Canvas Actions */}
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={undo}
                  disabled={strokeHistory.length === 0}
                  className="text-xs bg-transparent"
                >
                  <UndoIcon className="h-3.5 w-3.5 mr-1" />
                  Undo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearSignature}
                  disabled={!hasSignature}
                  className="text-xs bg-transparent"
                >
                  <TrashIcon className="h-3.5 w-3.5 mr-1" />
                  Clear
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="type" className="mt-3">
              {/* Typed Signature */}
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Full Legal Name</Label>
                  <Input
                    value={typedName}
                    onChange={(e) => handleTypedNameChange(e.target.value)}
                    placeholder="Enter your full name"
                    className="text-base"
                  />
                </div>

                {/* Preview */}
                {typedName && (
                  <div className="relative rounded-lg border-2 border-dashed border-muted-foreground/25 bg-white p-4 min-h-[100px] flex items-center justify-center">
                    <p
                      className="text-2xl text-center"
                      style={{ fontFamily: "'Brush Script MT', 'Segoe Script', cursive" }}
                    >
                      {typedName}
                    </p>
                    <div className="absolute bottom-4 left-4 right-4 border-b border-muted-foreground/30" />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Date Signed</Label>
              <Input
                type="date"
                value={signatureDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="flex items-end">
              {isComplete && (
                <p className="text-xs text-muted-foreground">
                  Signature captured on {new Date(signatureDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
