import { NextRequest, NextResponse } from 'next/server';
import { drizzleDb } from '@/lib/database/connection';
import * as schema from '@/lib/database/models';
import { eq, and, inArray } from 'drizzle-orm';
import { Analysis } from '@/lib/database/types';

interface ComparisonRequest {
  type: 'files' | 'reports' | 'timeframes';
  items: string[]; // IDs of items to compare
  metrics?: string[]; // Specific metrics to compare
}

export async function POST(request: NextRequest) {
  try {
    const body: ComparisonRequest = await request.json();
    const { type, items, metrics = [] } = body;

    if (!items || items.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 items are required for comparison' },
        { status: 400 }
      );
    }

    if (items.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 items can be compared at once' },
        { status: 400 }
      );
    }

    let comparisonData;

    switch (type) {
      case 'files':
        comparisonData = await compareFiles(items, metrics);
        break;
      case 'reports':
        comparisonData = await compareReports(items, metrics);
        break;
      case 'timeframes':
        comparisonData = await compareTimeframes(items, metrics);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid comparison type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      type,
      data: comparisonData,
      comparedItems: items.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Comparison API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform comparison' },
      { status: 500 }
    );
  }
}

async function compareFiles(fileIds: string[], requestedMetrics: string[]) {
  // Get file details and their analyses
  const filesData = await drizzleDb
    .select({
      fileId: schema.files.id,
      filename: schema.files.filename,
      fileType: schema.files.fileType,
      fileSize: schema.files.fileSize,
      createdAt: schema.files.createdAt,
      // Analysis data
      analysisId: schema.analyses.id,
      linesOfCode: schema.analyses.linesOfCode,
      codeLines: schema.analyses.codeLines,
      commentLines: schema.analyses.commentLines,
      blankLines: schema.analyses.blankLines,
      cyclomaticComplexity: schema.analyses.cyclomaticComplexity,
      nestingDepth: schema.analyses.nestingDepth,
      maintainabilityIndex: schema.analyses.maintainabilityIndex,
      functionCount: schema.analyses.functionCount,
      classCount: schema.analyses.classCount,
      loopCount: schema.analyses.loopCount,
      conditionalCount: schema.analyses.conditionalCount,
      sqlJoinCount: schema.analyses.sqlJoinCount,
      dependencyCount: schema.analyses.dependencyCount,
      complexityLevel: schema.analyses.complexityLevel,
      riskScore: schema.analyses.riskScore,
      technologyType: schema.analyses.technologyType,
      analyzedAt: schema.analyses.analyzedAt
    })
    .from(schema.files)
    .leftJoin(schema.analyses, eq(schema.files.id, schema.analyses.fileId))
    .where(inArray(schema.files.id, fileIds));

  // Calculate comparison metrics
  const comparisonMetrics = calculateComparisonMetrics(filesData);
  
  // Identify patterns and insights
  const insights = generateFileComparisonInsights(filesData);

  return {
    files: filesData.map(file => ({
      id: file.fileId,
      name: file.filename,
      type: file.fileType,
      size: file.fileSize,
      createdAt: file.createdAt,
      analyzedAt: file.analyzedAt,
      technology: file.technologyType,
      metrics: {
        linesOfCode: file.linesOfCode,
        codeLines: file.codeLines,
        commentLines: file.commentLines,
        blankLines: file.blankLines,
        cyclomaticComplexity: file.cyclomaticComplexity,
        nestingDepth: file.nestingDepth,
        maintainabilityIndex: parseFloat(file.maintainabilityIndex || '0'),
        functionCount: file.functionCount,
        classCount: file.classCount,
        loopCount: file.loopCount,
        conditionalCount: file.conditionalCount,
        sqlJoinCount: file.sqlJoinCount,
        dependencyCount: file.dependencyCount,
        riskScore: parseFloat(file.riskScore || '0')
      },
      complexityLevel: file.complexityLevel
    })),
    comparison: comparisonMetrics,
    insights,
    chartData: generateFileComparisonChartData(filesData)
  };
}

