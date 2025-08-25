import { NextRequest, NextResponse } from 'next/server';
import { drizzleDb } from '@/lib/database/connection';
import * as schema from '@/lib/database/models';
import { eq, count, avg, max, min, desc, asc, sql, and, gte, lte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('from') ? new Date(searchParams.get('from')!) : null;
    const dateTo = searchParams.get('to') ? new Date(searchParams.get('to')!) : null;
    const technology = searchParams.get('technology');
    const complexity = searchParams.get('complexity');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Build where conditions
    let whereConditions = [];
    if (dateFrom) whereConditions.push(gte(schema.analyses.analyzedAt, dateFrom));
    if (dateTo) whereConditions.push(lte(schema.analyses.analyzedAt, dateTo));
    if (technology) whereConditions.push(eq(schema.analyses.technologyType, technology));
    if (complexity) whereConditions.push(eq(schema.analyses.complexityLevel, complexity));

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get detailed analytics
    const [
      fileAnalytics,
      complexityMetrics,
      technologyBreakdown,
      qualityMetrics,
      issueAnalytics,
      topComplexFiles,
      totalFilesCount
    ] = await Promise.all([
      // File analytics with pagination
      drizzleDb.select({
        fileId: schema.files.id,
        filename: schema.files.filename,
        fileType: schema.files.fileType,
        fileSize: schema.files.fileSize,
        linesOfCode: schema.analyses.linesOfCode,
        cyclomaticComplexity: schema.analyses.cyclomaticComplexity,
        nestingDepth: schema.analyses.nestingDepth,
        maintainabilityIndex: schema.analyses.maintainabilityIndex,
        complexityLevel: schema.analyses.complexityLevel,
        riskScore: schema.analyses.riskScore,
        technologyType: schema.analyses.technologyType,
        analyzedAt: schema.analyses.analyzedAt,
        functionCount: schema.analyses.functionCount,
        classCount: schema.analyses.classCount,
        loopCount: schema.analyses.loopCount,
        conditionalCount: schema.analyses.conditionalCount
      })
      .from(schema.files)
      .leftJoin(schema.analyses, eq(schema.files.id, schema.analyses.fileId))
      .where(whereClause)
      .orderBy(desc(schema.analyses.analyzedAt))
      .limit(limit)
      .offset(offset),

      // Complexity metrics summary
      drizzleDb.select({
        avgComplexity: avg(schema.analyses.cyclomaticComplexity),
        maxComplexity: max(schema.analyses.cyclomaticComplexity),
        minComplexity: min(schema.analyses.cyclomaticComplexity),
        avgNesting: avg(schema.analyses.nestingDepth),
        maxNesting: max(schema.analyses.nestingDepth),
        avgMaintainability: avg(sql<number>`CAST(maintainability_index AS DECIMAL)`),
        avgRiskScore: avg(sql<number>`CAST(risk_score AS DECIMAL)`)
      })
      .from(schema.analyses)
      .where(whereClause),

      // Technology breakdown with detailed metrics
      drizzleDb.select({
        technology: schema.analyses.technologyType,
        fileCount: count(),
        avgComplexity: avg(schema.analyses.cyclomaticComplexity),
        avgLinesOfCode: avg(schema.analyses.linesOfCode),
        highComplexityCount: sql<number>`SUM(CASE WHEN complexity_level IN ('high', 'critical') THEN 1 ELSE 0 END)`,
        avgMaintainability: avg(sql<number>`CAST(maintainability_index AS DECIMAL)`)
      })
      .from(schema.analyses)
      .where(whereClause)
      .groupBy(schema.analyses.technologyType),

      // Quality metrics by complexity level
      drizzleDb.select({
        complexityLevel: schema.analyses.complexityLevel,
        count: count(),
        avgLinesOfCode: avg(schema.analyses.linesOfCode),
        avgFunctions: avg(schema.analyses.functionCount),
        avgMaintainability: avg(sql<number>`CAST(maintainability_index AS DECIMAL)`),
        avgRiskScore: avg(sql<number>`CAST(risk_score AS DECIMAL)`)
      })
      .from(schema.analyses)
      .where(whereClause)
      .groupBy(schema.analyses.complexityLevel),

      // Issue analytics
      drizzleDb.select({
        severity: schema.suggestions.severity,
        category: schema.suggestions.category,
        count: count()
      })
      .from(schema.suggestions)
      .leftJoin(schema.analyses, eq(schema.suggestions.analysisId, schema.analyses.id))
      .where(whereClause)
      .groupBy(schema.suggestions.severity, schema.suggestions.category),

      // Top 10 most complex files
      drizzleDb.select({
        filename: schema.files.filename,
        fileType: schema.files.fileType,
        cyclomaticComplexity: schema.analyses.cyclomaticComplexity,
        nestingDepth: schema.analyses.nestingDepth,
        linesOfCode: schema.analyses.linesOfCode,
        riskScore: schema.analyses.riskScore,
        complexityLevel: schema.analyses.complexityLevel
      })
      .from(schema.files)
      .leftJoin(schema.analyses, eq(schema.files.id, schema.analyses.fileId))
      .where(whereClause)
      .orderBy(desc(schema.analyses.cyclomaticComplexity))
      .limit(10),

      // Total count for pagination
      drizzleDb.select({ count: count() })
        .from(schema.files)
        .leftJoin(schema.analyses, eq(schema.files.id, schema.analyses.fileId))
        .where(whereClause)
    ]);

    // Calculate trends (weekly analysis over the last 12 weeks)
    const weeklyTrends = await drizzleDb.select({
      week: sql<string>`DATE_TRUNC('week', analyzed_at)`,
      analysisCount: count(),
      avgComplexity: avg(schema.analyses.cyclomaticComplexity),
      highComplexityCount: sql<number>`SUM(CASE WHEN complexity_level IN ('high', 'critical') THEN 1 ELSE 0 END)`
    })
    .from(schema.analyses)
    .where(and(
      gte(schema.analyses.analyzedAt, new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000)),
      whereClause
    ))
    .groupBy(sql`DATE_TRUNC('week', analyzed_at)`)
    .orderBy(sql`DATE_TRUNC('week', analyzed_at)`);

    // Prepare response data
    const analyticsData = {
      summary: {
        totalFiles: totalFilesCount[0]?.count || 0,
        metrics: {
          complexity: {
            average: parseFloat(complexityMetrics[0]?.avgComplexity || '0'),
            maximum: complexityMetrics[0]?.maxComplexity || 0,
            minimum: complexityMetrics[0]?.minComplexity || 0
          },
          nesting: {
            average: parseFloat(complexityMetrics[0]?.avgNesting || '0'),
            maximum: complexityMetrics[0]?.maxNesting || 0
          },
          maintainability: {
            average: parseFloat(complexityMetrics[0]?.avgMaintainability || '0')
          },
          risk: {
            average: parseFloat(complexityMetrics[0]?.avgRiskScore || '0')
          }
        }
      },
      breakdown: {
        byTechnology: technologyBreakdown.map(item => ({
          technology: item.technology,
          fileCount: item.fileCount,
          avgComplexity: parseFloat(item.avgComplexity || '0'),
          avgLinesOfCode: parseFloat(item.avgLinesOfCode || '0'),
          highComplexityCount: item.highComplexityCount,
          avgMaintainability: parseFloat(item.avgMaintainability || '0'),
          qualityScore: Math.max(0, 100 - parseFloat(item.avgMaintainability || '100'))
        })),
        byComplexity: qualityMetrics.map(item => ({
          level: item.complexityLevel,
          count: item.count,
          avgLinesOfCode: parseFloat(item.avgLinesOfCode || '0'),
          avgFunctions: parseFloat(item.avgFunctions || '0'),
          avgMaintainability: parseFloat(item.avgMaintainability || '0'),
          avgRiskScore: parseFloat(item.avgRiskScore || '0')
        }))
      },
      issues: {
        bySeverity: issueAnalytics.reduce((acc, item) => {
          if (!acc[item.severity]) acc[item.severity] = 0;
          acc[item.severity] += item.count;
          return acc;
        }, {} as Record<string, number>),
        byCategory: issueAnalytics.reduce((acc, item) => {
          if (!acc[item.category]) acc[item.category] = 0;
          acc[item.category] += item.count;
          return acc;
        }, {} as Record<string, number>)
      },
      trends: {
        weekly: weeklyTrends.map(item => ({
          week: item.week,
          analysisCount: item.analysisCount,
          avgComplexity: parseFloat(item.avgComplexity || '0'),
          highComplexityCount: item.highComplexityCount
        }))
      },
      topComplexFiles: topComplexFiles.map(item => ({
        filename: item.filename,
        fileType: item.fileType,
        cyclomaticComplexity: item.cyclomaticComplexity,
        nestingDepth: item.nestingDepth,
        linesOfCode: item.linesOfCode,
        riskScore: parseFloat(item.riskScore || '0'),
        complexityLevel: item.complexityLevel
      })),
      files: fileAnalytics.map(item => ({
        id: item.fileId,
        filename: item.filename,
        fileType: item.fileType,
        fileSize: item.fileSize,
        metrics: {
          linesOfCode: item.linesOfCode,
          cyclomaticComplexity: item.cyclomaticComplexity,
          nestingDepth: item.nestingDepth,
          maintainabilityIndex: parseFloat(item.maintainabilityIndex || '0'),
          riskScore: parseFloat(item.riskScore || '0'),
          functionCount: item.functionCount,
          classCount: item.classCount,
          loopCount: item.loopCount,
          conditionalCount: item.conditionalCount
        },
        complexityLevel: item.complexityLevel,
        technology: item.technologyType,
        analyzedAt: item.analyzedAt
      })),
      pagination: {
        page,
        limit,
        total: totalFilesCount[0]?.count || 0,
        pages: Math.ceil((totalFilesCount[0]?.count || 0) / limit)
      }
    };

    return NextResponse.json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

