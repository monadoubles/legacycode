// Base types for our database models
export interface File {
  id: string;
  filename: string;
  originalPath: string;
  relativePath: string | null;
  fileSize: number;
  fileType: string;
  contentHash: string | null;
  status: 'uploaded' | 'processing' | 'analyzed' | 'failed';
  uploadedBy: string | null;
  isArchived: boolean;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  mimeType: string | null;
  metadata: Record<string, any> | null;
}

export interface Analysis {
  id: string;
  fileId: string;
  linesOfCode: number;
  codeLines: number;
  commentLines: number;
  blankLines: number;
  cyclomaticComplexity: number;
  nestingDepth: number;
  maintainabilityIndex: number;
  complexityLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  technologyType: string;
  technology: string;
  language: string;
  functionCount: number;
  classCount: number;
  importCount: number;
  dependencyCount: number;
  analyzedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any> | null;
}

export interface Report {
  id: string;
  name: string;
  description?: string;
  fileIds: string[];
  status: 'generating' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface Suggestion {
  id: string;
  analysisId: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  title: string;
  description: string;
  explanation: string | null;
  codeSnippet: string | null;
  suggestedFix: string | null;
  modernizationApproach: string | null;
  impactScore: number | null;
  effortEstimate: string | null;
  aiModel: string | null;
  aiConfidence: number | null;
  startLine: number | null;
  endLine: number | null;
  startColumn: number | null;
  endColumn: number | null;
  metadata: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any; // Index signature for dynamic property access
}

// Database client types
export type Database = {
  files: {
    findMany: (filter?: Partial<File>) => Promise<File[]>;
    findById: (id: string) => Promise<File | undefined>;
    create: (data: Omit<File, 'id' | 'createdAt' | 'updatedAt'>) => Promise<File>;
    update: (id: string, data: Partial<File>) => Promise<File | undefined>;
    delete: (id: string) => Promise<boolean>;
  };
  analyses: {
    findMany: (filter?: Partial<Analysis>) => Promise<Analysis[]>;
    findByFileId: (fileId: string) => Promise<Analysis | undefined>;
    create: (data: Omit<Analysis, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Analysis>;
  };
  reports: {
    findMany: (filter?: Partial<Report>) => Promise<Report[]>;
    findById: (id: string) => Promise<Report | undefined>;
    create: (data: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Report>;
  };
  suggestions: {
    findMany: (filter?: Partial<Suggestion>) => Promise<Suggestion[]>;
    create: (data: Omit<Suggestion, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Suggestion>;
    findByAnalysisId: (analysisId: string) => Promise<Suggestion[]>;
  };
};
