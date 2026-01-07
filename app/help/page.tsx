"use client"

import type React from "react"
import { Suspense } from "react"
import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Search,
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
  ExternalLink,
} from "lucide-react"
import { helpCategories, searchArticles, popularArticles, getArticle } from "@/lib/help-center-data"

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

function HelpCenterContent() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    return searchArticles(searchQuery).slice(0, 8)
  }, [searchQuery])

  const popularArticleData = useMemo(() => {
    return popularArticles
      .map(({ categorySlug, articleSlug }) => {
        const data = getArticle(categorySlug, articleSlug)
        return data ? { ...data, categorySlug, articleSlug } : null
      })
      .filter(Boolean)
  }, [])

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
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-teal-600" />
            Help Center
          </h2>

          <Accordion type="multiple" className="space-y-1">
            {helpCategories.map((category) => (
              <AccordionItem key={category.id} value={category.id} className="border-none">
                <AccordionTrigger className="text-sm font-medium py-2 hover:no-underline hover:bg-gray-50 px-2 rounded">
                  <span className="flex items-center gap-2">
                    {iconMap[category.icon]}
                    {category.name}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  <ul className="space-y-0.5 pl-6 py-1">
                    {category.articles.map((article) => (
                      <li key={article.slug}>
                        <Link
                          href={`/help/${category.slug}/${article.slug}`}
                          className="text-sm text-gray-600 hover:text-teal-600 block py-1.5 px-2 rounded hover:bg-gray-50 flex items-center gap-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {article.title}
                          {article.isNew && (
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
          <span className="font-semibold">Help Center</span>
        </div>

        {/* Search header */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-8 lg:p-12">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">How can we help?</h1>
            <p className="text-lg opacity-90 mb-6">Search our knowledge base or browse categories below</p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-lg bg-white text-gray-900 border-0 shadow-lg"
              />

              {/* Search results dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border max-h-80 overflow-y-auto z-10">
                  {searchResults.map(({ category, article }) => (
                    <Link
                      key={`${category.slug}-${article.slug}`}
                      href={`/help/${category.slug}/${article.slug}`}
                      className="block p-3 hover:bg-gray-50 border-b last:border-b-0"
                      onClick={() => setSearchQuery("")}
                    >
                      <div className="font-medium text-gray-900 text-sm">{article.title}</div>
                      <div className="text-xs text-gray-500">{category.name}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Popular articles */}
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Popular Articles</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularArticleData.map((data: any) => (
              <Link
                key={`${data.categorySlug}-${data.articleSlug}`}
                href={`/help/${data.categorySlug}/${data.articleSlug}`}
              >
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 text-teal-600 mb-1">
                      {iconMap[data.category.icon]}
                      <span className="text-xs font-medium">{data.category.name}</span>
                    </div>
                    <CardTitle className="text-base group-hover:text-teal-600 transition-colors">
                      {data.article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm line-clamp-2">
                      {data.article.content
                        .split("\n")
                        .find((line: string) => line.trim() && !line.startsWith("#"))
                        ?.trim() || ""}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Browse by category */}
        <div className="p-6 lg:p-8 max-w-5xl mx-auto border-t">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Browse by Category</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {helpCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600">
                      {iconMap[category.icon]}
                    </div>
                    <div>
                      <CardTitle className="text-base">{category.name}</CardTitle>
                      <CardDescription className="text-xs">{category.articles.length} articles</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1">
                    {category.articles.slice(0, 3).map((article) => (
                      <li key={article.slug}>
                        <Link
                          href={`/help/${category.slug}/${article.slug}`}
                          className="text-sm text-gray-600 hover:text-teal-600 flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {article.title}
                          {article.isNew && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] bg-green-100 text-green-700 px-1 py-0 ml-1"
                            >
                              NEW
                            </Badge>
                          )}
                        </Link>
                      </li>
                    ))}
                    {category.articles.length > 3 && (
                      <li className="text-xs text-gray-400 pt-1">+{category.articles.length - 3} more articles</li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            ))}
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

export default function HelpCenterPage() {
  return (
    <Suspense fallback={null}>
      <HelpCenterContent />
    </Suspense>
  )
}
