import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { and, eq, isNull } from 'drizzle-orm';
import * as schema from './models';
import { Database, File, Analysis, Report, Suggestion } from './types';

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/legacy_analyzer',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Create the Drizzle instance with the schema
export const drizzleDb = drizzle(pool, { schema });

// Database implementation using Drizzle ORM
export const db: Database = {
  files: {
    async findMany(filter = {}): Promise<File[]> {
      const results = await drizzleDb.select().from(schema.files).where((fields) => {
        if (Object.keys(filter).length === 0) return undefined;
        
        const conditions = Object.entries(filter).map(([key, value]) => {
          if (value === undefined || value === null) {
            return isNull(fields[key as keyof typeof fields]);
          }
          return eq(fields[key as keyof typeof fields], value as any);
        });
        return and(...conditions);
      });
      
      // Ensure all required fields are present in the result
      return results.map(file => ({
        ...file,
        // Cast to any first to avoid TypeScript errors with potentially missing fields
        metadata: (file as any).metadata || null,
        deletedAt: (file as any).deletedAt || null
      })) as File[];
    },
    
    async findById(id: string): Promise<File | undefined> {
      const [file] = await drizzleDb
        .select()
        .from(schema.files)
        .where(eq(schema.files.id, id))
        .limit(1);
        
      if (!file) return undefined;
      
      // Ensure all required fields are present
      return {
        ...file,
        // Cast to any first to avoid TypeScript errors with potentially missing fields
        metadata: (file as any).metadata || null,
        deletedAt: (file as any).deletedAt || null
      } as File;
    },
    
    async create(data: Omit<File, 'id' | 'createdAt' | 'updatedAt'>): Promise<File> {
      // Ensure required fields are present
      const fileData = {
        ...data,
        contentHash: data.contentHash || '',
        metadata: data.metadata || null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const [file] = await drizzleDb
        .insert(schema.files)
        .values(fileData as any)
        .returning();
        
      return {
        ...file,
        metadata: (file as any).metadata || null,
        deletedAt: (file as any).deletedAt || null
      } as unknown as File;
    },
    
    async update(id: string, data: Partial<File>): Promise<File | undefined> {
      // Find the file first
      const existingFile = await this.findById(id);
      if (!existingFile) return undefined;
      
      // Mock update by creating a new object with updated properties
      const updatedFile = {
        ...existingFile,
        ...data,
        updatedAt: new Date()
      };
      
      // In a real implementation, we would persist this change
      // For mock purposes, we just return the updated object
      // Note: This doesn't actually update any stored data in the mock DB
      return updatedFile;
    },
    
    async delete(id: string): Promise<boolean> {
      await drizzleDb.delete(schema.files).where(eq(schema.files.id, id));
      return true;
    },
  },
  
  analyses: {
    async findMany(filter = {}): Promise<Analysis[]> {
      const results = await drizzleDb.select().from(schema.analyses).where((fields) => {
        if (Object.keys(filter).length === 0) return undefined;
        
        const conditions = Object.entries(filter).map(([key, value]) => {
          if (value === undefined || value === null) {
            return isNull(fields[key as keyof typeof fields]);
          }
          return eq(fields[key as keyof typeof fields], value as any);
        });
        return and(...conditions);
      });
      
      return results.map(analysis => ({
        ...analysis,
        metadata: (analysis as any).metadata || null
      })) as unknown as Analysis[];
    },
    
    async findByFileId(fileId: string): Promise<Analysis | undefined> {
      const [analysis] = await drizzleDb
        .select()
        .from(schema.analyses)
        .where(eq(schema.analyses.fileId, fileId))
        .limit(1);
        
      if (!analysis) return undefined;
      
      return {
        ...analysis,
        metadata: (analysis as any).metadata || null
      } as unknown as Analysis;
    },
    
    async create(data: Omit<Analysis, 'id' | 'createdAt' | 'updatedAt'>): Promise<Analysis> {
      const analysisData = {
        ...data,
        metadata: data.metadata || null,
        analyzedAt: data.analyzedAt || new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const [analysis] = await drizzleDb
        .insert(schema.analyses)
        .values(analysisData as any)
        .returning();
        
      return {
        ...analysis,
        metadata: (analysis as any).metadata || null
      } as unknown as Analysis;
    },
  },
  
  reports: {
    async findMany(filter = {}): Promise<Report[]> {
      const results = await drizzleDb.select().from(schema.reports).where((fields) => {
        if (Object.keys(filter).length === 0) return undefined;
        
        const conditions = Object.entries(filter).map(([key, value]) => {
          if (value === undefined || value === null) {
            return isNull(fields[key as keyof typeof fields]);
          }
          return eq(fields[key as keyof typeof fields], value as any);
        });
        return and(...conditions);
      });
      
      return results as unknown as Report[];
    },
    
    async findById(id: string): Promise<Report | undefined> {
      const [report] = await drizzleDb
        .select()
        .from(schema.reports)
        .where(eq(schema.reports.id, id))
        .limit(1);
        
      return report as unknown as Report | undefined;
    },
    
    async create(data: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): Promise<Report> {
      const reportData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const [report] = await drizzleDb
        .insert(schema.reports)
        .values(reportData as any)
        .returning();
        
      return report as unknown as Report;
    },
  },
  
  suggestions: {
    async findMany(filter = {}): Promise<Suggestion[]> {
      const results = await drizzleDb.select().from(schema.suggestions).where((fields) => {
        if (Object.keys(filter).length === 0) return undefined;
        
        const conditions = Object.entries(filter).map(([key, value]) => {
          if (value === undefined || value === null) {
            return isNull(fields[key as keyof typeof fields]);
          }
          return eq(fields[key as keyof typeof fields], value as any);
        });
        return and(...conditions);
      });
      
      return results.map(suggestion => ({
        ...suggestion,
        metadata: (suggestion as any).metadata || null,
        explanation: (suggestion as any).explanation || null,
        codeSnippet: (suggestion as any).codeSnippet || null,
        suggestedFix: (suggestion as any).suggestedFix || null,
        modernizationApproach: (suggestion as any).modernizationApproach || null,
        impactScore: (suggestion as any).impactScore || null,
        effortEstimate: suggestion.effortEstimate || null,
        aiModel: suggestion.aiModel || null,
        aiConfidence: suggestion.aiConfidence || null,
        startLine: suggestion.startLine || null,
        endLine: suggestion.endLine || null,
        startColumn: suggestion.startColumn || null,
        endColumn: suggestion.endColumn || null
      })) as Suggestion[];
    },
    
    async create(data: Omit<Suggestion, 'id' | 'createdAt' | 'updatedAt'>): Promise<Suggestion> {
      const suggestionData = {
        ...data,
        metadata: data.metadata || null,
        explanation: data.explanation || null,
        codeSnippet: data.codeSnippet || null,
        suggestedFix: data.suggestedFix || null,
        modernizationApproach: data.modernizationApproach || null,
        impactScore: data.impactScore || null,
        effortEstimate: data.effortEstimate || null,
        aiModel: data.aiModel || null,
        aiConfidence: data.aiConfidence || null,
        startLine: data.startLine || null,
        endLine: data.endLine || null,
        startColumn: data.startColumn || null,
        endColumn: data.endColumn || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const [suggestion] = await drizzleDb
        .insert(schema.suggestions)
        .values(suggestionData as any)
        .returning();
        
      return {
        ...suggestion,
        metadata: (suggestion as any).metadata || null,
        explanation: (suggestion as any).explanation || null,
        codeSnippet: (suggestion as any).codeSnippet || null,
        suggestedFix: (suggestion as any).suggestedFix || null,
        modernizationApproach: (suggestion as any).modernizationApproach || null,
        impactScore: (suggestion as any).impactScore || null,
        effortEstimate: suggestion.effortEstimate || null,
        aiModel: suggestion.aiModel || null,
        aiConfidence: suggestion.aiConfidence || null,
        startLine: suggestion.startLine || null,
        endLine: suggestion.endLine || null,
        startColumn: suggestion.startColumn || null,
        endColumn: suggestion.endColumn || null
      } as Suggestion;
    },
    
    async findByAnalysisId(analysisId: string): Promise<Suggestion[]> {
      const results = await drizzleDb
        .select()
        .from(schema.suggestions)
        .where(eq(schema.suggestions.analysisId, analysisId));
        
      return results.map(suggestion => ({
        ...suggestion,
        metadata: (suggestion as any).metadata || null,
        explanation: (suggestion as any).explanation || null,
        codeSnippet: (suggestion as any).codeSnippet || null,
        suggestedFix: (suggestion as any).suggestedFix || null,
        modernizationApproach: (suggestion as any).modernizationApproach || null,
        impactScore: (suggestion as any).impactScore || null,
        effortEstimate: suggestion.effortEstimate || null,
        aiModel: suggestion.aiModel || null,
        aiConfidence: suggestion.aiConfidence || null,
        startLine: suggestion.startLine || null,
        endLine: suggestion.endLine || null,
        startColumn: suggestion.startColumn || null,
        endColumn: suggestion.endColumn || null
      })) as Suggestion[];
    },
  },
};

// Export the pool for direct access if needed
export { pool };
