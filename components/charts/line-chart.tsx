"use client"

import { useMemo } from "react"
import type { ChartData } from "@/lib/types"

interface LineChartProps {
  data: ChartData
  height?: number
}

export function LineChart({ data, height = 300 }: LineChartProps) {
  const maxValue = useMemo(() => {
    return Math.max(...data.datasets.flatMap((dataset) => dataset.data))
  }, [data])

  const padding = 40
  const chartWidth = 800
  const chartHeight = height - padding * 2

  return (
    <div className="w-full overflow-x-auto">
      <svg width="100%" height={height} viewBox={`0 0 ${chartWidth} ${height}`} className="text-xs">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((percent) => {
          const y = padding + (chartHeight * (100 - percent)) / 100
          return (
            <g key={percent}>
              <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="currentColor" strokeOpacity="0.1" />
              <text x={padding - 10} y={y + 4} textAnchor="end" fill="currentColor" className="text-muted-foreground">
                {Math.round((maxValue * percent) / 100)}
              </text>
            </g>
          )
        })}

        {/* X-axis labels */}
        {data.labels.map((label, i) => {
          const x = padding + ((chartWidth - padding * 2) * i) / (data.labels.length - 1)
          return (
            <text
              key={i}
              x={x}
              y={height - 10}
              textAnchor="middle"
              fill="currentColor"
              className="text-muted-foreground"
            >
              {label}
            </text>
          )
        })}

        {/* Data lines */}
        {data.datasets.map((dataset, datasetIndex) => {
          const points = dataset.data.map((value, i) => {
            const x = padding + ((chartWidth - padding * 2) * i) / (data.labels.length - 1)
            const y = padding + chartHeight - (chartHeight * value) / maxValue
            return `${x},${y}`
          })

          return (
            <g key={datasetIndex}>
              {/* Line */}
              <polyline
                points={points.join(" ")}
                fill="none"
                stroke={dataset.borderColor}
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Points */}
              {dataset.data.map((value, i) => {
                const x = padding + ((chartWidth - padding * 2) * i) / (data.labels.length - 1)
                const y = padding + chartHeight - (chartHeight * value) / maxValue
                return (
                  <circle key={i} cx={x} cy={y} r="4" fill={dataset.borderColor}>
                    <title>
                      {dataset.label}: {value}
                    </title>
                  </circle>
                )
              })}
            </g>
          )
        })}

        {/* Legend */}
        <g transform={`translate(${padding}, ${padding - 20})`}>
          {data.datasets.map((dataset, i) => (
            <g key={i} transform={`translate(${i * 200}, 0)`}>
              <rect width="12" height="12" fill={dataset.borderColor} />
              <text x="18" y="10" fill="currentColor" className="text-xs">
                {dataset.label}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}
