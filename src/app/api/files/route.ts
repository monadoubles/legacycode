import { NextRequest, NextResponse } from 'next/server';
import { drizzleDb } from '@/lib/database/connection';
import { desc, eq, like, and, or, asc, sql, count } from 'drizzle-orm';
import * as schema from '@/lib/database/models';
import { FileStatus } from '@/lib/database/models/file';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Filter parameters
    const status = searchParams.get('status');
    const fileType = searchParams.get('fileType');
    const search = searchParams.get('search');
    const archived = searchParams.get('archived') === 'true';

    // Build query conditions
    let conditions: any[] = [];
    
    // Archive filter
    conditions.push(eq(schema.files.isArchived, archived));
    
    // Status filter
    if (status) {
      conditions.push(eq(schema.files.status, status as any));
    }
    
    // File type filter
    if (fileType) {
      conditions.push(eq(schema.files.fileType, fileType));
    }
    
    // Search filter
    if (search) {
      conditions.push(like(schema.files.filename, `%${search}%`));
    }

    // Get total count for pagination
    const countResult = await drizzleDb
      .select({ count: count() })
      .from(schema.files)
      .where(and(...conditions));
    
    const totalCount = countResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    // Apply sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Get files with pagination and sorting
    const files = await drizzleDb
      .select()
      .from(schema.files)
      .where(conditions.length > 0 ? and(...conditions) : undefined as any)
      .orderBy(sortOrder === 'asc' 
        ? asc(schema.files[sortBy as keyof typeof schema.files] as any)
        : desc(schema.files[sortBy as keyof typeof schema.files] as any))
      .limit(limit)
      .offset(offset);

    // Get file IDs for analyzed files
    const fileIds = files
      .filter((file: any) => file.isAnalyzed)
      .map((file: any) => file.id);

    // Get analyses for these files
    let analyses: any[] = [];
    if (fileIds.length > 0) {
      analyses = await Promise.all(
        fileIds.map(fileId =>
          drizzleDb
            .select()
            .from(schema.analyses)
            .where(eq(schema.analyses.fileId, fileId))
            .then(results => results[0])
        )
      );
    }

    // Get file types for filtering options
    const fileTypesResult = await drizzleDb
      .select({ fileType: schema.files.fileType, count: count() })
      .from(schema.files)
      .groupBy(schema.files.fileType);

    // Get statuses for filtering options
    const statusesResult = await drizzleDb
      .select({ status: schema.files.status, count: count() })
      .from(schema.files)
      .groupBy(schema.files.status);

    // Calculate statistics
    const statsResult = await drizzleDb
      .select({
        totalFiles: count(),
        totalSize: sql<number>`sum(${schema.files.fileSize})`,
      })
      .from(schema.files);

    const statusCounts = await drizzleDb
      .select({
        status: schema.files.status,
        count: count(),
      })
      .from(schema.files)
      .groupBy(schema.files.status);

    // Combine file and analysis data
    const filesWithAnalysis = files.map((file: any) => {
      const analysis = analyses.find((a: any) => a && a.fileId === file.id);
      return {
        ...file,
        analysis: analysis || null
      };
    });

    // Build stats object
    const stats = {
      totalFiles: statsResult[0]?.totalFiles || 0,
      totalSize: statsResult[0]?.totalSize || 0,
      analyzedFiles: statusCounts.find((s: any) => s.status === FileStatus.ANALYZED)?.count || 0,
      failedFiles: statusCounts.find((s: any) => s.status === FileStatus.FAILED)?.count || 0,
      pendingFiles: statusCounts.find((s: any) => s.status === FileStatus.PENDING)?.count || 0,
      processingFiles: statusCounts.find((s: any) => s.status === FileStatus.PROCESSING)?.count || 0,
      uploadingFiles: statusCounts.find((s: any) => s.status === FileStatus.UPLOADED)?.count || 0,
      fileTypes: fileTypesResult.map((ft: any) => ({
        type: ft.fileType,
        count: ft.count
      })),
      statuses: statusesResult.map((s: any) => ({
        status: s.status,
        count: s.count
      }))
    };

    return NextResponse.json({
      files: filesWithAnalysis,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      filters: {
        fileTypes: fileTypesResult.map(ft => ft.fileType),
        statuses: statusesResult.map(s => s.status)
      },
      stats
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }

    // Check for duplicate filename
    const existingFile = await drizzleDb
      .select()
      .from(schema.files)
      .where(eq(schema.files.filename, data.filename))
      .limit(1);
    
    if (existingFile.length > 0) {
      return NextResponse.json(
        { error: 'File with this name already exists' },
        { status: 400 }
      );
    }

    // Create new file
    const newFile = await drizzleDb
      .insert(schema.files)
      .values({
        filename: data.filename,
        fileSize: data.fileSize || 0,
        fileType: data.fileType || 'unknown',
        contentHash: data.contentHash || '',
        status: data.status || FileStatus.UPLOADED,
        originalPath: data.originalPath || '',
        uploadedBy: data.uploadedBy || 'anonymous',
        isArchived: false,
        isAnalyzed: false,
        hasErrors: false
      })
      .returning();
      
    const createdFile = newFile[0];

    // Return the created file
    return NextResponse.json(createdFile, { status: 201 });

  } catch (error) {
    console.error('Bulk files operation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
