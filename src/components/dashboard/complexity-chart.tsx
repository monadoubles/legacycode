'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ComplexityChartProps {
  data?: Array<{
    name: string;
    value: number;
  }>;
  variant?: 'complexity' | 'risk';
}

export function ComplexityChart({ data, variant = 'complexity' }: ComplexityChartProps) {
  // Mock data if none provided
  const chartData = data ? data.map(item => ({
    ...item,
    color: getColorForItem(item.name, variant)
  })) : [
    { name: 'Low', value: 0, color: '#10B981' },
    { name: 'Medium', value: 0, color: '#F59E0B' },
    { name: 'High', value: 0, color: '#EF4444' },
  ];

  // Helper function to assign colors based on category name
  function getColorForItem(name: string, type: string): string {
    const lowerName = name.toLowerCase();

    if (type === 'risk') {
      if (lowerName.includes('low')) return '#10B981';
      if (lowerName.includes('medium')) return '#F59E0B';
      if (lowerName.includes('high')) return '#EF4444';
      if (lowerName.includes('critical')) return '#991B1B';
      return '#6B7280'; // Default gray
    }

    // Default complexity colors
    if (lowerName.includes('low')) return '#10B981';
    if (lowerName.includes('medium')) return '#F59E0B';
    if (lowerName.includes('high')) return '#EF4444';
    return '#6B7280'; // Default gray
  }

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{variant === 'risk' ? 'Risk Distribution' : 'Complexity Distribution'}</CardTitle>
        <CardDescription>
          Files categorized by {variant === 'risk' ? 'risk' : 'complexity'} level
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Simple bar chart representation */}
          {chartData.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value} files ({percentage}%)</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: item.color 
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <div className="text-center text-sm text-muted-foreground">
            Total: {total} files analyzed
          </div>
        </div>
      </CardContent>
    </Card>
  );
}