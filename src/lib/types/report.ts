// Report-related type definitions

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'quality' | 'performance' | 'compliance' | 'executive' | 'technical';
  sections: ReportSection[];
  filters: ReportFilter[];
  formats: ReportFormat[];
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  version: string;
  tags: string[];
}

export interface ReportSection {
  id: string;
  title: string;
  description?: string;
  type: 'summary' | 'chart' | 'table' | 'list' | 'metrics' | 'text' | 'comparison';
  configuration: {
    dataSource: string;
    chartType?: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'treemap';
    columns?: string[];
    groupBy?: string;
    aggregation?: 'sum' | 'average' | 'count' | 'max' | 'min';
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
  order: number;
  isVisible: boolean;
}

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'between' | 'exists';
  value: any;
  label: string;
  required: boolean;
}

export interface ReportFormat {
  type: 'pdf' | 'html' | 'csv' | 'json' | 'xlsx' | 'pptx';
  enabled: boolean;
  configuration?: {
    includeCharts?: boolean;
    includeRawData?: boolean;
    pageSize?: 'A4' | 'Letter' | 'Legal';
    orientation?: 'portrait' | 'landscape';
    template?: string;
  };
}

export interface GeneratedReport {
  id: string;
  templateId: string;
  name: string;
  description?: string;
  parameters: Record<string, any>;
  status: 'generating' | 'completed' | 'failed' | 'cancelled';
  formats: Array<{
    type: ReportFormat['type'];
    url?: string;
    size?: number;
    generatedAt?: Date;
  }>;
  data?: ReportData;
  error?: string;
  generatedBy: string;
  generatedAt: Date;
  expiresAt?: Date;
  isShared: boolean;
  shareUrl?: string;
  downloadCount: number;
}

export interface ReportData {
  summary: {
    totalFiles: number;
    analyzedFiles: number;
    timeRange: {
      start: Date;
      end: Date;
    };
    metrics: {
      averageComplexity: number;
      highRiskFiles: number;
      securityIssues: number;
      performanceIssues: number;
      technicalDebtHours: number;
    };
  };
  sections: Array<{
    id: string;
    title: string;
    type: ReportSection['type'];
    data?: any;
    chart?: {
      type: string;
      data?: any[];
      options?: any;
    };
  }>;
  recommendations?: string[];
  appendices?: Array<{
    title: string;
    content: string;
    type: 'text' | 'table' | 'list';
  }>;
}

export interface ReportSchedule {
  id: string;
  templateId: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  cronExpression: string;
  parameters: Record<string, any>;
  recipients: Array<{
    type: 'email' | 'webhook' | 'slack';
    address: string;
    name?: string;
  }>;
  formats: ReportFormat['type'][];
  isActive: boolean;
  nextRunAt?: Date;
  lastRunAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportExecution {
  id: string;
  scheduleId?: string;
  templateId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  parameters: Record<string, any>;
  resultId?: string;
  error?: string;
  triggeredBy: 'manual' | 'schedule' | 'api';
  executedBy: string;
}

export interface ReportComparison {
  id: string;
  baseReportId: string;
  compareReportId: string;
  comparisonType: 'period' | 'version' | 'branch' | 'custom';
  results: {
    summary: {
      improvements: string[];
      regressions: string[];
      unchanged: string[];
    };
    metrics: {
      [key: string]: {
        baseline: number;
        current: number;
        change: number;
        changePercent: number;
        trend: 'improving' | 'degrading' | 'stable';
      };
    };
    details: Array<{
      category: string;
      changes: Array<{
        type: 'added' | 'removed' | 'changed';
        description: string;
        impact: 'positive' | 'negative' | 'neutral';
      }>;
    }>;
  };
  createdBy: string;
  createdAt: Date;
}

export interface ReportAnalytics {
  reportId: string;
  views: number;
  downloads: number;
  shares: number;
  lastViewedAt?: Date;
  viewsByFormat: Record<ReportFormat['type'], number>;
  geographicDistribution: Record<string, number>;
  userSegments: Record<string, number>;
  performanceMetrics: {
    generationTime: number;
    averageLoadTime: number;
    errorRate: number;
  };
}

export interface ReportComment {
  id: string;
  reportId: string;
  userId: string;
  userName: string;
  content: string;
  type: 'comment' | 'question' | 'suggestion' | 'issue';
  status?: 'open' | 'resolved' | 'dismissed';
  parentId?: string; // For threaded comments
  attachments?: string[];
  createdAt: Date;
  updatedAt?: Date;
}
