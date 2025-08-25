import { Suspense } from 'react';
import { ComplexityChart } from '@/components/dashboard/complexity-chart';
import { TechnologyDistribution } from '@/components/dashboard/technology-distribution';
import { FileList } from '@/components/dashboard/file-list';
import { FilterPanel } from '@/components/dashboard/filter-panel';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { DashboardData } from '@/lib/api/dashboard';
import { NextRequest } from 'next/server';

// Direct import from API route
import { GET } from '@/app/api/dashboard/route';

export default async function DashboardPage() {
  // Fetch real dashboard data directly from API route handler
  const mockRequest = new NextRequest('http://localhost/api/dashboard');
  const response = await GET(mockRequest);
  const responseData = await response.json();
  
  // Extract dashboard data from response
  const dashboardData: DashboardData = responseData.data;
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Analysis Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your legacy code analysis results and insights
        </p>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>}>
        <StatsCards data={dashboardData.stats} />
      </Suspense>

      {/* Recent Files */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Analysis Results</CardTitle>
          <CardDescription>
            Latest files that have been analyzed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoadingSpinner />}>
            <FileList files={dashboardData.recentActivity} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