// POST endpoint for custom analytics queries
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      metrics = [], 
      groupBy = [], 
      filters = {},
      dateRange = {}
    } = body;

    // Build dynamic query based on request
    // This is a simplified example - in production, you'd want more robust query building
    
    // Create initial query
    const initialQuery = drizzleDb.select().from(schema.analyses);
    
    // Apply joins
    const queryWithJoins = initialQuery.leftJoin(schema.files, eq(schema.analyses.fileId, schema.files.id));
    
    // Apply filters
    let whereConditions = [];
    
    if (filters.technology) {
      whereConditions.push(eq(schema.analyses.technologyType, filters.technology));
    }
    
    if (filters.complexityLevel) {
      whereConditions.push(eq(schema.analyses.complexityLevel, filters.complexityLevel));
    }
    
    if (dateRange.from) {
      whereConditions.push(gte(schema.analyses.analyzedAt, new Date(dateRange.from)));
    }
    
    if (dateRange.to) {
      whereConditions.push(lte(schema.analyses.analyzedAt, new Date(dateRange.to)));
    }

    // Apply where clause if conditions exist
    let finalQuery;
    if (whereConditions.length > 0) {
      const whereClause = and(...whereConditions);
      finalQuery = queryWithJoins.where(whereClause);
    } else {
      finalQuery = queryWithJoins;
    }
    
    // Execute query with limit
    const results = await finalQuery.limit(1000); // Limit for safety

    return NextResponse.json({
      success: true,
      data: results,
      query: {
        metrics,
        groupBy,
        filters,
        dateRange
      }
    });

  } catch (error) {
    console.error('Custom analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to execute custom analytics query' },
      { status: 500 }
    );
  }
}
