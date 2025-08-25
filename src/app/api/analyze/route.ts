import { NextRequest, NextResponse } from 'next/server';
import { drizzleDb } from '@/lib/database/connection';
import { AIAnalyzer } from '@/lib/analyzers/ai-analyzer';
import { readFile } from 'fs/promises';
import { join } from 'path';
import * as schema from '@/lib/database/models';
import { FileStatus } from '@/lib/database/models/file';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { fileIds } = await request.json();
    
    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json({ error: 'No file IDs provided' }, { status: 400 });
    }

    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const results = [];
    const errors = [];

    for (const fileId of fileIds) {
      try {
        // Get file record using Drizzle ORM
        const fileRecord = await drizzleDb
          .select()
          .from(schema.files)
          .where(eq(schema.files.id, fileId));

        if (!fileRecord || fileRecord.length === 0) {
          errors.push({ fileId, error: 'File not found' });
          continue;
        }
        
        const file = fileRecord[0];
        
        // Check if already analyzed using Drizzle ORM
        const existingAnalysis = await drizzleDb
          .select()
          .from(schema.analyses)
          .where(eq(schema.analyses.fileId, fileId));

        // Get the current content hash from the file record
        const currentContentHash = file.contentHash;
        
        // If file is already analyzed and content hasn't changed, skip re-analysis
        if (existingAnalysis && existingAnalysis.length > 0) {
          // Check if the user wants to force re-analysis
          const forceReanalysis = request.headers.get('x-force-reanalysis') === 'true';
          
          if (!forceReanalysis) {
            results.push({
              fileId,
              filename: file.filename,
              status: 'already_analyzed',
              analysisId: existingAnalysis[0].id,
              message: 'File already analyzed. Use force re-analysis option to analyze again.'
            });
            continue;
          }
        }

        // Update file status to processing
        await drizzleDb
          .update(schema.files)
          .set({ status: 'processing' })
          .where(eq(schema.files.id, fileId));

        // Read file content
        const filePath = file.originalPath; // Use the stored original path instead of constructing it
        const content = await readFile(filePath, 'utf-8');

        // Use AI analyzer directly without a fallback analyzer
        const analyzer = new AIAnalyzer(null);
        
        if (!analyzer) {
          throw new Error(`No analyzer available for file type: ${file.fileType}`);
        }

        // Perform analysis
        const analysisResult = await analyzer.createAnalysisResult(content, file.filename, fileId);

        // Save analysis to database using db interface
        const analysisData = {
          fileId: analysisResult.fileId,
          linesOfCode: analysisResult.metrics.linesOfCode,
          codeLines: analysisResult.metrics.codeLines || 0,
          commentLines: analysisResult.metrics.commentLines || 0,
          blankLines: analysisResult.metrics.blankLines || 0,
          cyclomaticComplexity: analysisResult.metrics.cyclomaticComplexity,
          nestingDepth: analysisResult.metrics.nestingDepth,
          maintainabilityIndex: String(analysisResult.metrics.maintainabilityIndex || 0),
          complexityLevel: analysisResult.metrics.complexityLevel as 'low' | 'medium' | 'high' | 'critical',
          riskScore: String(analysisResult.metrics.riskScore || 0),
          technologyType: analysisResult.technologyType,
          technology: analysisResult.technologyType, // Required by the interface
          language: fileExtensionToLanguage(file.fileType), // Required by the interface
          functionCount: analysisResult.metrics.functionCount || 0,
          classCount: analysisResult.metrics.classCount || 0,
          dependencyCount: analysisResult.metrics.dependencyCount || 0,
          loopCount: analysisResult.metrics.loopCount || 0,
          conditionalCount: analysisResult.metrics.conditionalCount || 0,
          importCount: 0, // Required by the interface
          analyzedAt: new Date(), // Required by the interface
          analysisVersion: '1.0', // Required by the database (camelCase, not snake_case)
          sqlJoinCount: analysisResult.metrics.sqlJoinCount || 0, // Required field
          detailedMetrics: {}, // Required by the database schema
          issuesFound: [], // Required by the database schema
          metadata: { // Required by the interface
            detailedMetrics: analysisResult.metrics.detailedMetrics || {},
            issuesFound: analysisResult.metrics.issuesFound || []
          }
        };
        
        // Create analysis record using Drizzle ORM
        const analysisRecord = await drizzleDb
          .insert(schema.analyses)
          .values(analysisData)
          .returning();

        // Update file status to analyzed with all required fields
        const now = new Date();
        
        // Also update the file directly in the database to ensure all fields are set
        // This is needed because the db interface might not support all fields
        await drizzleDb
          .update(schema.files)
          .set({ 
            status: FileStatus.ANALYZED,
            processingCompletedAt: now,
            isAnalyzed: true
          })
          .where(eq(schema.files.id, fileId));

        results.push({
          fileId,
          filename: file.filename,
          status: 'analyzed',
          analysisId: analysisRecord[0].id,
          metrics: analysisResult.metrics,
        });

      } catch (error) {
        console.error(`Error analyzing file ${fileId}:`, error);
        
        // Update file status to failed
        const now = new Date();
        // Using Drizzle ORM to update file status
        await drizzleDb
          .update(schema.files)
          .set({ 
            status: FileStatus.FAILED,
            processingCompletedAt: now,
            isAnalyzed: false,
            hasErrors: true,
            errorMessage: error instanceof Error ? error.message : 'Analysis failed'
          })
          .where(eq(schema.files.id, fileId));

        errors.push({ 
          fileId, 
          error: error instanceof Error ? error.message : 'Analysis failed' 
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors: errors.length > 0 ? errors : undefined,
      total: fileIds.length,
      successful: results.filter(r => r.status === 'analyzed').length,
      alreadyAnalyzed: results.filter(r => r.status === 'already_analyzed').length,
      failed: errors.length,
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, { status: 500 }
    );
  }
}

// Helper function to map file extensions to language names
function fileExtensionToLanguage(fileType: string): string {
  switch (fileType.toLowerCase()) {
    case 'pl':
    case 'pm':
      return 'perl';
    case 'xml':
      return 'xml';
    case 'ktr':
    case 'kjb':
      return 'pentaho';
    default:
      return 'unknown';
  }
}

// Helper function
/**
 * Get AI analyzer for any file type
 */
function getAnalyzer(fileType: string): AIAnalyzer {
  // Create a new AIAnalyzer with the file extension
  return new AIAnalyzer(fileType);
}
