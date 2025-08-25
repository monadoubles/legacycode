// Metrics and measurement type definitions

export interface QualityMetrics {
  maintainabilityIndex: number;
  technicalDebtRatio: number;
  codeComplexity: number;
  testCoverage: number;
  documentationCoverage: number;
  codeSmellCount: number;
  duplicatedLineRatio: number;
  violationDensity: number;
}

export interface SecurityMetrics {
  vulnerabilityCount: number;
  securityHotspotCount: number;
  securityRating: 'A' | 'B' | 'C' | 'D' | 'E';
  owaspRiskScore: number;
  cweCategories: string[];
  criticalVulnerabilities: number;
  highVulnerabilities: number;
  mediumVulnerabilities: number;
  lowVulnerabilities: number;
}

export interface PerformanceMetrics {
  cpuComplexity: number;
  memoryEfficiency: number;
  ioEfficiency: number;
  algorithmicComplexity: string; // O(n), O(n²), etc.
  performanceBottlenecks: number;
  resourceLeaks: number;
  optimizationOpportunities: number;
}

export interface DependencyMetrics {
  totalDependencies: number;
  directDependencies: number;
  transitiveDependencies: number;
  outdatedDependencies: number;
  vulnerableDependencies: number;
  circularDependencies: number;
  unusedDependencies: number;
  dependencyDepth: number;
  licenseIssues: number;
}

export interface TechnologyMetrics {
  languageDistribution: Record<string, number>;
  frameworkUsage: Record<string, number>;
  versionDistribution: Record<string, number>;
  deprecatedFeatures: number;
  modernizationScore: number;
  migrationComplexity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ProjectMetrics {
  totalFiles: number;
  totalLinesOfCode: number;
  codeFiles: number;
  testFiles: number;
  documentationFiles: number;
  configurationFiles: number;
  averageFileSize: number;
  largestFiles: Array<{ filename: string; size: number; }>;
  moduleCount: number;
  packageCount: number;
}

export interface TeamMetrics {
  activeContributors: number;
  commitFrequency: number;
  averageCommitSize: number;
  codeChurnRate: number;
  knowledgeDistribution: Record<string, number>;
  expertiseAreas: string[];
  collaborationIndex: number;
}

export interface TrendMetrics {
  timeframe: string;
  data: Array<{
    timestamp: Date;
    metrics: Partial<QualityMetrics & SecurityMetrics & PerformanceMetrics>;
  }>;
  trends: {
    improving: string[];
    degrading: string[];
    stable: string[];
  };
  forecasts: {
    nextMonth: Partial<QualityMetrics>;
    nextQuarter: Partial<QualityMetrics>;
  };
}

export interface BenchmarkMetrics {
  industry: string;
  technology: string;
  teamSize: string;
  projectType: string;
  benchmarks: {
    maintainabilityIndex: { value: number; percentile: number; };
    complexity: { value: number; percentile: number; };
    testCoverage: { value: number; percentile: number; };
    securityRating: { value: string; percentile: number; };
    performanceScore: { value: number; percentile: number; };
  };
  recommendations: string[];
}

export interface MetricThreshold {
  metric: string;
  operator: '>' | '<' | '=' | '>=' | '<=';
  value: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  recommendation?: string;
}

export interface MetricAlert {
  id: string;
  metricName: string;
  currentValue: number;
  thresholdValue: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  triggeredAt: Date;
  resolvedAt?: Date;
  isActive: boolean;
  affectedFiles: string[];
  recommendation: string;
}

export interface MetricsAggregation {
  period: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  aggregatedAt: Date;
  metrics: {
    quality: QualityMetrics;
    security: SecurityMetrics;
    performance: PerformanceMetrics;
    dependencies: DependencyMetrics;
    technology: TechnologyMetrics;
    project: ProjectMetrics;
  };
  comparisonToPrevious: {
    quality: Partial<QualityMetrics>;
    security: Partial<SecurityMetrics>;
    performance: Partial<PerformanceMetrics>;
  };
}
