'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Clock,
  Shield,
  Code,
  Bug
} from 'lucide-react';

interface StatsData {
  totalFiles: number;
  analyzedFiles: number;
  highComplexityFiles: number;
  averageComplexity: number;
  securityIssues: number;
  processingFiles: number;
  totalLinesOfCode: number;
  criticalIssues: number;
}

// Default values in case data is not provided
const defaultStats: StatsData = {
  totalFiles: 0,
  analyzedFiles: 0,
  highComplexityFiles: 0,
  averageComplexity: 0,
  securityIssues: 0,
  processingFiles: 0,
  totalLinesOfCode: 0,
  criticalIssues: 0,
};

interface StatsCardsProps {
  data?: Partial<StatsData>;
  loading?: boolean;
}

export function StatsCards({ data = defaultStats, loading = false }: StatsCardsProps) {
  const stats = { ...defaultStats, ...data };
  const completionRate = Math.round((stats.analyzedFiles / stats.totalFiles) * 100);
  const highComplexityRate = Math.round((stats.highComplexityFiles / stats.analyzedFiles) * 100);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Files */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Files</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalFiles.toLocaleString()}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>{stats.analyzedFiles} analyzed ({completionRate}%)</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1 mt-2">
            <div 
              className="bg-green-500 h-1 rounded-full transition-all duration-300" 
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* High Complexity Files */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">High Complexity</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.highComplexityFiles}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
            <Badge variant="secondary" className="text-xs px-1 py-0 bg-orange-100 text-orange-800">
              {highComplexityRate}%
            </Badge>
            <span>of analyzed files</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Requires immediate attention
          </p>
        </CardContent>
      </Card>

      {/* Average Complexity */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Complexity</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageComplexity.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {/* In a real app, we would calculate this from historical data */}
            <span className="text-muted-foreground">Current analysis</span>
          </div>
          <div className="mt-2">
            {stats.averageComplexity <= 5 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                Good
              </Badge>
            )}
            {stats.averageComplexity > 5 && stats.averageComplexity <= 10 && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                Moderate
              </Badge>
            )}
            {stats.averageComplexity > 10 && (
              <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                High
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Issues */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Security Issues</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.securityIssues}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
            <Clock className="h-3 w-3" />
            <span>{stats.processingFiles} files processing</span>
          </div>
          <div className="mt-2">
            {stats.securityIssues === 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                Secure
              </Badge>
            )}
            {stats.securityIssues > 0 && stats.securityIssues <= 5 && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                Attention Needed
              </Badge>
            )}
            {stats.securityIssues > 5 && (
              <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                Critical
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Total Lines of Code */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Lines</CardTitle>
          <Code className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalLinesOfCode.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Lines of code analyzed
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <div className="flex-1 bg-muted rounded-full h-1">
              <div className="bg-blue-500 h-1 rounded-full w-3/4" />
            </div>
            <span className="text-xs text-muted-foreground">75% code</span>
          </div>
        </CardContent>
      </Card>

      {/* Critical Issues */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
          <Bug className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-700">{stats.criticalIssues}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Require immediate fixes
          </div>
          <div className="mt-2">
            {stats.criticalIssues === 0 ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                No Critical Issues
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">
                Action Required
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Processing Status */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Processing</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.processingFiles}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Files in analysis queue
          </div>
          <div className="mt-2">
            {stats.processingFiles === 0 ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                All Complete
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                Processing...
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Maintainability Score */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Maintainability</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">78</div>
          <div className="text-xs text-muted-foreground mt-1">
            Overall maintainability index
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <div className="flex-1 bg-muted rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }} />
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
              Good
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Export individual stat card component for reuse
interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
  };
}

export function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  badge 
}: StatCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <div className="text-xs text-muted-foreground mt-1">
            {description}
          </div>
        )}
        {trend && (
          <div className="text-xs text-muted-foreground mt-1">
            <span className={trend.isPositive ? "text-green-600" : "text-red-600"}>
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span> from last analysis
          </div>
        )}
        {badge && (
          <div className="mt-2">
            <Badge 
              variant={badge.variant || 'secondary'} 
              className={`text-xs ${badge.className || ''}`}
            >
              {badge.text}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
