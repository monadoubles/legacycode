// File-related type definitions

export interface FileUpload {
  id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  encoding: string;
  buffer?: Buffer;
  path?: string;
  uploadedAt: Date;
}

export interface FileValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metadata: {
    detectedType: string;
    encoding: string;
    hasSecurityIssues: boolean;
    estimatedAnalysisTime: number;
  };
}

export interface FileMetadata {
  id: string;
  filename: string;
  originalPath: string;
  relativePath: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  encoding: string;
  contentHash: string;
  technology: 'perl' | 'tibco' | 'pentaho' | 'unknown';
  detectedLanguage?: string;
  lineCount?: number;
  characterCount?: number;
  uploadedBy: string;
  uploadedAt: Date;
  lastModified?: Date;
  tags: string[];
  description?: string;
  isArchived: boolean;
  parentBatch?: string;
}

export interface FileContent {
  id: string;
  fileId: string;
  content: string;
  contentType: 'text' | 'binary';
  compressed: boolean;
  encrypted: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileAccess {
  id: string;
  fileId: string;
  userId: string;
  action: 'view' | 'download' | 'analyze' | 'edit' | 'delete';
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
}

export interface FileVersion {
  id: string;
  fileId: string;
  version: number;
  contentHash: string;
  changes: string[];
  uploadedBy: string;
  uploadedAt: Date;
  isActive: boolean;
  previousVersionId?: string;
}

export interface FileBatch {
  id: string;
  name: string;
  description?: string;
  fileIds: string[];
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  uploadedBy: string;
  uploadedAt: Date;
  completedAt?: Date;
  totalFiles: number;
  processedFiles: number;
  failedFiles: number;
  totalSize: number;
  processingProgress: number;
}

export interface FileStatistics {
  totalFiles: number;
  totalSize: number;
  byType: Record<string, number>;
  byTechnology: Record<string, number>;
  uploadTrend: {
    date: string;
    count: number;
    size: number;
  }[];
  analysisTrend: {
    date: string;
    analyzed: number;
    failed: number;
  }[];
}

export interface FileExport {
  id: string;
  fileIds: string[];
  format: 'zip' | 'tar' | 'csv' | 'json' | 'pdf';
  includeAnalysis: boolean;
  includeReports: boolean;
  status: 'preparing' | 'ready' | 'expired' | 'failed';
  downloadUrl?: string;
  expiresAt?: Date;
  createdBy: string;
  createdAt: Date;
}

export interface FileSearch {
  query: string;
  filters: {
    fileType?: string[];
    technology?: string[];
    uploadDateRange?: {
      start: Date;
      end: Date;
    };
    sizeRange?: {
      min: number;
      max: number;
    };
    complexity?: string[];
    hasIssues?: boolean;
    tags?: string[];
    uploadedBy?: string[];
  };
  sort: {
    field: 'name' | 'size' | 'uploadDate' | 'complexity' | 'riskScore';
    direction: 'asc' | 'desc';
  };
  pagination: {
    page: number;
    limit: number;
  };
}

export interface FileSearchResult {
  files: FileMetadata[];
  total: number;
  page: number;
  pages: number;
  aggregations: {
    byType: Record<string, number>;
    byTechnology: Record<string, number>;
    complexityDistribution: Record<string, number>;
  };
  searchTime: number;
}
