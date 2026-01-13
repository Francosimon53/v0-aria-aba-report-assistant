"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Table from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import DOMPurify from "dompurify"
import { Bold, Italic, List, ListOrdered, TableIcon, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  cleaned = cleaned.replace(/<w:[\s\S]*?<\/w:[\s\S]*?>/gi, "")
  cleaned = cleaned.replace(/<m:[\s\S]*?<\/m:[\s\S]*?>/gi, "")

  // Remover namespaces XML
  cleaned = cleaned.replace(/\s*xmlns[:=][^\s>]*/gi, "")

  // Remover clases y estilos de Word
  cleaned = cleaned.replace(/class="[^"]*Mso[^"]*"/gi, "")
  cleaned = cleaned.replace(/style="[^"]*mso[^"]*"/gi, "")

  // Limpiar spans vacíos
  cleaned = cleaned.replace(/<span[^>]*>\s*<\/span>/gi, "")

  // Convertir <b> a <strong>, <i> a <em>
  cleaned = cleaned.replace(/<b\b[^>]*>/gi, "<strong>")
  cleaned = cleaned.replace(/<\/b>/gi, "</strong>")
  cleaned = cleaned.replace(/<i\b[^>]*>/gi, "<em>")
  cleaned = cleaned.replace(/<\/i>/gi, "</em>")

  return cleaned
}

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Escriba aquí o pegue desde Word/Excel...",
  onAIGenerate,
  isGenerating = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Table.configure({ resizable: true }), TableRow, TableHeader, TableCell],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[150px] p-4",
      },
      handlePaste: (view, event, slice) => {
        const clipboardData = event.clipboardData
        if (!clipboardData) return false

        const html = clipboardData.getData("text/html")

        if (html && (html.includes("mso-") || html.includes("xmlns:w") || html.includes("urn:schemas-microsoft"))) {
          event.preventDefault()

          let cleanedHTML = cleanWordPaste(html)

          cleanedHTML = DOMPurify.sanitize(cleanedHTML, {
            ALLOWED_TAGS: [
              "p",
              "br",
              "strong",
              "b",
              "em",
              "i",
              "u",
              "ul",
              "ol",
              "li",
              "h1",
              "h2",
              "h3",
              "h4",
              "table",
              "tr",
              "td",
              "th",
              "thead",
              "tbody",
            ],
            ALLOWED_ATTR: ["colspan", "rowspan"],
          })

          editor?.commands.insertContent(cleanedHTML)
          return true
        }

        return false
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  if (!editor) {
    return <div className="h-[200px] border rounded-lg bg-gray-50 animate-pulse" />
  }

  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      <div className="flex items-center gap-1 p-2 border-b bg-gray-50 flex-wrap">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-gray-200" : ""}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-gray-200" : ""}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-gray-200" : ""}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-gray-200" : ""}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()}
        >
          <TableIcon className="h-4 w-4" />
        </Button>

        <div className="flex-1" />

        {onAIGenerate && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAIGenerate}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            {isGenerating ? "Generating..." : "AI Generate"}
          </Button>
        )}
      </div>

      <div className="relative">
        <EditorContent editor={editor} />
        {!editor.getText() && (
          <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">{placeholder}</div>
        )}
      </div>

      <div className="px-3 py-2 border-t bg-gray-50 text-xs text-gray-500">
        💡 Tip: Puedes pegar directamente desde Word o Excel - el formato se preservará
      </div>
    </div>
  )
}
