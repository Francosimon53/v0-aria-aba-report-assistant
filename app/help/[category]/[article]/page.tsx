"use client"

import type React from "react"
import { Suspense } from "react"
import { useState, useMemo } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  Sparkles,
  Rocket,
  ClipboardList,
  BarChart3,
  FileText,
  Shield,
  Lock,
  HelpCircle,
  BookOpen,
  Menu,
  X,
  Mail,
  ThumbsUp,
  ThumbsDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { helpCategories, getArticle } from "@/lib/help-center-data"
import ReactMarkdown from "react-markdown"
import { useToast } from "@/hooks/use-toast"

const iconMap: Record<string, React.ReactNode> = {
  Rocket: <Rocket className="h-4 w-4" />,
  ClipboardList: <ClipboardList className="h-4 w-4" />,
  Sparkles: <Sparkles className="h-4 w-4" />,
  BarChart3: <BarChart3 className="h-4 w-4" />,
  FileText: <FileText className="h-4 w-4" />,
  Shield: <Shield className="h-4 w-4" />,
  Lock: <Lock className="h-4 w-4" />,
  HelpCircle: <HelpCircle className="h-4 w-4" />,
  BookOpen: <BookOpen className="h-4 w-4" />,
}

function ArticleContent() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [feedbackGiven, setFeedbackGiven] = useState<"yes" | "no" | null>(null)

  const categorySlug = params.category as string
  const articleSlug = params.article as string

  const articleData = useMemo(() => {
    return getArticle(categorySlug, articleSlug)
  }, [categorySlug, articleSlug])

  // Get prev/next articles for navigation
  const navigation = useMemo(() => {
    if (!articleData) return { prev: null, next: null }

    const allArticles: { category: string; article: string; title: string }[] = []
    helpCategories.forEach((cat) => {
      cat.articles.forEach((art) => {
        allArticles.push({ category: cat.slug, article: art.slug, title: art.title })
      })
    })

    const currentIndex = allArticles.findIndex((a) => a.category === categorySlug && a.article === articleSlug)

    return {
      prev: currentIndex > 0 ? allArticles[currentIndex - 1] : null,
      next: currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null,
    }
  }, [articleData, categorySlug, articleSlug])

  const handleFeedback = (helpful: boolean) => {
    setFeedbackGiven(helpful ? "yes" : "no")
    toast({
      title: "Thank you for your feedback!",
      description: helpful ? "We're glad this article was helpful." : "We'll work on improving this article.",
    })
  }

  if (!articleData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Article not found</h1>
          <p className="text-gray-600 mb-4">The article you're looking for doesn't exist.</p>
          <Link href="/help">
            <Button>Back to Help Center</Button>
          </Link>
        </div>
      </div>
    )
  }

  const { category, article } = articleData

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`
        w-72 bg-white border-r fixed h-full overflow-y-auto z-50 transition-transform duration-300
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
            Back to ARIA
          </Link>
          <button className="lg:hidden p-1 hover:bg-gray-100 rounded" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <Link href="/help">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2 hover:text-teal-600">
              <HelpCircle className="h-5 w-5 text-teal-600" />
              Help Center
            </h2>
          </Link>

          <Accordion type="multiple" defaultValue={[category.id]} className="space-y-1">
            {helpCategories.map((cat) => (
              <AccordionItem key={cat.id} value={cat.id} className="border-none">
                <AccordionTrigger className="text-sm font-medium py-2 hover:no-underline hover:bg-gray-50 px-2 rounded">
                  <span className="flex items-center gap-2">
                    {iconMap[cat.icon]}
                    {cat.name}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  <ul className="space-y-0.5 pl-6 py-1">
                    {cat.articles.map((art) => (
                      <li key={art.slug}>
                        <Link
                          href={`/help/${cat.slug}/${art.slug}`}
                          className={`text-sm block py-1.5 px-2 rounded flex items-center gap-2 ${
                            cat.slug === categorySlug && art.slug === articleSlug
                              ? "bg-teal-50 text-teal-700 font-medium"
                              : "text-gray-600 hover:text-teal-600 hover:bg-gray-50"
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {art.title}
                          {art.isNew && (
                            <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 px-1 py-0">
                              NEW
                            </Badge>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact support card */}
        <div className="p-4 mt-4 border-t">
          <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-teal-600" />
                <span className="font-medium text-sm">Still need help?</span>
              </div>
              <p className="text-xs text-gray-600 mb-3">Our support team is here to assist you.</p>
              <a href="mailto:support@ariaba.app">
                <Button size="sm" className="w-full bg-teal-600 hover:bg-teal-700">
                  Contact Support
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-72">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b p-4 flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold truncate">{article.title}</span>
        </div>

        {/* Article content */}
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2 flex-wrap">
            <Link href="/help" className="hover:text-teal-600">
              Help Center
            </Link>
            <span>/</span>
            <span className="text-gray-700">{category.name}</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">{article.title}</span>
            {article.isNew && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 ml-2">
                NEW
              </Badge>
            )}
          </nav>

          {/* Article */}
          <article className="prose prose-gray prose-headings:text-gray-900 prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-3xl font-bold mb-6">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-semibold mt-8 mb-4">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-medium mt-6 mb-3">{children}</h3>,
                p: ({ children }) => <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
                li: ({ children }) => <li className="text-gray-700">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                table: ({ children }) => (
                  <div className="overflow-x-auto mb-6">
                    <table className="min-w-full border border-gray-200 rounded-lg">{children}</table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-2 bg-gray-50 text-left text-sm font-medium text-gray-700 border-b">
                    {children}
                  </th>
                ),
                td: ({ children }) => <td className="px-4 py-2 text-sm text-gray-600 border-b">{children}</td>,
              }}
            >
              {article.content}
            </ReactMarkdown>
          </article>

          {/* Feedback section */}
          <div className="mt-12 pt-8 border-t">
            <p className="text-sm text-gray-600 mb-3">Was this article helpful?</p>
            {feedbackGiven ? (
              <p className="text-sm text-teal-600 font-medium">Thank you for your feedback!</p>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleFeedback(true)}>
                  <ThumbsUp className="h-4 w-4 mr-1" /> Yes
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleFeedback(false)}>
                  <ThumbsDown className="h-4 w-4 mr-1" /> No
                </Button>
              </div>
            )}
          </div>

          {/* Prev/Next navigation */}
          <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between gap-4">
            {navigation.prev ? (
              <Link
                href={`/help/${navigation.prev.category}/${navigation.prev.article}`}
                className="flex items-center gap-2 text-gray-600 hover:text-teal-600 group"
              >
                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <div className="text-left">
                  <div className="text-xs text-gray-400">Previous</div>
                  <div className="text-sm font-medium">{navigation.prev.title}</div>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {navigation.next ? (
              <Link
                href={`/help/${navigation.next.category}/${navigation.next.article}`}
                className="flex items-center gap-2 text-gray-600 hover:text-teal-600 group text-right"
              >
                <div>
                  <div className="text-xs text-gray-400">Next</div>
                  <div className="text-sm font-medium">{navigation.next.title}</div>
                </div>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="p-6 lg:p-8 border-t bg-white text-center text-sm text-gray-500">
          <p>
            Can&apos;t find what you&apos;re looking for?{" "}
            <a href="mailto:support@ariaba.app" className="text-teal-600 hover:underline">
              Contact our support team
            </a>
          </p>
        </footer>
      </main>
    </div>
  )
}

export default function ArticlePage() {
  return (
    <Suspense fallback={null}>
      <ArticleContent />
    </Suspense>
  )
}
