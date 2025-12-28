"use client"

import { Card } from "@/components/ui/card"
import { CheckCircleIcon, InfoIcon } from "@/components/icons"
import type { AssessmentInsights } from "@/lib/assessment-data-aggregator"

interface AssessmentInsightsPanelProps {
  insights: AssessmentInsights
  context: "authorization" | "medical-necessity"
}

export function AssessmentInsightsPanel({ insights, context }: AssessmentInsightsPanelProps) {
  if (context === "authorization") {
    return (
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3 mb-4">
          <InfoIcon className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Assessment Summary</h3>
            <p className="text-sm text-blue-700">Key findings from your assessment to support this request</p>
          </div>
        </div>

        <div className="space-y-3">
          {insights.abcSummary.totalObservations > 0 && (
            <div className="text-sm">
              <span className="font-medium text-blue-900">Based on ABC data:</span>
              <span className="text-blue-700 ml-1">
                {insights.abcSummary.totalObservations} observation(s) documented
                {insights.abcSummary.primaryFunctions.length > 0 &&
                  ` with ${insights.abcSummary.primaryFunctions.join(" and ")} function(s) identified`}
                .
              </span>
            </div>
          )}

          {insights.domainsSummary.severeDomains.length > 0 && (
            <div className="text-sm">
              <span className="font-medium text-blue-900">Domains indicate:</span>
              <span className="text-blue-700 ml-1">
                Severe impairment in {insights.domainsSummary.severeDomains.join(", ")}.
              </span>
            </div>
          )}

          {insights.riskSummary.primaryConcerns.length > 0 && (
            <div className="text-sm">
              <span className="font-medium text-blue-900">Risk level:</span>
              <span className="text-blue-700 ml-1">
                {insights.riskSummary.riskLevel} – {insights.riskSummary.primaryConcerns.join(", ")} risk present.
              </span>
            </div>
          )}

          {insights.servicePlanSummary.totalWeeklyHours > 0 && (
            <div className="text-sm">
              <span className="font-medium text-blue-900">Recommended hours:</span>
              <span className="text-blue-700 ml-1">
                {insights.servicePlanSummary.totalWeeklyHours} hours/week ({insights.servicePlanSummary.intensity}{" "}
                intensity) aligns with severity and functional impact.
              </span>
            </div>
          )}
        </div>
      </Card>
    )
  }

  // Medical Necessity context
  return (
    <Card className="p-6 bg-green-50 border-green-200">
      <div className="flex items-start gap-3 mb-4">
        <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
        <div>
          <h3 className="font-semibold text-green-900 mb-1">Auto-Assembled Suggestions</h3>
          <p className="text-sm text-green-700">Content from previous steps to support medical necessity</p>
        </div>
      </div>

      <div className="space-y-4">
        {insights.domainsSummary.severeDomains.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-semibold text-green-800 uppercase tracking-wide">Functional Impairment</div>
            {insights.domainsSummary.severeDomains.map((domain, i) => (
              <div key={i} className="text-sm text-green-700 flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>{domain} domain: severe functional impairment documented.</span>
              </div>
            ))}
          </div>
        )}

        {insights.abcSummary.primaryFunctions.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-semibold text-green-800 uppercase tracking-wide">Behavioral Analysis</div>
            <div className="text-sm text-green-700 flex items-start gap-2">
              <span className="text-green-500 mt-1">•</span>
              <span>
                ABC episodes indicate {insights.abcSummary.primaryFunctions.join(" and ")}-maintained behavior patterns.
              </span>
            </div>
          </div>
        )}

        {insights.riskSummary.primaryConcerns.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-semibold text-green-800 uppercase tracking-wide">Safety Concerns</div>
            <div className="text-sm text-green-700 flex items-start gap-2">
              <span className="text-green-500 mt-1">•</span>
              <span>
                Risk assessment shows {insights.riskSummary.primaryConcerns.join(", ").toLowerCase()} concerns requiring{" "}
                {insights.riskSummary.supervisionRequired.toLowerCase()} supervision.
              </span>
            </div>
          </div>
        )}

        {Object.values(insights.goalsSummary).some((v) => v > 0) && (
          <div className="space-y-1">
            <div className="text-xs font-semibold text-green-800 uppercase tracking-wide">Treatment Goals</div>
            <div className="text-sm text-green-700 flex items-start gap-2">
              <span className="text-green-500 mt-1">•</span>
              <span>
                Goals target deficits across {Object.values(insights.goalsSummary).filter((v) => v > 0).length} domains
                (Communication, Social, Adaptive, Behavior Reduction).
              </span>
            </div>
          </div>
        )}

        {insights.servicePlanSummary.totalWeeklyHours > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-semibold text-green-800 uppercase tracking-wide">Service Intensity</div>
            <div className="text-sm text-green-700 flex items-start gap-2">
              <span className="text-green-500 mt-1">•</span>
              <span>
                Recommended dosage of {insights.servicePlanSummary.totalWeeklyHours} hours/week (
                {insights.servicePlanSummary.intensity} intensity) supports skill acquisition and generalization across
                settings.
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
