import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { drizzleDb } from '@/lib/database/connection';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { eq, desc } from 'drizzle-orm';
import * as schema from '@/lib/database/models';
import { FileStatus } from '@/lib/database/models/file';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const uploadedFiles = formData.getAll('files') as File[];
    
    if (!uploadedFiles || uploadedFiles.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB default
    
    // Ensure upload directory exists
    await mkdir(uploadDir, { recursive: true });

    const results = [];
    const errors = [];

    for (const file of uploadedFiles) {
      try {
        // Validate file size
        if (file.size > maxFileSize) {
          errors.push({ 
            filename: file.name, 
            error: `File size exceeds limit of ${maxFileSize} bytes` 
          });
          continue;
        }

        // Validate file type
        const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pl,pm,xml,ktr,kjb,txt,log').split(',');
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        
        if (!fileExtension || !allowedTypes.includes(fileExtension)) {
          errors.push({ 
            filename: file.name, 
            error: `File type .${fileExtension} not allowed` 
          });
          continue;
        }

        // Read file content
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const content = buffer.toString('utf-8');
        
        // Generate content hash for deduplication
        const contentHash = createHash('sha256').update(content).digest('hex');
        
        // Check for duplicate files by content hash
        const existingFile = await drizzleDb
          .select()
          .from(schema.files)
          .where(eq(schema.files.contentHash, contentHash))
          .limit(1)
          .then(results => results[0]);

        if (existingFile) {
          results.push({
            id: existingFile.id,
            filename: file.name,
            status: 'duplicate',
            message: 'File already exists (duplicate content detected)',
          });
          continue;
        }

        // Generate unique filename and file ID
        const fileId = uuidv4();
        const timestamp = Date.now();
        const uniqueFilename = `${timestamp}_${fileId}_${file.name}`;
        const filePath = join(uploadDir, uniqueFilename);
        
        // Generate batch ID for grouping related files
        const batchId = uuidv4();
        const now = new Date();
        
        // Save file to disk
        await writeFile(filePath, buffer);

        // Save file record to database using Drizzle ORM
        const [fileRecord] = await drizzleDb
          .insert(schema.files)
          .values({
            filename: file.name,
            originalPath: filePath,
            relativePath: null,
            fileSize: file.size,
            fileType: fileExtension,
            contentHash: contentHash,
            mimeType: file.type || null,
            encoding: 'utf-8',
            status: FileStatus.UPLOADED,
            uploadedBy: null,
            isArchived: false,
            hasErrors: false,
            errorMessage: null,
            batchId: batchId,
            processingStartedAt: now,
            uploadSessionId: null
          })
          .returning();

        results.push({
          id: fileRecord.id,
          filename: file.name,
          size: file.size,
          type: fileExtension,
          status: 'uploaded',
          message: 'File uploaded successfully',
        });

        // Trigger analysis in background without waiting for results
        // Update file status to PROCESSING immediately
        await drizzleDb.update(schema.files)
          .set({ 
            status: FileStatus.PROCESSING,
            updatedAt: new Date(),
            processingStartedAt: new Date()
          })
          .where(eq(schema.files.id, fileRecord.id));
          
        // Trigger analysis in background using setTimeout to avoid waiting
        setTimeout(async () => {
          try {
            console.log(`Starting background analysis for file ${fileRecord.id}`);
            
            // Import required modules for direct analysis
            const { AIAnalyzer } = await import('@/lib/analyzers/ai-analyzer');
            const { readFile } = await import('fs/promises');
            
            // Use existing imports from the file
            const { eq } = await import('drizzle-orm');
            
            // Read file content
            const filePath = fileRecord.originalPath;
            let content;
            
            try {
              content = await readFile(filePath, 'utf-8');
            } catch (readError: any) {
              console.error(`Failed to read file ${fileRecord.id}:`, readError);
              
              // Update file status to indicate failure
              await drizzleDb.update(schema.files)
                .set({ 
                  status: FileStatus.FAILED,
                  errorMessage: `Failed to read file: ${readError.message || 'Unknown error'}`,
                  updatedAt: new Date(),
                  processingCompletedAt: new Date(),
                  hasErrors: true
                })
                .where(eq(schema.files.id, fileRecord.id));
              
              return; // Exit the function early
            }
            
            // Use AI analyzer directly
            const analyzer = new AIAnalyzer(null);
            
            try {
              // Perform analysis
              const analysisResult = await analyzer.createAnalysisResult(content, fileRecord.filename, fileRecord.id);
              
              // Save analysis to database
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
                analysisVersion: '1.0',
                functionCount: analysisResult.metrics.functionCount || 0,
                classCount: analysisResult.metrics.classCount || 0,
                dependencyCount: analysisResult.metrics.dependencyCount || 0,
                loopCount: analysisResult.metrics.loopCount || 0,
                conditionalCount: analysisResult.metrics.conditionalCount || 0,
                sqlJoinCount: analysisResult.metrics.sqlJoinCount || 0,
                detailedMetrics: analysisResult.metrics.detailedMetrics || {},
                issuesFound: analysisResult.metrics.issuesFound || [],
                analyzedAt: new Date()
              };
              
              // Create analysis record
              const analysisRecord = await drizzleDb
                .insert(schema.analyses)
                .values(analysisData)
                .returning();
                
              if (!analysisRecord || (Array.isArray(analysisRecord) && analysisRecord.length === 0)) {
                throw new Error('Failed to create analysis record');
              }
              
              // Update file status to analyzed
              await drizzleDb.update(schema.files)
                .set({ 
                  status: FileStatus.ANALYZED,
                  updatedAt: new Date(),
                  processingCompletedAt: new Date(),
                  isAnalyzed: true,
                  hasErrors: false
                })
                .where(eq(schema.files.id, fileRecord.id));
                
              console.log(`Successfully analyzed file ${fileRecord.id}`);
            } catch (analysisError: any) {
              console.error(`Error analyzing file ${fileRecord.id}:`, analysisError);
              
              // Update file status to indicate failure
              await drizzleDb.update(schema.files)
                .set({ 
                  status: FileStatus.FAILED,
                  errorMessage: `Analysis failed: ${analysisError.message || 'Unknown error'}`,
                  updatedAt: new Date(),
                  processingCompletedAt: new Date(),
                  hasErrors: true
                })
                .where(eq(schema.files.id, fileRecord.id));
            }
          } catch (error: any) {
            console.error(`Unhandled error in background analysis for file ${fileRecord.id}:`, error);
            
            // Update file status to indicate failure as a fallback
            try {
              await drizzleDb.update(schema.files)
                .set({ 
                  status: FileStatus.FAILED,
                  errorMessage: `Unhandled error: ${error.message || 'Unknown error'}`,
                  updatedAt: new Date(),
                  processingCompletedAt: new Date(),
                  hasErrors: true
                })
                .where(eq(schema.files.id, fileRecord.id));
            } catch (updateError) {
              console.error(`Failed to update file status for ${fileRecord.id}:`, updateError);
            }
          }
        }, 100);// Small timeout to ensure this runs after response is sent
        } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        errors.push({ 
          filename: file.name, 
          error: 'Internal server error during file processing' 
        });
      }
    }

    return NextResponse.json({
      success: true,
      uploadedFiles: results,
      errors: errors.length > 0 ? errors : undefined,
      total: uploadedFiles.length,
      successful: results.filter(r => r.status === 'uploaded').length,
      duplicates: results.filter(r => r.status === 'duplicate').length,
      failed: errors.length,
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get recent uploads using Drizzle ORM
    const files = await drizzleDb
      .select()
      .from(schema.files)
      .orderBy(desc(schema.files.createdAt))
      .limit(20);
      
    // Map the results to the desired format
    const recentFiles = files.map(file => ({
        id: file.id,
        filename: file.filename,
        fileSize: file.fileSize,
        fileType: file.fileType,
        status: file.status,
        createdAt: file.createdAt,
      }));

    return NextResponse.json({
      files: recentFiles,
      total: recentFiles.length,
    });

  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
