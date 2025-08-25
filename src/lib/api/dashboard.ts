'use server';

export interface DashboardData {
  stats: {
    totalFiles: number;
    analyzedFiles: number;
    highComplexityFiles: number;
    averageComplexity: number;
    securityIssues: number;
    processingFiles: number;
    totalLinesOfCode: number;
    criticalIssues: number;
  };
  charts: {
    technologyDistribution: {
      name: string;
      value: number;
      avgComplexity: number;
    }[];
    complexityDistribution: {
      name: string;
      value: number;
    }[];
    trendData: {
      date: string;
      analyses: number;
    }[];
  };
  recentActivity: {
    id: string;
    filename: string;
    fileType: string;
    analyzedAt: string;
    complexityLevel: string;
    linesOfCode: number;
  }[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
  error?: string;
}

export async function fetchDashboardData(timeRange: string = '30'): Promise<DashboardData> {
  try {
    // Create absolute URL for server-side fetching
    // This handles both client-side and server-side rendering
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : '';
      
    const url = `${baseUrl}/api/dashboard?timeRange=${timeRange}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Don't cache this data
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard data: ${response.status}`);
    }

    const result: DashboardResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch dashboard data');
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}
