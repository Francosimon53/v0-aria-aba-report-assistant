"use client"

import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
  variant?: "text" | "card" | "circular" | "rectangular"
}

export function Skeleton({ className, variant = "rectangular" }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-muted",
        variant === "text" && "h-4 rounded",
        variant === "card" && "h-32 rounded-lg",
        variant === "circular" && "rounded-full",
        variant === "rectangular" && "rounded-md",
        className,
      )}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      <Skeleton className="h-5 w-1/3" variant="text" />
      <Skeleton className="h-4 w-full" variant="text" />
      <Skeleton className="h-4 w-2/3" variant="text" />
      <div className="pt-2">
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonAssessmentCard({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
      style={{
        animation: `skeletonFadeIn 0.5s ease-out ${delay}ms both`,
      }}
    >
      {/* Shimmer overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
        style={{
          animation: "skeletonShimmer 1.5s infinite linear",
          transform: "translateX(-100%)",
        }}
      />

      {/* Icon placeholder */}
      <div className="h-10 w-10 bg-gray-200 rounded-lg mb-4" />

      {/* Title */}
      <div className="h-5 w-3/4 bg-gray-200 rounded-md mb-2" />

      {/* Description */}
      <div className="space-y-2 mb-4">
        <div className="h-3 w-full bg-gray-200 rounded-md" />
        <div className="h-3 w-5/6 bg-gray-200 rounded-md" />
      </div>

      {/* Duration badge */}
      <div className="h-6 w-24 bg-gray-200 rounded-full" />

      <style jsx>{`
        @keyframes skeletonFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes skeletonShimmer {
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
