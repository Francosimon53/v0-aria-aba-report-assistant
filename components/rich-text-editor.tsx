"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { TableKit } from "@tiptap/extension-table"
import { Bold, Italic, List, ListOrdered, TableIcon, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

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

export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Type here or paste from Word/Excel...",
  onAIGenerate,
  isGenerating = false,
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [DOMPurify, setDOMPurify] = useState<any>(null)

  useEffect(() => {
    setIsMounted(true)
    import("dompurify").then((mod) => {
      setDOMPurify(mod.default)
    })
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
        if (!DOMPurify) return false

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
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAIGenerate}
              disabled={isGenerating}
              className="ml-auto bg-transparent"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate with AI"}
            </Button>
          </>
        )}
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}
