"use client"

import { Button } from "@/components/ui/button"
import { FileTextIcon, TargetIcon, SearchIcon, CheckCircle2Icon, PlusIcon } from "@/components/icons"

interface ReportReadyEmptyStateProps {
  completionChecks: { label: string; completed: boolean }[]
  onGenerate?: () => void
}

export function ReportReadyEmptyState({ completionChecks, onGenerate }: ReportReadyEmptyStateProps) {
  const allComplete = completionChecks.every((c) => c.completed)

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto animate-in fade-in duration-500">
      <div className="mb-6 rounded-full bg-gray-100 p-6">
        <FileTextIcon className="h-16 w-16 text-gray-400" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-foreground">Ready to Generate Your Report</h3>
      <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
        Complete all sections on the left to generate your insurance-compliant assessment report
      </p>

      {/* Checklist */}
      <div className="w-full space-y-3 mb-6">
        {completionChecks.map((check, index) => (
          <div
            key={check.label}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 animate-in slide-in-from-left duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {check.completed ? (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                <CheckCircle2Icon className="h-3 w-3 text-white" />
              </div>
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-gray-300 bg-transparent" />
            )}
            <span className={`text-sm ${check.completed ? "text-foreground font-medium" : "text-gray-400"}`}>
              {check.label}
            </span>
          </div>
        ))}
      </div>

      {onGenerate && allComplete && (
        <Button onClick={onGenerate} className="w-full max-w-xs">
          Generate Report
        </Button>
      )}

      <p className="mt-4 text-xs text-muted-foreground">⚡ Generation takes ~30 seconds</p>
    </div>
  )
}

interface NoGoalsEmptyStateProps {
  onBrowseGoals?: () => void
}

export function NoGoalsEmptyState({ onBrowseGoals }: NoGoalsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto animate-in fade-in duration-500">
      <div className="mb-6 rounded-full bg-gray-100 p-6">
        <TargetIcon className="h-16 w-16 text-gray-400" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-foreground">No goals selected</h3>
      <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
        Click on goals to add them to this assessment
      </p>

      {/* Empty circle placeholder */}
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50 animate-in zoom-in duration-300 delay-200">
        <PlusIcon className="h-8 w-8 text-gray-400" />
      </div>

      {onBrowseGoals && (
        <Button onClick={onBrowseGoals} className="gap-2">
          Browse Goal Bank
        </Button>
      )}
    </div>
  )
}

interface SearchNoResultsProps {
  searchQuery: string
  suggestions?: string[]
  onClearSearch?: () => void
}

export function SearchNoResults({ searchQuery, suggestions, onClearSearch }: SearchNoResultsProps) {
  const defaultSuggestions = ["communication", "behavior", "social skills"]

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto animate-in fade-in duration-500">
      <div className="mb-6 rounded-full bg-gray-100 p-6">
        <SearchIcon className="h-16 w-16 text-gray-400" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-foreground">No results found</h3>
      <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
        Try different search terms or browse by category
      </p>

      {searchQuery && (
        <p className="mb-6 text-sm text-muted-foreground">
          No matches for <span className="font-medium text-foreground">"{searchQuery}"</span>
        </p>
      )}

      {/* Suggestions */}
      <div className="w-full mb-6">
        <p className="text-xs text-muted-foreground mb-3">Try searching for:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {(suggestions || defaultSuggestions).map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              className="text-xs rounded-full bg-gray-50 hover:bg-gray-100 border-gray-200"
              onClick={() => {
                // This would trigger a search for the suggestion
                if (onClearSearch) onClearSearch()
              }}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>

      {onClearSearch && (
        <Button variant="ghost" onClick={onClearSearch} className="text-sm">
          Clear search
        </Button>
      )}
    </div>
  )
}
