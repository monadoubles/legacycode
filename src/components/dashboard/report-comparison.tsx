'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ComparisonData {
  metric: string;
  value1: number;
  value2: number;
  unit?: string;
  format?: 'number' | 'percentage' | 'decimal';
}

interface ReportComparisonProps {
  report1?: {
    name: string;
    date: string;
  };
  report2?: {
    name: string;
    date: string;
  };
  data?: ComparisonData[];
}

export function ReportComparison({ report1, report2, data }: ReportComparisonProps) {
  // Mock data if none provided
  const defaultReport1 = report1 || {
    name: 'Previous Month',
    date: '2023-12-01',
  };

  const defaultReport2 = report2 || {
    name: 'Current Month',
    date: '2024-01-01',
  };

  const comparisonData = data || [
    { metric: 'Total Files', value1: 142, value2: 156, format: 'number' as const },
    { metric: 'High Complexity', value1: 28, value2: 23, format: 'number' as const },
    { metric: 'Average Complexity', value1: 8.1, value2: 7.3, format: 'decimal' as const },
    { metric: 'Risk Score', value1: 52, value2: 45, format: 'number' as const },
    { metric: 'Security Issues', value1: 12, value2: 8, format: 'number' as const },
  ];

  const formatValue = (value: number, format?: string) => {
    switch (format) {
      case 'percentage':
        return `${value}%`;
      case 'decimal':
        return value.toFixed(1);
      default:
        return value.toString();
    }
  };

  const calculateChange = (oldVal: number, newVal: number) => {
    const change = newVal - oldVal;
    const percentChange = oldVal !== 0 ? (change / oldVal) * 100 : 0;
    
    return {
      absolute: change,
      percentage: Math.abs(percentChange),
      isImprovement: change < 0, // Lower values are generally better for complexity metrics
      isNeutral: change === 0,
      isIncrease: change > 0,
    };
  };

  const getTrendIcon = (change: ReturnType<typeof calculateChange>) => {
    if (change.isNeutral) {
      return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
    
    if (change.isIncrease) {
      return <TrendingUp className="w-4 h-4 text-red-500" />;
    }
    
    return <TrendingDown className="w-4 h-4 text-green-500" />;
  };

  const getTrendColor = (change: ReturnType<typeof calculateChange>) => {
    if (change.isNeutral) return 'text-muted-foreground';
    if (change.isImprovement) return 'text-green-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Comparison</CardTitle>
        <CardDescription>
          Compare metrics between different time periods
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Report Headers */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <h4 className="font-medium">{defaultReport1.name}</h4>
              <p className="text-sm text-muted-foreground">
                {new Date(defaultReport1.date).toLocaleDateString()}
              </p>
            </div>
          </Card>
          
          <div className="flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-muted-foreground" />
          </div>
          
          <Card className="p-4">
            <div className="text-center">
              <h4 className="font-medium">{defaultReport2.name}</h4>
              <p className="text-sm text-muted-foreground">
                {new Date(defaultReport2.date).toLocaleDateString()}
              </p>
            </div>
          </Card>
        </div>

        {/* Comparison Data */}
        <div className="space-y-4">
          {comparisonData.map((item, index) => {
            const change = calculateChange(item.value1, item.value2);
            
            return (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{item.metric}</h4>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-lg font-medium">
                      {formatValue(item.value1, item.format)}
                    </div>
                    <div className="text-xs text-muted-foreground">Before</div>
                  </div>
                  
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  
                  <div className="text-center">
                    <div className="text-lg font-medium">
                      {formatValue(item.value2, item.format)}
                    </div>
                    <div className="text-xs text-muted-foreground">After</div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(change)}
                    <div className={`text-sm font-medium ${getTrendColor(change)}`}>
                      {change.isNeutral ? (
                        'No change'
                      ) : (
                        <>
                          {change.isIncrease ? '+' : ''}
                          {change.absolute} ({change.percentage.toFixed(1)}%)
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Summary</h4>
          <div className="text-sm text-muted-foreground">
            {comparisonData.filter(item => calculateChange(item.value1, item.value2).isImprovement).length} metrics improved, {' '}
            {comparisonData.filter(item => calculateChange(item.value1, item.value2).isIncrease).length} metrics increased, {' '}
            {comparisonData.filter(item => calculateChange(item.value1, item.value2).isNeutral).length} metrics unchanged
          </div>
        </div>
      </CardContent>
    </Card>
  );
}