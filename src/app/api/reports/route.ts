import { NextRequest, NextResponse } from 'next/server';
import { drizzleDb } from '@/lib/database/connection';
import { v4 as uuidv4 } from 'uuid';
import * as schema from '@/lib/database/models';
import { eq, like, desc, asc, or, sql, inArray, and } from 'drizzle-orm';
import { ollamaClient } from '@/lib/ai/ollama-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Filters
    const status = searchParams.get('status');
    const generatedBy = searchParams.get('generatedBy');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const templatesOnly = searchParams.get('templatesOnly') === 'true';
    const publicOnly = searchParams.get('publicOnly') === 'true';

    // Build conditions for filtering
    const conditions = [];
    
    if (status) {
      conditions.push(eq(schema.reports.status, status as any));
    }
    
    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      conditions.push(
        or(
          like(schema.reports.name, searchLower),
          like(schema.reports.description || '', searchLower)
        )
      );
    }
    
    // TODO: Add filters for generatedBy, isTemplate, and isPublic when schema is updated
    
    // Create the where clause if there are conditions
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Execute query to get filtered reports
    const filteredReports = await drizzleDb.select().from(schema.reports)
      .where(whereClause);

    // Count total for pagination
    const countQuery = drizzleDb.select({ count: sql`count(*)` }).from(schema.reports)
      .where(whereClause);
    const [{ count }] = await countQuery;
    const total = Number(count);
    
    // Apply sorting and pagination in a new query
    let orderByClause;
    switch (sortBy) {
      case 'name':
        orderByClause = sortOrder === 'desc' 
          ? desc(schema.reports.name)
          : asc(schema.reports.name);
        break;
      case 'updatedAt':
        orderByClause = sortOrder === 'desc' 
          ? desc(schema.reports.updatedAt)
          : asc(schema.reports.updatedAt);
        break;
      default: // createdAt
        orderByClause = sortOrder === 'desc' 
          ? desc(schema.reports.createdAt)
          : asc(schema.reports.createdAt);
    }
    
    // Apply pagination and sorting in a single query
    const paginatedReports = await drizzleDb.select()
      .from(schema.reports)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    // Calculate stats with direct database queries
    const completedCount = await drizzleDb.select({ count: sql`count(*)` })
      .from(schema.reports)
      .where(eq(schema.reports.status, 'completed'));
      
    const generatingCount = await drizzleDb.select({ count: sql`count(*)` })
      .from(schema.reports)
      .where(eq(schema.reports.status, 'generating'));
      
    const failedCount = await drizzleDb.select({ count: sql`count(*)` })
      .from(schema.reports)
      .where(eq(schema.reports.status, 'failed'));
    
    const stats = {
      total: Number(count),
      completed: Number(completedCount[0].count),
      generating: Number(generatingCount[0].count),
      failed: Number(failedCount[0].count),
      templates: 0, // Not implemented yet
      public: 0, // Not implemented yet
    };

    return NextResponse.json({
      success: true,
      reports: paginatedReports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
      stats,
      filters: {
        status,
        generatedBy,
        search,
        sortBy,
        sortOrder,
        templatesOnly,
        publicOnly,
      },
    });

  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      description,
      fileIds,
      filters = {},
      settings = {},
      generatedBy = 'system',
      isTemplate = false,
      isPublic = false,
    } = await request.json();

    if (!name || !fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json(
        { error: 'Name and fileIds array are required' },
        { status: 400 }
      );
    }

    // Validate that files exist in the database using direct queries
    const existingFiles = await drizzleDb
      .select()
      .from(schema.files)
      .where(inArray(schema.files.id, fileIds));

    if (existingFiles.length !== fileIds.length) {
      // Find which files don't exist for better error reporting
      const existingFileIds = existingFiles.map(file => file.id);
      const missingFileIds = fileIds.filter(id => !existingFileIds.includes(id));
      
      return NextResponse.json(
        { 
          error: 'Some files do not exist', 
          missingFileIds 
        },
        { status: 400 }
      );
    }

    // Get analysis data for the files using a single query
    const analyses = await drizzleDb
      .select()
      .from(schema.analyses)
      .where(inArray(schema.analyses.fileId, fileIds));
    
    // Map files to their analyses
    const fileAnalysis = existingFiles.map(file => {
      const analysis = analyses.find(a => a.fileId === file.id);
      return { file, analysis };
    });

    // Calculate aggregated metrics
    const totalFiles = fileAnalysis.length;
    const analyzedFiles = fileAnalysis.filter(f => f.analysis).length;
    const totalLinesOfCode = fileAnalysis.reduce(
      (sum, f) => sum + (f.analysis?.linesOfCode || 0), 
      0
    );
    const averageComplexity = analyzedFiles > 0 
      ? fileAnalysis.reduce(
          (sum, f) => sum + (f.analysis?.cyclomaticComplexity || 0), 
          0
        ) / analyzedFiles 
      : 0;
    const highComplexityFiles = fileAnalysis.filter(
      f => f.analysis && ['high', 'critical'].includes(f.analysis.complexityLevel)
    ).length;

    // Technology distribution
    const technologyDistribution = fileAnalysis.reduce((acc, f) => {
      if (f.analysis) {
        const tech = f.analysis.technologyType;
        acc[tech] = (acc[tech] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Complexity distribution
    const complexityDistribution = fileAnalysis.reduce((acc, f) => {
      if (f.analysis) {
        const level = f.analysis.complexityLevel;
        acc[level] = (acc[level] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Generate summary and recommendations
    const summary = {
      totalFiles,
      analyzedFiles,
      unanalyzedFiles: totalFiles - analyzedFiles,
      totalLinesOfCode,
      averageComplexity: Math.round(averageComplexity * 100) / 100,
      highRiskFiles: highComplexityFiles,
      mainTechnology: Object.entries(technologyDistribution)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown',
    };

    // Create report in the database using direct query with pending status
    const reportId = uuidv4();
    const now = new Date();
    
    // Initial empty recommendations - will be updated in background
    const initialRecommendations: any[] = [];
    
    await drizzleDb.insert(schema.reports).values({
      id: reportId,
      name,
      generatedBy,
      isTemplate,
      isPublic,
      recommendations: initialRecommendations,
      summary,
      filters,
      settings,
      complexityDistribution,
      technologyDistribution,
      description: description || '',
      fileIds,
      status: 'pending',
      createdAt: now,
      updatedAt: now
    });
    
    // Generate recommendations in the background
    setTimeout(async () => {
      try {
        console.log(`Starting background recommendation generation for report ${reportId}`);
        
        // Generate recommendations using Ollama
        const recommendations = await ollamaClient.generateReportRecommendations(summary, complexityDistribution);
        
        // Update the report with recommendations and set status to completed
        await drizzleDb
          .update(schema.reports)
          .set({
            recommendations,
            status: 'completed',
            updatedAt: new Date()
          })
          .where(eq(schema.reports.id, reportId));
          
        console.log(`Completed recommendation generation for report ${reportId}`);
      } catch (error) {
        console.error(`Error generating recommendations for report ${reportId}:`, error);
        
        // Update report status to error
        await drizzleDb
          .update(schema.reports)
          .set({
            status: 'error',
            updatedAt: new Date()
          })
          .where(eq(schema.reports.id, reportId));
      }
    }, 0);
    
    // Fetch the newly created report
    const [newReport] = await drizzleDb
      .select()
      .from(schema.reports)
      .where(eq(schema.reports.id, reportId));

    return NextResponse.json({
      success: true,
      report: newReport,
      message: 'Report created successfully',
    });

  } catch (error) {
    console.error('Create report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