async function compareReports(reportIds: string[], requestedMetrics: string[]) {
  // Get report details
  const reportsData = await drizzleDb
    .select({
      id: schema.reports.id,
      name: schema.reports.name,
      version: schema.reports.version,
      totalFiles: schema.reports.totalFiles,
      totalLinesOfCode: schema.reports.totalLinesOfCode,
      averageComplexity: schema.reports.averageComplexity,
      highComplexityFiles: schema.reports.highComplexityFiles,
      technologyDistribution: schema.reports.technologyDistribution,
      complexityDistribution: schema.reports.complexityDistribution,
      summary: schema.reports.summary,
      createdAt: schema.reports.createdAt,
      generatedAt: schema.reports.generatedAt,
      generatedBy: schema.reports.generatedBy
    })
    .from(schema.reports)
    .where(inArray(schema.reports.id, reportIds));

  const insights = generateReportComparisonInsights(reportsData);

  return {
    reports: reportsData.map(report => ({
      id: report.id,
      name: report.name,
      version: report.version,
      metrics: {
        totalFiles: report.totalFiles,
        totalLinesOfCode: report.totalLinesOfCode,
        averageComplexity: parseFloat(report.averageComplexity || '0'),
        highComplexityFiles: report.highComplexityFiles
      },
      distributions: {
        technology: report.technologyDistribution,
        complexity: report.complexityDistribution
      },
      summary: report.summary,
      createdAt: report.createdAt,
      generatedAt: report.generatedAt,
      generatedBy: report.generatedBy
    })),
    insights,
    chartData: generateReportComparisonChartData(reportsData)
  };
}

