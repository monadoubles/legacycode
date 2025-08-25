import { NextRequest, NextResponse } from 'next/server';
import { drizzleDb } from '@/lib/database/connection';
import * as schema from '@/lib/database/models';
import { eq, count, avg, desc, gte, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30'; // days
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - parseInt(timeRange));

    // Get overall statistics
    const [
      totalFilesResult,
      analyzedFilesResult,
      highComplexityResult,
      averageComplexityResult,
      securityIssuesResult,
      processingFilesResult,
      totalLinesResult,
      criticalIssuesResult
    ] = await Promise.all([
      // Total files
      drizzleDb.select({ count: count() }).from(schema.files),
      
      // Analyzed files
      drizzleDb.select({ count: count() }).from(schema.files).where(eq(schema.files.isAnalyzed, true)),
      
      // High complexity files
      drizzleDb.select({ count: count() })
        .from(schema.analyses)
        .where(sql`complexity_level IN ('high', 'critical')`),
      
      // Average complexity
      drizzleDb.select({ avg: avg(schema.analyses.cyclomaticComplexity) }).from(schema.analyses),
      
      // Security issues (suggestions with security category)
      drizzleDb.select({ count: count() })
        .from(schema.suggestions)
        .where(eq(schema.suggestions.category, 'security')),
      
      // Processing files
      drizzleDb.select({ count: count() })
        .from(schema.files)
        .where(eq(schema.files.status, 'processing')),
      
      // Total lines of code
      drizzleDb.select({ sum: sql<number>`COALESCE(SUM(lines_of_code), 0)` }).from(schema.analyses),
      
      // Critical issues
      drizzleDb.select({ count: count() })
        .from(schema.suggestions)
        .where(eq(schema.suggestions.severity, 'critical'))
    ]);

    // Get technology distribution
    const technologyDistribution = await drizzleDb
      .select({
        technology: schema.analyses.technologyType,
        count: count(),
        avgComplexity: avg(schema.analyses.cyclomaticComplexity)
      })
      .from(schema.analyses)
      .groupBy(schema.analyses.technologyType);

    // Get complexity level distribution
    const complexityDistribution = await drizzleDb
      .select({
        level: schema.analyses.complexityLevel,
        count: count()
      })
      .from(schema.analyses)
      .groupBy(schema.analyses.complexityLevel);

    // Get recent activity (last 10 analyzed files)
    const recentActivity = await drizzleDb
      .select({
        fileId: schema.files.id,
        filename: schema.files.filename,
        fileType: schema.files.fileType,
        analyzedAt: schema.analyses.analyzedAt,
        complexityLevel: schema.analyses.complexityLevel,
        linesOfCode: schema.analyses.linesOfCode
      })
      .from(schema.files)
      .leftJoin(schema.analyses, eq(schema.files.id, schema.analyses.fileId))
      .where(gte(schema.analyses.analyzedAt, dateFrom))
      .orderBy(desc(schema.analyses.analyzedAt))
      .limit(10);

    // Get trend data (daily analysis counts for the last 30 days)
    const trendData = await drizzleDb
      .select({
        date: sql<string>`DATE(analyzed_at)`,
        count: count()
      })
      .from(schema.analyses)
      .where(gte(schema.analyses.analyzedAt, dateFrom))
      .groupBy(sql`DATE(analyzed_at)`)
      .orderBy(sql`DATE(analyzed_at)`);

    // Construct response
    const dashboardData = {
      stats: {
        totalFiles: totalFilesResult[0]?.count || 0,
        analyzedFiles: analyzedFilesResult[0]?.count || 0,
        highComplexityFiles: highComplexityResult[0]?.count || 0,
        averageComplexity: parseFloat(averageComplexityResult[0]?.avg || '0'),
        securityIssues: securityIssuesResult[0]?.count || 0,
        processingFiles: processingFilesResult[0]?.count || 0,
        totalLinesOfCode: totalLinesResult[0]?.sum || 0,
        criticalIssues: criticalIssuesResult[0]?.count || 0
      },
      charts: {
        technologyDistribution: technologyDistribution.map(item => ({
          name: item.technology,
          value: item.count,
          avgComplexity: parseFloat(item.avgComplexity || '0')
        })),
        complexityDistribution: complexityDistribution.map(item => ({
          name: item.level,
          value: item.count
        })),
        trendData: trendData.map(item => ({
          date: item.date,
          analyses: item.count
        }))
      },
      recentActivity: recentActivity.map(item => ({
        id: item.fileId,
        filename: item.filename,
        fileType: item.fileType,
        analyzedAt: item.analyzedAt,
        complexityLevel: item.complexityLevel,
        linesOfCode: item.linesOfCode
      }))
    };

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
