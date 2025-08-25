'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TechnologyData {
  name: string;
  value: number;
  avgComplexity: number;
}

interface TechnologyDistributionProps {
  data?: TechnologyData[];
}

export function TechnologyDistribution({ data }: TechnologyDistributionProps) {
  // Process API data or use empty array if none provided
  const rawData = data || [];

  // Calculate total files for percentage calculation
  const totalFiles = rawData.reduce((sum, tech) => sum + tech.value, 0);

  // Transform API data to component format
  const technologyData = rawData.map((tech, index) => {
    // Calculate percentage
    const percentage = totalFiles > 0 ? Math.round((tech.value / totalFiles) * 100) : 0;

    // Assign colors and icons based on technology name or index
    const colors = ['#39457E', '#FF6B35', '#4A90E2', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B'];
    const icons = ['📄', '🔧', '🔄', '📊', '📱', '🖥️', '📝', '🔍'];

    return {
      name: tech.name,
      files: tech.value,
      percentage,
      color: colors[index % colors.length],
      icon: getIconForTechnology(tech.name) || icons[index % icons.length],
      avgComplexity: tech.avgComplexity
    };
  });

  // Helper function to assign icons based on technology name
  function getIconForTechnology(name: string): string | null {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('perl')) return '🐪';
    if (lowerName.includes('java')) return '☕';
    if (lowerName.includes('python')) return '🐍';
    if (lowerName.includes('javascript') || lowerName.includes('js')) return '📜';
    if (lowerName.includes('typescript') || lowerName.includes('ts')) return '📘';
    if (lowerName.includes('c#') || lowerName.includes('csharp')) return '🔷';
    if (lowerName.includes('c++')) return '⚙️';
    if (lowerName.includes('ruby')) return '💎';
    if (lowerName.includes('php')) return '🐘';
    if (lowerName.includes('go')) return '🐹';
    if (lowerName.includes('rust')) return '🦀';
    if (lowerName.includes('swift')) return '🦅';
    if (lowerName.includes('kotlin')) return '🧩';
    if (lowerName.includes('tibco')) return '🔧';
    if (lowerName.includes('pentaho')) return '🔄';
    return null;
  }

  // Total files already calculated above

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technology Distribution</CardTitle>
        <CardDescription>
          Files breakdown by technology type
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Visual representation */}
          <div className="relative h-4 bg-muted rounded-full overflow-hidden">
            {technologyData.map((tech, index) => {
              const cumulativePercentage = technologyData
                .slice(0, index)
                .reduce((sum, t) => sum + t.percentage, 0);
                
              return (
                <div
                  key={tech.name}
                  className="absolute h-full transition-all duration-300"
                  style={{
                    backgroundColor: tech.color,
                    left: `${cumulativePercentage}%`,
                    width: `${tech.percentage}%`,
                  }}
                  title={`${tech.name}: ${tech.files} files (${tech.percentage}%)`}
                />
              );
            })}
          </div>

          {/* Legend and details */}
          <div className="space-y-3">
            {technologyData.map((tech) => (
              <div key={tech.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: tech.color }}
                    />
                    <span className="text-lg">{tech.icon}</span>
                    <span className="font-medium">{tech.name}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {tech.files} files
                  </span>
                  <Badge variant="secondary">
                    {tech.percentage}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Summary statistics */}
          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Files:</span>
              <span className="font-medium">{totalFiles}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Most Common:</span>
              <span className="font-medium">
                {technologyData[0]?.name} ({technologyData[0]?.percentage}%)
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Technologies:</span>
              <span className="font-medium">{technologyData.length} types</span>
            </div>
          </div>

          {/* Recommendations */}
          {technologyData.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
                Analysis Insights
              </h4>
              <p className="text-xs text-blue-800 dark:text-blue-300">
                {technologyData[0].name} files dominate your codebase ({technologyData[0].percentage}%). 
                Consider focusing modernization efforts on this technology first.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}