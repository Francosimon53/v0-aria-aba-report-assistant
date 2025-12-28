"use client"

import * as React from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Sparkles, Loader2, Wand2, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface AITextareaProps extends React.ComponentProps<"textarea"> {
  fieldName?: string
  clientData?: any
  onValueChange?: (value: string) => void
}

export const AITextarea = React.forwardRef<HTMLTextAreaElement, AITextareaProps>(
  ({ className, fieldName, clientData, onValueChange, value, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [isGenerating, setIsGenerating] = React.useState(false)
    const [customPrompt, setCustomPrompt] = React.useState("")
    const [generatedText, setGeneratedText] = React.useState("")
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)

    // Merge refs
    React.useImperativeHandle(ref, () => textareaRef.current!)

    const handleGenerate = async (action: "generate" | "improve" | "template" | "custom") => {
      console.log("[v0] AI Generate clicked:", { action, fieldName, hasValue: !!value })

      setIsGenerating(true)

      try {
        let prompt = ""
        const currentValue = (value as string) || ""

        switch (action) {
          case "generate":
            prompt = `Generate professional ABA assessment text for the field "${fieldName}". Make it detailed and clinically appropriate.`
            break
          case "improve":
            prompt = `Improve this text for the field "${fieldName}": "${currentValue}". Make it more professional and detailed while maintaining the key information.`
            break
          case "template":
            prompt = `Provide a professional template for the field "${fieldName}" in an ABA assessment report.`
            break
          case "custom":
            prompt = customPrompt
            break
        }

        console.log("[v0] Sending request to /api/chat:", { prompt, fieldName })

        let response
        try {
          response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [
                {
                  role: "user",
                  content: prompt,
                },
              ],
              clientData,
              currentStep: fieldName,
              isTextGeneration: true,
            }),
          })
        } catch (fetchError) {
          console.error("[v0] Fetch error:", fetchError)
          throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : "Unknown"}`)
        }

        console.log("[v0] Response status:", response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error("[v0] API error response:", errorText)
          throw new Error(`Failed to generate text: ${errorText}`)
        }

        let data
        try {
          data = await response.json()
          console.log("[v0] Received data:", data)
        } catch (parseError) {
          console.error("[v0] JSON parse error:", parseError)
          throw new Error("Invalid response format from server")
        }

        if (!data || typeof data !== "object") {
          console.error("[v0] Invalid data format:", data)
          throw new Error("Invalid data format received")
        }

        const text = data.message || data.content || ""

        if (!text || typeof text !== "string") {
          console.error("[v0] No text in response:", data)
          throw new Error("No text content in response")
        }

        const cleanedText = text
          .replace(/#{1,6}\s/g, "")
          .replace(/\*\*(.+?)\*\*/g, "$1")
          .replace(/\*(.+?)\*/g, "$1")
          .replace(/^\s*[-*]\s+/gm, "")
          .replace(/\[([^\]]+)\]/g, "$1")
          .trim()

        console.log("[v0] Generated text:", cleanedText)

        setGeneratedText(cleanedText)

        // Insert text into textarea
        if (onValueChange) {
          onValueChange(cleanedText)
        }

        // Also update the textarea value directly
        if (textareaRef.current) {
          textareaRef.current.value = cleanedText
          // Trigger change event
          const event = new Event("input", { bubbles: true })
          textareaRef.current.dispatchEvent(event)
        }

        setIsOpen(false)
        setCustomPrompt("")
      } catch (error) {
        console.error("[v0] AI generation error (full details):", {
          error,
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          action,
          fieldName,
        })

        // Show error to user
        alert(`Error generating text: ${error instanceof Error ? error.message : "Unknown error"}`)
      } finally {
        setIsGenerating(false)
      }
    }

    return (
      <div className="relative">
        <Textarea ref={textareaRef} className={cn("pr-12", className)} value={value} {...props} />

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute bottom-2 right-2 h-8 w-8 p-0 hover:bg-purple-50 hover:text-purple-600"
              disabled={isGenerating}
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <h4 className="font-semibold text-sm">AI Writing Assistant</h4>
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => handleGenerate("generate")}
                  disabled={isGenerating}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Text
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => handleGenerate("improve")}
                  disabled={isGenerating || !value}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Improve Writing
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => handleGenerate("template")}
                  disabled={isGenerating}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
              </div>

              <div className="space-y-2 border-t pt-3">
                <p className="text-xs text-muted-foreground">Or describe what you need:</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask AI to help..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && customPrompt.trim()) {
                        handleGenerate("custom")
                      }
                    }}
                    disabled={isGenerating}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleGenerate("custom")}
                    disabled={isGenerating || !customPrompt.trim()}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    )
  },
)

AITextarea.displayName = "AITextarea"
