"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SendIcon, BotIcon, UserIcon, FileTextIcon, DownloadIcon, UploadIcon } from "@/components/icons"

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const API = process.env.NEXT_PUBLIC_MOTOR_BRAIN_API || ""

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/jpg",
]

const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".png", ".jpg", ".jpeg"]

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UploadedFile {
  name: string
  size: number
  type: string
  file: File
}

interface SectionProgress {
  id: string
  title: string
  status: "pending" | "generated" | "writing"
}

interface AssessmentExport {
  id: string
  format: string
  file_path: string
  file_size_bytes: number
  exported_at: string
}

interface AssessmentHistoryItem {
  id: string
  client_name: string | null
  assessment_type: string
  status: string
  created_at: string
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  // Rich content
  files?: UploadedFile[]
  sections?: SectionProgress[]
  actions?: MessageAction[]
}

interface MessageAction {
  label: string
  icon: "download" | "upload" | "generate"
  onClick: () => void
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

async function apiParseDocuments(files: File[]): Promise<any> {
  const form = new FormData()
  for (const f of files) {
    form.append("files", f)
  }
  const res = await fetch(`${API}/v1/parse`, { method: "POST", body: form })
  if (!res.ok) throw new Error(`Parse failed: ${res.status}`)
  return res.json()
}

async function apiCreateAssessment(data: {
  assessment_type: string
  client_name?: string
  insurer_id?: string
  tenant_id?: string
}): Promise<any> {
  const res = await fetch(`${API}/v1/assessment/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, tenant_id: data.tenant_id || "default" }),
  })
  if (!res.ok) throw new Error(`Create failed: ${res.status}`)
  return res.json()
}

async function apiUploadDocuments(assessmentId: string, files: File[], tenantId = "default"): Promise<any> {
  const form = new FormData()
  for (const f of files) {
    form.append("files", f)
  }
  form.append("tenant_id", tenantId)
  const res = await fetch(`${API}/v1/assessment/${assessmentId}/upload`, {
    method: "POST",
    body: form,
  })
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
  return res.json()
}

async function apiGenerateAssessment(assessmentId: string, tenantId = "default"): Promise<any> {
  const res = await fetch(`${API}/v1/assessment/${assessmentId}/generate?tenant_id=${tenantId}`, {
    method: "POST",
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || `Generate failed: ${res.status}`)
  }
  return res.json()
}

async function apiGetSections(assessmentId: string, tenantId = "default"): Promise<any> {
  const res = await fetch(`${API}/v1/assessment/${assessmentId}/sections?tenant_id=${tenantId}`)
  if (!res.ok) throw new Error(`Sections fetch failed: ${res.status}`)
  return res.json()
}

async function apiChatMessage(assessmentId: string, message: string, tenantId = "default"): Promise<any> {
  const res = await fetch(`${API}/v1/assessment/${assessmentId}/chat?tenant_id=${tenantId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  })
  if (!res.ok) throw new Error(`Chat failed: ${res.status}`)
  return res.json()
}

async function apiExport(assessmentId: string, format: "docx" | "pdf", tenantId = "default"): Promise<Blob> {
  const res = await fetch(`${API}/v1/assessment/${assessmentId}/export?tenant_id=${tenantId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ format }),
  })
  if (!res.ok) throw new Error(`Export failed: ${res.status}`)
  return res.blob()
}

async function apiGetExports(assessmentId: string, tenantId = "default"): Promise<any> {
  const res = await fetch(`${API}/v1/assessment/${assessmentId}/exports?tenant_id=${tenantId}`)
  if (!res.ok) throw new Error(`Exports fetch failed: ${res.status}`)
  return res.json()
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MarkdownRenderer({ content }: { content: string }) {
  if (!content || content.trim() === "") {
    return <p className="text-sm text-muted-foreground italic">No response received</p>
  }

  const lines = content.split("\n")
  const elements: React.ReactNode[] = []
  let currentList: string[] = []
  let currentNumberedList: string[] = []
  let key = 0

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={key++} className="space-y-2.5 my-4">
          {currentList.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="text-[#0D9488] dark:text-teal-400 font-bold text-lg leading-none mt-0.5 shrink-0">
                •
              </span>
              <span className="text-[15px] leading-7 text-gray-800 dark:text-gray-200">{parseInline(item)}</span>
            </li>
          ))}
        </ul>,
      )
      currentList = []
    }
  }

  const flushNumberedList = () => {
    if (currentNumberedList.length > 0) {
      elements.push(
        <ol key={key++} className="space-y-2.5 my-4 ml-1">
          {currentNumberedList.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="text-[#0D9488] dark:text-teal-400 font-semibold text-[15px] leading-7 shrink-0 min-w-[24px]">
                {idx + 1}.
              </span>
              <span className="text-[15px] leading-7 text-gray-800 dark:text-gray-200">{parseInline(item)}</span>
            </li>
          ))}
        </ol>,
      )
      currentNumberedList = []
    }
  }

  const parseInline = (text: string): React.ReactNode => {
    const segments: React.ReactNode[] = []
    let remaining = text
    let segmentKey = 0

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
      if (boldMatch && boldMatch.index !== undefined) {
        if (boldMatch.index > 0) segments.push(remaining.slice(0, boldMatch.index))
        segments.push(
          <strong key={`bold-${segmentKey++}`} className="font-semibold text-gray-900 dark:text-white">
            {boldMatch[1]}
          </strong>,
        )
        remaining = remaining.slice(boldMatch.index + boldMatch[0].length)
        continue
      }

      const italicMatch = remaining.match(/(?<!\*)\*([^*]+?)\*(?!\*)/)
      if (italicMatch && italicMatch.index !== undefined) {
        if (italicMatch.index > 0) segments.push(remaining.slice(0, italicMatch.index))
        segments.push(
          <em key={`italic-${segmentKey++}`} className="italic">
            {italicMatch[1]}
          </em>,
        )
        remaining = remaining.slice(italicMatch.index + italicMatch[0].length)
        continue
      }

      const codeMatch = remaining.match(/`(.+?)`/)
      if (codeMatch && codeMatch.index !== undefined) {
        if (codeMatch.index > 0) segments.push(remaining.slice(0, codeMatch.index))
        segments.push(
          <code
            key={`code-${segmentKey++}`}
            className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-[#0D9488] dark:text-teal-400"
          >
            {codeMatch[1]}
          </code>,
        )
        remaining = remaining.slice(codeMatch.index + codeMatch[0].length)
        continue
      }

      segments.push(remaining)
      break
    }

    return segments
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (!line) {
      flushList()
      flushNumberedList()
      continue
    }

    const headerMatch = line.match(/^(#{1,4})\s+(.+)$/)
    if (headerMatch) {
      flushList()
      flushNumberedList()
      const level = headerMatch[1].length
      elements.push(
        <h3
          key={key++}
          className={`font-semibold text-gray-900 dark:text-white mt-6 mb-3 first:mt-0 ${
            level === 1 ? "text-xl" : level === 2 ? "text-lg" : "text-base"
          }`}
        >
          {parseInline(headerMatch[2])}
        </h3>,
      )
      continue
    }

    const bulletMatch = line.match(/^[-*•]\s+(.+)$/)
    if (bulletMatch) {
      flushNumberedList()
      currentList.push(bulletMatch[1])
      continue
    }

    const numberedMatch = line.match(/^\d+\.\s+(.+)$/)
    if (numberedMatch) {
      flushList()
      currentNumberedList.push(numberedMatch[1])
      continue
    }

    flushList()
    flushNumberedList()
    elements.push(
      <p key={key++} className="text-[15px] leading-7 text-gray-800 dark:text-gray-200 my-3 first:mt-0">
        {parseInline(line)}
      </p>,
    )
  }

  flushList()
  flushNumberedList()

  return <div className="space-y-0">{elements}</div>
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-3">
      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
    </div>
  )
}

function FileAttachment({ name, size }: { name: string; size: number }) {
  const sizeStr = size > 1_000_000 ? `${(size / 1_000_000).toFixed(1)} MB` : `${(size / 1_000).toFixed(0)} KB`
  const ext = name.split(".").pop()?.toLowerCase()
  const icon = ext === "pdf" ? "\u{1F4C4}" : ext === "docx" ? "\u{1F4DD}" : "\u{1F5BC}"

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm">
      <span>{icon}</span>
      <span className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[200px]">{name}</span>
      <span className="text-gray-400 text-xs whitespace-nowrap">({sizeStr})</span>
    </div>
  )
}

function SectionProgressList({ sections }: { sections: SectionProgress[] }) {
  return (
    <div className="space-y-1.5 my-3 font-mono text-[13px]">
      {sections.map((s) => (
        <div key={s.id} className="flex items-center gap-2">
          {s.status === "generated" && <span className="text-[#0D9488]">\u2705</span>}
          {s.status === "writing" && <span className="text-amber-500 animate-pulse">\u26A1</span>}
          {s.status === "pending" && <span className="text-gray-300">\u25CB</span>}
          <span className={s.status === "pending" ? "text-gray-400" : "text-gray-700 dark:text-gray-300"}>
            {s.title}
            {s.status === "writing" && <span className="text-amber-500 ml-1">(writing...)</span>}
          </span>
        </div>
      ))}
    </div>
  )
}

function ActionButtons({ actions }: { actions: MessageAction[] }) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#0D9488] bg-white dark:bg-gray-800 border border-[#0D9488]/30 rounded-full hover:bg-[#0D9488]/5 hover:border-[#0D9488] transition-all duration-200"
        >
          {action.icon === "download" && <DownloadIcon className="h-3.5 w-3.5" />}
          {action.icon === "upload" && <UploadIcon className="h-3.5 w-3.5" />}
          {action.icon === "generate" && <FileTextIcon className="h-3.5 w-3.5" />}
          {action.label}
        </button>
      ))}
    </div>
  )
}

function PaperclipIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatBytes(bytes: number): string {
  if (bytes > 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  return `${(bytes / 1_000).toFixed(0)} KB`
}

function formatExtractionSummary(parseResult: any): string {
  const merged = parseResult?.merged_data || parseResult?.parse_result?.merged_data || {}
  const docs = parseResult?.documents || parseResult?.parse_result?.documents || []
  const client = merged.client || {}
  const insurance = merged.insurance || {}
  const scores = merged.assessment_scores || {}
  const behaviors = merged.target_behaviors || []

  let summary = `I've analyzed your ${docs.length} document${docs.length !== 1 ? "s" : ""}. Here's what I found:\n\n`

  if (client.name) summary += `\u{1F4CB} **Client:** ${client.name}`
  if (client.dob) summary += `, ${client.dob}`
  if (client.name) summary += "\n"

  if (client.diagnosis_code || client.diagnosis) {
    summary += `\u{1F3E5} **Diagnosis:** ${client.diagnosis_code || ""} ${client.diagnosis ? `\u2014 ${client.diagnosis}` : ""}\n`
  }

  if (insurance.name || insurance.id) {
    summary += `\u{1F4B3} **Insurance:** ${insurance.name || insurance.id || "Unknown"}\n`
  }

  // Assessment scores
  const scoreEntries = Object.entries(scores)
  if (scoreEntries.length > 0) {
    for (const [tool, data] of scoreEntries) {
      if (typeof data === "object" && data !== null) {
        const entries = Object.entries(data as Record<string, unknown>).slice(0, 4)
        if (entries.length > 0) {
          const parts = entries.map(([k, v]) => `${k}: ${v}`).join(", ")
          summary += `\u{1F4CA} **${tool}:** ${parts}\n`
        }
      }
    }
  }

  // Target behaviors
  if (behaviors.length > 0) {
    const behaviorList = behaviors
      .slice(0, 5)
      .map((b: any) => {
        const name = typeof b === "string" ? b : b.name || b.behavior || "Unknown"
        const freq = typeof b === "object" && b.frequency ? ` (${b.frequency})` : ""
        return `${name}${freq}`
      })
      .join(", ")
    summary += `\u26A0\uFE0F **Target behaviors:** ${behaviorList}\n`
  }

  summary += "\nTell me the insurer and how many hours you want to request, and I'll generate the complete assessment."

  return summary
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ChatInterface() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState("")
  const [hasStartedChat, setHasStartedChat] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Assessment state
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [tenantId] = useState("default")
  const [pendingFiles, setPendingFiles] = useState<File[]>([])

  // Welcome message
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `Welcome to **Motor Brain** Assessment Engine. I generate complete ABA assessments for insurance authorization.

Here's how it works:
1. Drop your clinical documents here (VB-MAPP, referrals, observation notes)
2. Tell me the client's insurer and hours you want to request
3. I'll generate the complete assessment in your format

\u{1F4A1} **Tip:** Upload a previously approved assessment first so I can learn your format.`,
        actions: [
          { label: "Upload Documents", icon: "upload", onClick: () => fileInputRef.current?.click() },
        ],
      },
    ])
  }, [])

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  // --- Helpers to add messages ---
  const addMessage = useCallback((msg: Omit<Message, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setMessages((prev) => [...prev, { ...msg, id }])
    return id
  }, [])

  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)))
  }, [])

  // --- File handling ---
  const isAcceptedFile = (file: File): boolean => {
    if (ACCEPTED_TYPES.includes(file.type)) return true
    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`
    return ACCEPTED_EXTENSIONS.includes(ext)
  }

  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList).filter(isAcceptedFile)
      if (files.length === 0) {
        setError("Please upload PDF, DOCX, PNG, or JPG files.")
        return
      }

