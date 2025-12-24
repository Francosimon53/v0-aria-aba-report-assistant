"use client"

import { cn } from "@/lib/utils"

interface SkeletonReportCardProps {
  delay?: number
}

export function SkeletonReportCard({ delay = 0 }: SkeletonReportCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      style={{
        animation: `fadeIn 0.4s ease-out ${delay}ms both`,
      }}
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full shimmer-effect" />

      {/* Header line (60% width) */}
      <div className="h-5 w-[60%] bg-gray-200 rounded-md mb-3" />

      {/* Subheader line (40% width) */}
      <div className="h-4 w-[40%] bg-gray-200 rounded-md mb-4" />

      {/* Body text lines */}
      <div className="space-y-2.5 mb-5">
        <div className="h-3.5 w-full bg-gray-200 rounded-md" />
        <div className="h-3.5 w-[90%] bg-gray-200 rounded-md" />
        <div className="h-3.5 w-[85%] bg-gray-200 rounded-md" />
      </div>

      {/* Badge placeholders at bottom */}
      <div className="flex gap-2 pt-2">
        <div className="h-6 w-20 bg-gray-200 rounded-full" />
        <div className="h-6 w-24 bg-gray-200 rounded-full" />
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .shimmer-effect {
          animation: shimmer 1.5s infinite linear;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.6) 50%,
            transparent 100%
          );
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}

interface SkeletonReportListProps {
  count?: number
  className?: string
}

export function SkeletonReportList({ count = 4, className }: SkeletonReportListProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonReportCard key={index} delay={index * 100} />
      ))}
    </div>
  )
}
