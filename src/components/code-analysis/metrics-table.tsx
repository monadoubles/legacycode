'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ComplexityMeter } from './complexity-meter';

interface Metric {
  name: string;
  value: number;
  maxValue?: number;
  unit?: string;
  level?: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
}

interface MetricsTableProps {
  metrics: Metric[];
  title?: string;
  className?: string;
}

export function MetricsTable({ metrics, title = "Code Metrics", className }: MetricsTableProps) {
  const formatValue = (value: number, unit?: string) => {
    if (unit === 'percentage') {
      return `${value.toFixed(1)}%`;
    }
    if (unit === 'decimal') {
      return value.toFixed(2);
    }
    return value.toString();
  };

  const getMetricLevel = (metric: Metric): 'low' | 'medium' | 'high' | 'critical' => {
    if (metric.level) return metric.level;
    
    // Auto-determine level based on value and metric type
    if (metric.name.toLowerCase().includes('complexity')) {
      if (metric.value <= 5) return 'low';
      if (metric.value <= 10) return 'medium';
      if (metric.value <= 20) return 'high';
      return 'critical';
    }
    
    if (metric.name.toLowerCase().includes('depth')) {
      if (metric.value <= 3) return 'low';
      if (metric.value <= 5) return 'medium';
      if (metric.value <= 8) return 'high';
      return 'critical';
    }
    
    if (metric.name.toLowerCase().includes('maintainability')) {
      if (metric.value >= 80) return 'low';
      if (metric.value >= 60) return 'medium';
      if (metric.value >= 40) return 'high';
      return 'critical';
    }
    
    return 'low';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {metrics.map((metric, index) => {
            const level = getMetricLevel(metric);
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{metric.name}</h4>
                    {metric.description && (
                      <p className="text-sm text-muted-foreground">
                        {metric.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      {formatValue(metric.value, metric.unit)}
                    </div>
                  </div>
                </div>
                
                {metric.maxValue && (
                  <ComplexityMeter
                    value={metric.value}
                    maxValue={metric.maxValue}
                    level={level}
                    showValue={false}
                  />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
