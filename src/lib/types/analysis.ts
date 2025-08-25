// Analysis-related type definitions

export interface CodeMetrics {
  linesOfCode: number;
  codeLines: number;
  commentLines: number;
  blankLines: number;
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  nestingDepth: number;
  halsteadVolume: number;
  maintainabilityIndex: number;
  functionCount: number;
  classCount: number;
  loopCount: number;
  conditionalCount: number;
  sqlJoinCount: number;
  dependencyCount: number;
}

export interface SecurityIssue {
  id: string;
  type: 'vulnerability' | 'warning' | 'info';
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  location: {
    line: number;
    column?: number;
    file: string;
  };
  cwe?: string; // Common Weakness Enumeration
  cvss?: number; // Common Vulnerability Scoring System
  recommendation: string;
  references?: string[];
}

export interface PerformanceIssue {
  id: string;
  type: 'bottleneck' | 'inefficiency' | 'resource' | 'algorithm';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  location: {
    line: number;
    column?: number;
    file: string;
  };
  impact: {
    cpu?: number;
    memory?: number;
    io?: number;
    network?: number;
  };
  suggestion: string;
  estimatedImprovement?: string;
}

export interface RefactoringOpportunity {
  id: string;
  type: 'extract_method' | 'reduce_complexity' | 'eliminate_duplication' | 'improve_naming' | 'simplify_conditional';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  location: {
    startLine: number;
    endLine: number;
    file: string;
  };
  currentCode: string;
  suggestedCode?: string;
  benefits: string[];
  effort: 'low' | 'medium' | 'high';
}

export interface ModernizationSuggestion {
  id: string;
  category: 'framework' | 'language' | 'architecture' | 'tooling' | 'practices';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  currentTechnology: string;
  recommendedTechnology: string;
  migrationPath: {
    phases: string[];
    estimatedDuration: string;
    complexity: 'low' | 'medium' | 'high';
    riskLevel: 'low' | 'medium' | 'high';
  };
  benefits: string[];
  risks: string[];
  resources: string[];
}

export interface AnalysisResult {
  id: string;
  fileId: string;
  filename: string;
  technology: 'perl' | 'tibco' | 'pentaho' | 'generic';
  version: string;
  metrics: CodeMetrics;
  securityIssues: SecurityIssue[];
  performanceIssues: PerformanceIssue[];
  refactoringOpportunities: RefactoringOpportunity[];
  modernizationSuggestions: ModernizationSuggestion[];
  overallComplexity: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  qualityScore: number;
  technicalDebt: {
    score: number;
    category: 'low' | 'medium' | 'high' | 'critical';
    estimatedHours: number;
  };
  analyzedAt: Date;
  analyzerVersion: string;
  processingTime: number;
}

export interface AnalysisProgress {
  fileId: string;
  filename: string;
  status: 'queued' | 'analyzing' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  currentStep: string;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  estimatedTimeRemaining?: number;
}

export interface BatchAnalysisResult {
  batchId: string;
  fileIds: string[];
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  results: AnalysisResult[];
  summary: {
    totalFiles: number;
    analyzedFiles: number;
    failedFiles: number;
    averageComplexity: number;
    highRiskFiles: number;
    totalIssues: number;
    criticalIssues: number;
  };
  startedAt: Date;
  completedAt?: Date;
  processingTime?: number;
}

export interface AnalysisConfiguration {
  enableSecurityAnalysis: boolean;
  enablePerformanceAnalysis: boolean;
  enableRefactoringAnalysis: boolean;
  enableModernizationAnalysis: boolean;
  complexityThresholds: {
    low: number;
    medium: number;
    high: number;
  };
  aiEnabled: boolean;
  aiModel: string;
  customRules: AnalysisRule[];
}

export interface AnalysisRule {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'performance' | 'maintainability' | 'style';
  severity: 'error' | 'warning' | 'info';
  enabled: boolean;
  pattern: string;
  message: string;
  suggestion?: string;
  technologies: ('perl' | 'tibco' | 'pentaho' | 'all')[];
}

export interface ComparisonResult {
  id: string;
  baselineAnalysis: AnalysisResult;
  currentAnalysis: AnalysisResult;
  improvements: {
    complexity: number;
    securityIssues: number;
    performanceIssues: number;
    maintainabilityIndex: number;
  };
  regressions: {
    newIssues: (SecurityIssue | PerformanceIssue)[];
    degradedMetrics: string[];
  };
  recommendations: string[];
  comparedAt: Date;
}
