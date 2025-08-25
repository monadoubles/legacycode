'use client';

import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ComplexityMeterProps {
  value: number;
  maxValue?: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  label?: string;
  showValue?: boolean;
  className?: string;
}

export function ComplexityMeter({ 
  value, 
  maxValue = 100, 
  level, 
  label, 
  showValue = true, 
  className 
}: ComplexityMeterProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  const getColorClass = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      case 'critical': return 'text-red-800';
      default: return 'text-gray-600';
    }
  };

  const getBadgeVariant = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'medium': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'high': return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'critical': return 'bg-red-200 text-red-900 hover:bg-red-200';
      default: return 'secondary';
    }
  };

  const getProgressColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      case 'critical': return 'bg-red-700';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        {label && (
          <span className="text-sm font-medium">{label}</span>
        )}
        <div className="flex items-center space-x-2">
          {showValue && (
            <span className={cn("text-sm font-semibold", getColorClass(level))}>
              {value}
            </span>
          )}
          <Badge className={getBadgeVariant(level)}>
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </Badge>
        </div>
      </div>
      
      <div className="relative">
        <Progress value={percentage} className="h-2" />
        <div 
          className={cn("absolute top-0 left-0 h-2 rounded-full transition-all", getProgressColor(level))}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0</span>
        <span>{maxValue}</span>
      </div>
    </div>
  );
}