      setHasStartedChat(true)
      setError(null)

      // Show file bubbles as user message
      const uploadedFiles: UploadedFile[] = files.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        file: f,
      }))
      addMessage({ role: "user", content: "", files: uploadedFiles })

      setIsLoading(true)

      try {
        if (assessmentId) {
          // Upload to existing assessment
          const result = await apiUploadDocuments(assessmentId, files, tenantId)
          const summary = formatExtractionSummary(result)
          addMessage({
            role: "assistant",
            content: summary,
            actions: [
              {
                label: "Generate Now",
                icon: "generate",
                onClick: () => handleGenerate(),
              },
            ],
          })
        } else {
          // No assessment yet — create one
          const createResult = await apiCreateAssessment({
            assessment_type: "initial",
            tenant_id: tenantId,
          })
          const newId = createResult.assessment_id
          setAssessmentId(newId)

          // Upload docs to the new assessment
          const uploadResult = await apiUploadDocuments(newId, files, tenantId)
          const summary = formatExtractionSummary(uploadResult)
          addMessage({
            role: "assistant",
            content: summary,
            actions: [
              {
                label: "Generate Now",
                icon: "generate",
                onClick: () => handleGenerate(newId),
              },
            ],
          })
        }
      } catch (err) {
        console.error("[Motor Brain] File upload error:", err)
        addMessage({
          role: "assistant",
          content: `Sorry, I had trouble processing your files. ${err instanceof Error ? err.message : "Please try again."}`,
        })
      } finally {
        setIsLoading(false)
      }
    },
    [assessmentId, tenantId, addMessage],
  )

  // --- Drag and drop ---
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget === e.target) setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles],
  )

  // --- Assessment generation ---
  const handleGenerate = useCallback(
    async (overrideId?: string) => {
      const id = overrideId || assessmentId
      if (!id) {
        addMessage({ role: "assistant", content: "Please upload clinical documents first so I have data to work with." })
        return
      }

      setIsLoading(true)

      // Show initial progress message
      const progressId = addMessage({
        role: "assistant",
        content: "Generating your assessment...\n",
        sections: [],
      })

      try {
        // Start generation
        const result = await apiGenerateAssessment(id, tenantId)

        // Show completion
        const totalWords = result.total_word_count || 0
        const totalSections = result.total_sections || 0
        const pages = Math.round(totalWords / 500)

        const completeSections: SectionProgress[] = (result.sections || []).map((s: any) => ({
          id: s.section_id,
          title: s.title,
          status: "generated" as const,
        }))

        updateMessage(progressId, {
          content: `\u2705 **Assessment complete!**\n\n\u{1F4CA} ${totalSections} sections | ~${pages} pages | ~${totalWords.toLocaleString()} words`,
          sections: completeSections,
          actions: [
            {
              label: "Download Word",
              icon: "download",
              onClick: () => handleExport("docx"),
            },
            {
              label: "Download PDF",
              icon: "download",
              onClick: () => handleExport("pdf"),
            },
          ],
        })
      } catch (err) {
        console.error("[Motor Brain] Generation error:", err)
        updateMessage(progressId, {
          content: `Sorry, generation failed. ${err instanceof Error ? err.message : "Please try again."}`,
          sections: undefined,
        })
      } finally {
        setIsLoading(false)
      }
    },
    [assessmentId, tenantId, addMessage, updateMessage],
  )

  // --- Export ---
  const handleExport = useCallback(
    async (format: "docx" | "pdf") => {
      if (!assessmentId) return

      setIsLoading(true)
      try {
        const blob = await apiExport(assessmentId, format, tenantId)
        const ext = format === "docx" ? "docx" : "pdf"
        const filename = `assessment_${assessmentId.slice(0, 8)}.${ext}`
        triggerDownload(blob, filename)

        addMessage({
          role: "assistant",
          content: `\u{1F4E5} **${format.toUpperCase()}** downloaded: \`${filename}\` (${formatBytes(blob.size)})`,
        })
      } catch (err) {
        console.error("[Motor Brain] Export error:", err)
        addMessage({
          role: "assistant",
          content: `Export failed. ${err instanceof Error ? err.message : "Please try again."}`,
        })
      } finally {
        setIsLoading(false)
      }
    },
    [assessmentId, tenantId, addMessage],
  )

  // --- Send text message ---
  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return

      setHasStartedChat(true)
      addMessage({ role: "user", content: text })
      setInputValue("")
      setIsLoading(true)
      setError(null)

      try {
        if (assessmentId) {
          // Route through Motor Brain chat controller
          const result = await apiChatMessage(assessmentId, text, tenantId)

          // Check if the backend triggered generation
          if (result.action === "generate_full" && result.generation_result) {
            const gen = result.generation_result
            const totalWords = gen.total_word_count || 0
            const totalSections = gen.total_sections || 0
            const pages = Math.round(totalWords / 500)

            const sections: SectionProgress[] = (gen.sections || []).map((s: any) => ({
              id: s.section_id,
              title: s.title,
              status: "generated" as const,
            }))

            addMessage({
              role: "assistant",
              content: `${result.response || ""}\n\n\u2705 **Assessment complete!**\n\n\u{1F4CA} ${totalSections} sections | ~${pages} pages | ~${totalWords.toLocaleString()} words`,
              sections,
              actions: [
                { label: "Download Word", icon: "download", onClick: () => handleExport("docx") },
                { label: "Download PDF", icon: "download", onClick: () => handleExport("pdf") },
              ],
            })
          } else if (result.action === "generate_section" && result.section_result) {
            addMessage({
              role: "assistant",
              content: result.response || `\u2705 Section updated: **${result.section_result.title}**`,
              actions: [
                { label: "Download Updated Word", icon: "download", onClick: () => handleExport("docx") },
                { label: "Download Updated PDF", icon: "download", onClick: () => handleExport("pdf") },
              ],
            })
          } else {
            // Regular chat response
            addMessage({
              role: "assistant",
              content: result.response || result.content || "I didn't receive a response. Please try again.",
            })
          }
        } else {
          // No assessment context — fall back to existing ABA generate endpoint
          const response = await fetch("/api/aba-generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "chat",
              data: { message: text, context: {} },
            }),
          })

          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
          const data = await response.json()
          addMessage({
            role: "assistant",
            content: data.content || "I didn't receive a response. Please try again.",
          })
        }
      } catch (err) {
        console.error("[Motor Brain] Chat error:", err)
        addMessage({
          role: "assistant",
          content: `Something went wrong. ${err instanceof Error ? err.message : "Please try again."}`,
        })
      } finally {
        setIsLoading(false)
      }
    },
    [assessmentId, tenantId, isLoading, addMessage, handleExport],
  )

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      handleSend(inputValue)
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      className="flex flex-col h-full overflow-hidden bg-gradient-to-b from-background to-muted/20 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0D9488]/10 border-2 border-dashed border-[#0D9488] rounded-lg animate-in fade-in duration-150">
          <div className="text-center">
            <UploadIcon className="h-12 w-12 text-[#0D9488] mx-auto mb-3" />
            <p className="text-lg font-medium text-[#0D9488]">Drop clinical documents here</p>
            <p className="text-sm text-[#0D9488]/70 mt-1">PDF, DOCX, PNG, JPG</p>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.png,.jpg,.jpeg"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files)
            e.target.value = ""
          }
        }}
      />

      {/* Error display */}
      {error && (
        <div className="mx-4 mt-4 px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-lg animate-in slide-in-from-top-2">
          <p className="text-sm text-destructive font-medium">{error}</p>
          <button onClick={() => setError(null)} className="text-xs text-destructive/70 mt-1 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="p-4 sm:p-6 space-y-6 pb-20 max-w-3xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0D9488] to-[#0891B2] shadow-md ring-2 ring-[#0D9488]/20 dark:ring-teal-900">
                    <BotIcon className="h-5 w-5 text-white" />
                  </div>
                )}
                <div
                  className={`rounded-2xl max-w-[85%] sm:max-w-[80%] transition-all duration-300 ease-out ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-[#0D9488] to-[#0891B2] text-white px-4 py-3 shadow-lg rounded-br-md"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-5 py-4 shadow-sm rounded-bl-md"
                  }`}
                >
                  {/* File attachments */}
                  {message.files && message.files.length > 0 && (
                    <div className="flex flex-col gap-2 mb-2">
                      {message.files.map((f, idx) => (
                        <FileAttachment key={idx} name={f.name} size={f.size} />
                      ))}
                    </div>
                  )}

                  {/* Text content */}
                  {message.content && (
                    message.role === "assistant" ? (
                      <MarkdownRenderer content={message.content} />
                    ) : (
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    )
                  )}

                  {/* Section progress */}
                  {message.sections && message.sections.length > 0 && (
                    <SectionProgressList sections={message.sections} />
                  )}

                  {/* Action buttons */}
                  {message.actions && message.actions.length > 0 && (
                    <ActionButtons actions={message.actions} />
                  )}
                </div>
                {message.role === "user" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0D9488] to-[#0891B2] shadow-md ring-2 ring-[#0D9488]/20 dark:ring-teal-900">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0D9488] to-[#0891B2] shadow-md ring-2 ring-[#0D9488]/20 dark:ring-teal-900">
                  <BotIcon className="h-5 w-5 text-white" />
                </div>
                <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-5 py-3 shadow-sm rounded-bl-md">
                  <TypingIndicator />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input area */}
      <form onSubmit={onSubmit} className="px-4 sm:px-6 py-4 border-t border-border bg-background">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-11 w-11 shrink-0 flex items-center justify-center rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-[#0D9488] hover:bg-[#0D9488]/5 transition-all duration-200"
            title="Attach files"
          >
            <PaperclipIcon className="h-5 w-5 text-gray-400 hover:text-[#0D9488]" />
          </button>
          <Input
            placeholder={assessmentId ? "Tell Motor Brain what you need..." : "Ask Motor Brain anything..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 text-sm h-11 rounded-xl border-2 focus:border-[#0D9488] dark:focus:border-teal-400 transition-colors duration-300 ease-out"
            disabled={isLoading}
            autoFocus
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            size="icon"
            className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#0D9488] to-[#0891B2] hover:from-[#0F766E] hover:to-[#0E7490] shadow-lg transition-all duration-300 ease-out disabled:opacity-50"
          >
            <SendIcon className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  )
}
