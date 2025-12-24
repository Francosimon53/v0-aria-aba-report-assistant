"use client"

import { useMemo } from "react"
import type { ChartData } from "@/lib/types"

interface BarChartProps {
  data: ChartData
  height?: number
}

export function BarChart({ data, height = 300 }: BarChartProps) {
  const maxValue = useMemo(() => {
    return Math.max(...data.datasets.flatMap((dataset) => dataset.data))
  }, [data])

  const padding = 40
  const chartWidth = 800
  const chartHeight = height - padding * 2
  const barWidth = (chartWidth - padding * 2) / data.labels.length / data.datasets.length - 10

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

        {/* Bars */}
        {data.labels.map((label, labelIndex) => {
          const groupX = padding + ((chartWidth - padding * 2) * labelIndex) / data.labels.length

          return (
            <g key={labelIndex}>
              {data.datasets.map((dataset, datasetIndex) => {
                const value = dataset.data[labelIndex]
                const barHeight = (chartHeight * value) / maxValue
                const x = groupX + datasetIndex * (barWidth + 5)
                const y = padding + chartHeight - barHeight

                return (
                  <rect
                    key={datasetIndex}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={dataset.backgroundColor}
                    rx="2"
                  >
                    <title>
                      {dataset.label}: {value}
                    </title>
                  </rect>
                )
              })}
              {/* X-axis label */}
              <text
                x={groupX + (barWidth * data.datasets.length) / 2}
                y={height - 10}
                textAnchor="middle"
                fill="currentColor"
                className="text-muted-foreground"
              >
                {label}
              </text>
            </g>
          )
        })}

        {/* Legend */}
        <g transform={`translate(${padding}, ${padding - 20})`}>
          {data.datasets.map((dataset, i) => (
            <g key={i} transform={`translate(${i * 150}, 0)`}>
              <rect width="12" height="12" fill={dataset.backgroundColor} />
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
