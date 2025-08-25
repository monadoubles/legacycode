'use client';

import { cn } from '@/lib/utils';

interface HeatmapProps {
  data: Array<{
    x: number;
    y: number;
    value: number;
    label?: string;
  }>;
  width?: number;
  height?: number;
  className?: string;
  cellSize?: number;
}

export function Heatmap({ 
  data, 
  width = 400, 
  height = 300, 
  className, 
  cellSize = 20 
}: HeatmapProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  
  const getColor = (value: number) => {
    const normalized = (value - minValue) / (maxValue - minValue);
    
    if (normalized < 0.25) return 'bg-green-200 dark:bg-green-900';
    if (normalized < 0.5) return 'bg-yellow-200 dark:bg-yellow-900'; 
    if (normalized < 0.75) return 'bg-orange-200 dark:bg-orange-900';
    return 'bg-red-200 dark:bg-red-900';
  };

  const getIntensity = (value: number) => {
    const normalized = (value - minValue) / (maxValue - minValue);
    return Math.max(0.1, normalized);
  };

  return (
    <div className={cn("inline-block", className)}>
      <svg width={width} height={height} className="border rounded">
        {data.map((cell, index) => (
          <g key={index}>
            <rect
              x={cell.x * cellSize}
              y={cell.y * cellSize}
              width={cellSize - 1}
              height={cellSize - 1}
              className={getColor(cell.value)}
              style={{ opacity: getIntensity(cell.value) }}
            />
            {cell.label && (
              <text
                x={cell.x * cellSize + cellSize / 2}
                y={cell.y * cellSize + cellSize / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-foreground"
              >
                {cell.label}
              </text>
            )}
          </g>
        ))}
      </svg>
      
      {/* Legend */}
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>Low</span>
        <div className="flex space-x-1">
          <div className="w-4 h-4 bg-green-200 dark:bg-green-900 rounded"></div>
          <div className="w-4 h-4 bg-yellow-200 dark:bg-yellow-900 rounded"></div>
          <div className="w-4 h-4 bg-orange-200 dark:bg-orange-900 rounded"></div>
          <div className="w-4 h-4 bg-red-200 dark:bg-red-900 rounded"></div>
        </div>
        <span>High</span>
      </div>
    </div>
  );
}
