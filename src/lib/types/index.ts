// Core type definitions for the application

export interface FileMetrics {
  linesOfCode: number;
  codeLines: number;
  commentLines: number;
  blankLines: number;
  cyclomaticComplexity: number;
  nestingDepth: number;
  maintainabilityIndex: number;
  functionCount: number;
  classCount: number;
  loopCount: number;
  conditionalCount: number;
  sqlJoinCount: number;
  dependencyCount: number;
  complexityLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
}

export interface AnalysisResult {
  fileId: string;
  filename: string;
  technologyType: 'perl' | 'tibco' | 'pentaho';
  metrics: FileMetrics;
  suggestions: Suggestion[];
  analyzedAt: Date;
}

export interface Suggestion {
  id: string;
  type: 'refactor' | 'security' | 'performance' | 'maintainability';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  suggestedFix?: string;
  lineNumber?: number;
}

export interface DashboardStats {
  totalFiles: number;
  analyzedFiles: number;
  highComplexityFiles: number;
  averageComplexity: number;
  securityIssues: number;
  processingFiles: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface TechnologyBreakdown {
  perl: number;
  tibco: number;
  pentaho: number;
  other: number;
}
