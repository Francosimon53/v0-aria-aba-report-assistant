"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SparklesIcon, SendIcon, CopyIcon, CheckIcon, Loader2Icon, XIcon } from "@/components/icons"
import { cn } from "@/lib/utils"

interface AIWritingPanelProps {
  currentField?: string
  onInsertText?: (text: string) => void
  contextData?: any
}

interface Suggestion {
  title: string
  content: string
  category: "template" | "improvement" | "compliance"
}

const FIELD_SUGGESTIONS: Record<string, Suggestion[]> = {
  "reason-for-referral": [
    {
      title: "Autism Spectrum Disorder",
      content:
        "Client was referred for ABA services due to a diagnosis of Autism Spectrum Disorder (DSM-5 299.00). Parents report challenges with communication, social interaction, and repetitive behaviors that significantly impact daily functioning and family routines.",
      category: "template",
    },
    {
      title: "Behavioral Concerns",
      content:
        "Client exhibits challenging behaviors including aggression, self-injury, and property destruction occurring multiple times daily. These behaviors interfere with learning opportunities and pose safety concerns requiring immediate intervention.",
      category: "template",
    },
  ],
  goals: [
    {
      title: "Communication SMART Goal",
      content:
        "Client will independently request preferred items using a 2-3 word phrase in 8 out of 10 opportunities across 3 consecutive sessions as measured by clinician data collection.",
      category: "template",
    },
    {
      title: "Social Skills SMART Goal",
      content:
        "Client will initiate and maintain a back-and-forth conversation for at least 3 exchanges with peers during structured activities in 4 out of 5 opportunities across 2 consecutive weeks.",
      category: "template",
    },
  ],
  "medical-necessity": [
    {
      title: "Insurance Justification",
      content:
        "ABA services are medically necessary to address the core deficits of Autism Spectrum Disorder that significantly impair the client's ability to function safely and independently. Without intensive behavioral intervention, the client is at risk for educational failure, social isolation, and continued dependence on caregivers for activities of daily living.",
      category: "compliance",
    },
  ],
}

export function AIWritingPanel({ currentField, onInsertText, contextData }: AIWritingPanelProps) {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [generatedText, setGeneratedText] = useState("")
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [showPanel, setShowPanel] = useState(true)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const suggestions = currentField ? FIELD_SUGGESTIONS[currentField] || [] : []

  const handleGenerate = async () => {
    if (!input.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: input,
          field: currentField,
          context: contextData,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate")

      const data = await response.json()
      setGeneratedText(data.text || "Generated content will appear here...")
    } catch (error) {
      setGeneratedText("Unable to generate content. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleInsert = (text: string) => {
    if (onInsertText) {
      onInsertText(text)
    }
  }

  if (!showPanel) {
    return (
      <button
        onClick={() => setShowPanel(true)}
        className="fixed right-6 top-20 z-40 h-10 px-4 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
      >
        <SparklesIcon className="h-4 w-4" />
        <span className="text-sm font-medium">Show AI Assistant</span>
      </button>
    )
  }

  return (
    <div className="fixed right-6 top-20 bottom-20 w-[320px] z-40 flex flex-col gap-3">
      <Card className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-600 to-cyan-600 flex items-center justify-center">
              <SparklesIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">AI Writing Assistant</h3>
              <p className="text-xs text-gray-600">Ready to help</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowPanel(false)}
            className="h-7 w-7 text-gray-500 hover:text-gray-700"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>

        {currentField && (
          <div className="text-xs text-gray-600 bg-white/50 px-2 py-1 rounded">
            <span className="font-medium">Active field:</span> {currentField}
          </div>
        )}
      </Card>

      {suggestions.length > 0 && (
        <Card className="flex-1 overflow-y-auto">
          <div className="p-3 border-b bg-gray-50">
            <h4 className="font-semibold text-sm text-gray-900">Suggested Templates</h4>
            <p className="text-xs text-gray-600 mt-0.5">Click "Insert" to use in your form</p>
          </div>
          <div className="p-3 space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <h5 className="font-medium text-xs text-gray-900">{suggestion.title}</h5>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                      suggestion.category === "template" && "bg-blue-100 text-blue-700",
                      suggestion.category === "improvement" && "bg-purple-100 text-purple-700",
                      suggestion.category === "compliance" && "bg-green-100 text-green-700",
                    )}
                  >
                    {suggestion.category}
                  </span>
                </div>
                <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-200 mb-2 leading-relaxed">
                  {suggestion.content}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleInsert(suggestion.content)}
                    className="flex-1 h-7 text-xs bg-teal-600 hover:bg-teal-700"
                  >
                    Insert into form
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(suggestion.content, index)}
                    className="h-7 w-7 p-0"
                  >
                    {copiedIndex === index ? (
                      <CheckIcon className="h-3 w-3 text-green-600" />
                    ) : (
                      <CopyIcon className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-3">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Button size="sm" variant="outline" className="h-8 text-xs justify-start gap-2 bg-transparent">
            <SparklesIcon className="h-3 w-3" />
            Generate Text
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs justify-start gap-2 bg-transparent">
            ✍️ Improve Writing
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs justify-start gap-2 col-span-2 bg-transparent">
            🔍 Check Compliance
          </Button>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-700 mb-1">Describe what you need...</div>
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="E.g., Write a medical necessity for a 5yo with autism"
              className="flex-1 px-3 py-2 text-xs border rounded-lg resize-none h-20 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={!input.trim() || isLoading}
            className="w-full h-8 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
          >
            {isLoading ? (
              <>
                <Loader2Icon className="h-3 w-3 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <SendIcon className="h-3 w-3 mr-2" />
                Generate
              </>
            )}
          </Button>
        </div>

        {generatedText && (
          <div className="mt-3 pt-3 border-t">
            <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border mb-2 leading-relaxed max-h-40 overflow-y-auto">
              {generatedText}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleInsert(generatedText)}
                className="flex-1 h-7 text-xs bg-teal-600 hover:bg-teal-700"
              >
                Insert into form
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleCopy(generatedText, -1)} className="h-7 w-7 p-0">
                {copiedIndex === -1 ? (
                  <CheckIcon className="h-3 w-3 text-green-600" />
                ) : (
                  <CopyIcon className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