async function compareTimeframes(timeframes: string[], requestedMetrics: string[]) {
  const timeframeData = [];

  // Parse timeframes and create date ranges
  const timeframePeriods = timeframes.map(tf => {
    const [start, end] = tf.split('_');
    return {
      id: tf,
      label: `${start} to ${end}`,
      start: new Date(start),
      end: new Date(end)
    };
  });

  for (const period of timeframePeriods) {
    // Get all analyses using the mock database
    const allAnalyses = await drizzleDb.select().from(schema.analyses);
    
    // Filter analyses by date range
    const periodAnalyses = allAnalyses.filter((analysis: any) => {
      const analyzedAt = analysis.analyzedAt;
      return analyzedAt >= period.start && analyzedAt <= period.end;
    });

    // Calculate aggregated metrics for this timeframe
    const aggregatedMetrics = {
      totalAnalyses: periodAnalyses.length,
      avgComplexity: periodAnalyses.length > 0 ? 
        periodAnalyses.reduce((sum: number, a: any) => sum + (a.cyclomaticComplexity || 0), 0) / periodAnalyses.length : 0,
      avgLinesOfCode: periodAnalyses.length > 0 ? 
        periodAnalyses.reduce((sum: number, a: any) => sum + (a.linesOfCode || 0), 0) / periodAnalyses.length : 0,
      complexityDistribution: periodAnalyses.reduce((acc: any, a: any) => {
        acc[a.complexityLevel] = (acc[a.complexityLevel] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      technologyDistribution: periodAnalyses.reduce((acc, a) => {
        acc[a.technologyType] = (acc[a.technologyType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    timeframeData.push({
      id: period.id,
      label: period.label,
      metrics: {
        ...aggregatedMetrics,
        // Filter to only requested metrics if specified
        ...(requestedMetrics.length > 0 ? 
          Object.fromEntries(Object.entries(aggregatedMetrics).filter(([key]) => requestedMetrics.includes(key))) : {})
      }
    });
  }

  // Add comparison metrics and insights
  return {
    items: timeframeData,
    comparisonMetrics: calculateComparisonMetrics(timeframeData),
    insights: generateTimeframeComparisonInsights(timeframeData),
    chartData: generateTimeframeComparisonChartData(timeframeData)
  };
}

// Helper functions for calculations and insights
function calculateComparisonMetrics(filesData: any[]) {
  const metrics = filesData.map(f => ({
    linesOfCode: f.linesOfCode || 0,
    cyclomaticComplexity: f.cyclomaticComplexity || 0,
    nestingDepth: f.nestingDepth || 0,
    maintainabilityIndex: parseFloat(f.maintainabilityIndex || '0'),
    riskScore: parseFloat(f.riskScore || '0')
  }));

  return {
    averages: {
      linesOfCode: metrics.reduce((sum, m) => sum + m.linesOfCode, 0) / metrics.length,
      cyclomaticComplexity: metrics.reduce((sum, m) => sum + m.cyclomaticComplexity, 0) / metrics.length,
      nestingDepth: metrics.reduce((sum, m) => sum + m.nestingDepth, 0) / metrics.length,
      maintainabilityIndex: metrics.reduce((sum, m) => sum + m.maintainabilityIndex, 0) / metrics.length,
      riskScore: metrics.reduce((sum, m) => sum + m.riskScore, 0) / metrics.length
    },
    ranges: {
      linesOfCode: {
        min: Math.min(...metrics.map(m => m.linesOfCode)),
        max: Math.max(...metrics.map(m => m.linesOfCode))
      },
      cyclomaticComplexity: {
        min: Math.min(...metrics.map(m => m.cyclomaticComplexity)),
        max: Math.max(...metrics.map(m => m.cyclomaticComplexity))
      },
      nestingDepth: {
        min: Math.min(...metrics.map(m => m.nestingDepth)),
        max: Math.max(...metrics.map(m => m.nestingDepth))
      }
    }
  };
}

function generateFileComparisonInsights(filesData: any[]) {
  const insights = [];
  
  // Find the most and least complex files
  const complexities = filesData.map(f => ({ 
    name: f.filename, 
    complexity: f.cyclomaticComplexity || 0 
  }));
  const mostComplex = complexities.reduce((prev, curr) => 
    curr.complexity > prev.complexity ? curr : prev
  );
  const leastComplex = complexities.reduce((prev, curr) => 
    curr.complexity < prev.complexity ? curr : prev
  );

  insights.push({
    type: 'complexity',
    title: 'Complexity Comparison',
    description: `${mostComplex.name} has the highest complexity (${mostComplex.complexity}), while ${leastComplex.name} has the lowest (${leastComplex.complexity}).`
  });

  // Technology distribution insight
  const technologies = filesData.reduce((acc, f) => {
    acc[f.technologyType] = (acc[f.technologyType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (Object.keys(technologies).length > 1) {
    insights.push({
      type: 'technology',
      title: 'Technology Mix',
      description: `Comparison includes ${Object.keys(technologies).length} different technologies: ${Object.keys(technologies).join(', ')}.`
    });
  }

  return insights;
}

function generateReportComparisonInsights(reportsData: any[]) {
  return [
    {
      type: 'timeline',
      title: 'Report Timeline',
      description: `Comparing reports from ${reportsData.length} different time periods.`
    }
  ];
}

function generateTimeframeComparisonInsights(timeframeData: any[]) {
  return [
    {
      type: 'trend',
      title: 'Analysis Trend',
      description: `Comparing analysis patterns across ${timeframeData.length} time periods.`
    }
  ];
}

function generateFileComparisonChartData(filesData: any[]) {
  return {
    complexity: filesData.map(f => ({
      name: f.filename,
      complexity: f.cyclomaticComplexity || 0,
      linesOfCode: f.linesOfCode || 0
    })),
    maintainability: filesData.map(f => ({
      name: f.filename,
      maintainability: parseFloat(f.maintainabilityIndex || '0'),
      risk: parseFloat(f.riskScore || '0')
    }))
  };
}

function generateReportComparisonChartData(reportsData: any[]) {
  return {
    metrics: reportsData.map(r => ({
      name: r.name,
      totalFiles: r.totalFiles,
      avgComplexity: parseFloat(r.averageComplexity || '0'),
      highComplexityFiles: r.highComplexityFiles
    }))
  };
}

function generateTimeframeComparisonChartData(timeframeData: any[]) {
  return {
    trends: timeframeData.map(t => ({
      period: t.label || t.period,
      totalAnalyses: t.metrics.totalAnalyses,
      avgComplexity: t.metrics.avgComplexity
    }))
  };
}
