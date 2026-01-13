"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { TableKit } from "@tiptap/extension-table"
import { Bold, Italic, List, ListOrdered, TableIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import DOMPurify from "dompurify"

interface RichTextEditorProps {
  value?: string
  onChange?: (html: string) => void
  placeholder?: string
  onAIGenerate?: () => void
  isGenerating?: boolean
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
  onAIGenerate,
  isGenerating = false,
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false)

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
        >
          <TableIcon className="h-4 w-4" />
        </Button>

        {onAIGenerate && (
          <>
            <div className="flex-1" />
            <button
              type="button"
              onClick={onAIGenerate}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-md hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
                  <path d="M19 15l.9 2.7 2.7.9-2.7.9-.9 2.7-.9-2.7-2.7-.9 2.7-.9.9-2.7z" />
                </svg>
              )}
              {isGenerating ? "Generating..." : "AI Generate"}
            </button>
          </>
        )}
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}
