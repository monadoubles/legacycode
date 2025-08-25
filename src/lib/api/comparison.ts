'use server';

export interface ReportBasicInfo {
  id: string;
  name: string;
  version: string;
  createdAt: string;
  generatedAt: string;
  generatedBy: string;
}

export interface ReportMetrics {
  totalFiles: number;
  totalLinesOfCode: number;
  averageComplexity: number;
  highComplexityFiles: number;
}

export interface ReportDistributions {
  technology: Record<string, any>;
  complexity: Record<string, any>;
}

export interface ReportDetail {
  id: string;
  name: string;
  version: string;
  metrics: ReportMetrics;
  distributions: ReportDistributions;
  summary: string;
  createdAt: string;
  generatedAt: string;
  generatedBy: string;
}

export interface ComparisonResponse {
  success: boolean;
  type: 'files' | 'reports' | 'timeframes';
  data: {
    reports: ReportDetail[];
    insights: {
      type: string;
      title: string;
      description: string;
    }[];
    chartData: {
      metrics: {
        name: string;
        totalFiles: number;
        avgComplexity: number;
        highComplexityFiles: number;
      }[];
    };
  };
  comparedItems: number;
  timestamp: string;
  error?: string;
}

export async function fetchReportsList(): Promise<ReportBasicInfo[]> {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : '';
      
    const url = `${baseUrl}/api/reports`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch reports: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch reports');
    }

    return result.reports;
  } catch (error) {
    console.error('Error fetching reports list:', error);
    throw error;
  }
}

export async function compareReports(reportIds: string[]): Promise<ComparisonResponse> {
  try {
    if (!reportIds || reportIds.length < 2) {
      throw new Error('At least 2 report IDs are required for comparison');
    }

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : '';
      
    const url = `${baseUrl}/api/comparision`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'reports',
        items: reportIds
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to compare reports: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to compare reports');
    }

    return result;
  } catch (error) {
    console.error('Error comparing reports:', error);
    throw error;
  }
}
