"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { TableKit } from "@tiptap/extension-table"
import { Bold, Italic, List, ListOrdered, TableIcon, Trash2, Sparkles, Loader2, Wand2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import DOMPurify from "dompurify"

interface RichTextEditorProps {
  value?: string
  onChange?: (html: string) => void
  placeholder?: string
  fieldName?: string
  clientData?: any
}

function cleanWordPaste(html: string): string {
  let cleaned = html

  // Remover comentarios y condicionales de Word
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, "")
  cleaned = cleaned.replace(/<!\[if[^\]]*\]>[\s\S]*?<!\[endif\]>/gi, "")

  // Remover tags de Office
  cleaned = cleaned.replace(/<o:p[\s\S]*?<\/o:p>/gi, "")
  cleaned = cleaned.replace(/<w:[\s\S]*?>/gi, "")
  cleaned = cleaned.replace(/<m:[\s\S]*?>/gi, "")

  // Limpiar estilos inline excesivos pero mantener tablas
  cleaned = cleaned.replace(/style="[^"]*"/gi, (match) => {
    if (match.includes("mso-")) return ""
    return match
  })

  // Remover clases de Word/Excel
  cleaned = cleaned.replace(/class="Mso[^"]*"/gi, "")

  return cleaned
}

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Start typing or paste content from Word/Excel...",
  fieldName,
  clientData,
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [customPrompt, setCustomPrompt] = useState("")

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TableKit.configure({
        resizable: true,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "text-base leading-relaxed focus:outline-none min-h-[200px] p-4",
      },
      handlePaste: (view, event) => {
        const html = event.clipboardData?.getData("text/html")
        if (!html) return false

        const cleaned = cleanWordPaste(html)
        const sanitized = DOMPurify.sanitize(cleaned, {
          ALLOWED_TAGS: [
            "p",
            "br",
            "strong",
            "em",
            "u",
            "h1",
            "h2",
            "h3",
            "ul",
            "ol",
            "li",
            "table",
            "thead",
            "tbody",
            "tr",
            "th",
            "td",
          ],
          ALLOWED_ATTR: ["colspan", "rowspan"],
        })

        const { state } = view
        const { selection } = state
        const transaction = state.tr.insertHTML(selection.from, sanitized)
        view.dispatch(transaction)
        return true
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [editor, value])

  const handleGenerate = async (action: "generate" | "improve" | "template" | "custom") => {
    if (!editor) return

    setIsGenerating(true)

    try {
      let prompt = ""
      const currentValue = editor.getHTML()

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

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          clientData,
          currentStep: fieldName,
          isTextGeneration: true,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to generate text: ${errorText}`)
      }

      const data = await response.json()
      const text = data.message || data.content || ""

      if (!text || typeof text !== "string") {
        throw new Error("No text content in response")
      }

      // Clean markdown formatting
      const cleanedText = text
        .replace(/#{1,6}\s/g, "")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/^\s*[-*]\s+/gm, "")
        .replace(/\[([^\]]+)\]/g, "$1")
        .trim()

      // Insert into editor
      editor.commands.setContent(cleanedText)
      onChange?.(cleanedText)

      setIsOpen(false)
      setCustomPrompt("")
    } catch (error) {
      console.error("[RichTextEditor] AI generation error:", error)
      alert(`Error generating text: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsGenerating(false)
    }
  }

  if (!isMounted) {
    return (
      <div className="border rounded-md">
        <div className="border-b bg-muted/40 p-2">
          <div className="h-8 bg-muted/60 rounded animate-pulse" />
        </div>
        <div className="p-4 min-h-[200px] bg-muted/20 animate-pulse" />
      </div>
    )
  }

  if (!editor) {
    return null
  }

  return (
    <div className="border rounded-md">
      {/* Toolbar */}
      <div className="border-b bg-muted/40 p-2 flex items-center gap-1 flex-wrap">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-muted" : ""}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-muted" : ""}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-muted" : ""}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-muted" : ""}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          title="Insert table"
        >
          <TableIcon className="h-4 w-4" />
        </Button>

        {editor.isActive("table") && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            title="Delete table"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}

        {/* AI Popover */}
        <div className="flex-1" />
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="hover:bg-purple-50 hover:text-purple-600"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
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
                  disabled={isGenerating || !editor?.getText()?.trim()}
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

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}
