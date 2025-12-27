"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SparklesIcon, CopyIcon, CheckIcon, XIcon, SendIcon } from "@/components/icons"

interface AIWritingAssistantProps {
  activeField?: string
  onGenerateText?: (field: string, prompt: string) => Promise<string>
  onInsertText?: (text: string) => void
  onClose?: () => void
}

export function AIWritingAssistant({ activeField, onGenerateText, onInsertText, onClose }: AIWritingAssistantProps) {
  const [generatedText, setGeneratedText] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [customPrompt, setCustomPrompt] = useState("")
  const [copied, setCopied] = useState(false)

  const suggestions = getContextualSuggestions(activeField)

  const handleGenerate = async (prompt: string) => {
    if (!onGenerateText || !activeField) return

    setIsGenerating(true)
    try {
      const text = await onGenerateText(activeField, prompt)
      setGeneratedText(text)
    } catch (error) {
      console.error("[v0] Error generating text:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleInsert = () => {
    if (onInsertText && generatedText) {
      onInsertText(generatedText)
    }
  }

  return (
    <aside className="w-[320px] bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <SparklesIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">AI Assistant</h3>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-green-50 text-green-700">
                Ready to help
              </Badge>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {activeField && (
          <div className="mb-4">
            <div className="text-xs font-medium text-gray-500 mb-2">Suggestions for this field</div>
            <div className="space-y-2">
              {suggestions.map((suggestion, idx) => (
                <Card
                  key={idx}
                  className="p-3 cursor-pointer hover:border-teal-500 transition-colors"
                  onClick={() => handleGenerate(suggestion.prompt)}
                >
                  <div className="text-sm font-medium text-gray-900 mb-1">{suggestion.title}</div>
                  <div className="text-xs text-gray-500">{suggestion.description}</div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <div className="text-xs font-medium text-gray-500 mb-2">Quick Actions</div>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start text-left h-auto py-2 bg-transparent"
              onClick={() => handleGenerate("Generate professional text for this section")}
              disabled={isGenerating || !activeField}
            >
              <SparklesIcon className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-sm">Generate Text</span>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-left h-auto py-2 bg-transparent"
              disabled={!generatedText || isGenerating}
            >
              <span className="text-sm">Improve Writing</span>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-left h-auto py-2 bg-transparent"
              disabled={!generatedText || isGenerating}
            >
              <span className="text-sm">Check Compliance</span>
            </Button>
          </div>
        </div>

        {generatedText && (
          <div className="mb-4">
            <div className="text-xs font-medium text-gray-500 mb-2">Generated Content</div>
            <Card className="p-3 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <div className="text-sm text-gray-900 whitespace-pre-wrap mb-3">{generatedText}</div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-gradient-to-r from-teal-600 to-cyan-600" onClick={handleInsert}>
                  Insert into form
                </Button>
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  {copied ? <CheckIcon className="w-3 h-3" /> : <CopyIcon className="w-3 h-3" />}
                </Button>
              </div>
            </Card>
          </div>
        )}

        <div>
          <div className="text-xs font-medium text-gray-500 mb-2">Custom Request</div>
          <div className="space-y-2">
            <Textarea
              placeholder="Ask AI to help with anything..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="min-h-[80px] resize-none"
              disabled={isGenerating}
            />
            <Button
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500"
              onClick={() => customPrompt && handleGenerate(customPrompt)}
              disabled={isGenerating || !customPrompt.trim() || !activeField}
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </span>
              ) : (
                <>
                  <SendIcon className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>
      </ScrollArea>
    </aside>
  )
}

// Helper function for contextual suggestions
function getContextualSuggestions(field?: string) {
  const suggestionsByField: Record<string, Array<{ title: string; description: string; prompt: string }>> = {
    "reason-for-referral": [
      {
        title: "Professional Summary",
        description: "Generate a clinical summary of referral reasons",
        prompt: "Write a professional summary of the reason for referral based on typical ABA assessment needs",
      },
      {
        title: "Behavioral Concerns",
        description: "List common behavioral concerns",
        prompt: "List common behavioral concerns that lead to ABA referrals",
      },
    ],
    goals: [
      {
        title: "SMART Goals",
        description: "Generate measurable treatment goals",
        prompt: "Create SMART goals for ABA treatment",
      },
      {
        title: "Objective Criteria",
        description: "Add measurable criteria to goals",
        prompt: "Add specific, measurable criteria for tracking goal progress",
      },
    ],
    "medical-necessity": [
      {
        title: "Medical Justification",
        description: "Justify medical necessity for treatment",
        prompt: "Write medical necessity justification for ABA services",
      },
      {
        title: "Clinical Rationale",
        description: "Explain clinical reasoning",
        prompt: "Provide clinical rationale for recommended intervention",
      },
    ],
  }

  return (
    suggestionsByField[field || ""] || [
      {
        title: "General Assistance",
        description: "Get AI help with this section",
        prompt: "Help me write professional content for this field",
      },
    ]
  )
}
