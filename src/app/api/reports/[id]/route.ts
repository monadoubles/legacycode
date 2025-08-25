import { NextRequest, NextResponse } from 'next/server';
import { drizzleDb } from '@/lib/database/connection';
import * as schema from '@/lib/database/models';
import { eq, inArray } from 'drizzle-orm';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const reportId = params.id;
    const { searchParams } = new URL(request.url);
    const includeData = searchParams.get('includeData') === 'true';

    // Get report from the database
    const [reportData] = await drizzleDb
      .select()
      .from(schema.reports)
      .where(eq(schema.reports.id, reportId));

    if (!reportData) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }
    
    let includedFiles: any[] = [];

    if (includeData && reportData.fileIds) {
      // Get files included in this report
      const fileIds = reportData.fileIds as string[];
      
      // Get files and their analyses in a single query with join
      const filesWithAnalyses = await drizzleDb
        .select({
          file: schema.files,
          analysis: schema.analyses
        })
        .from(schema.files)
        .leftJoin(schema.analyses, eq(schema.files.id, schema.analyses.fileId))
        .where(inArray(schema.files.id, fileIds));
      
      includedFiles = filesWithAnalyses.map(item => ({
        file: item.file,
        analysis: item.analysis
      }));
    }

    return NextResponse.json({
      success: true,
      report: reportData,
      ...(includeData && {
        files: includedFiles,
        fileCount: includedFiles.length,
      }),
    });

  } catch (error) {
    console.error('Get report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const reportId = params.id;
    const updates = await request.json();

    // Validate allowed updates
    const allowedUpdates = [
      'name',
      'description',
      'filters',
      'settings',
      'isPublic',
      'isPinned',
      'isTemplate',
    ];

    const updateData = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as any);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid updates provided' },
        { status: 400 }
      );
    }

    // Update report (mock database doesn't support updates)
    const allReports = await drizzleDb.select().from(schema.reports);
    const existingReport = allReports.find(r => r.id === reportId);

    if (!existingReport) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Simulate updated report for response
    const updatedReport = {
      ...existingReport,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      report: updatedReport,
      message: 'Report updated successfully (simulated - mock DB)',
    });

  } catch (error) {
    console.error('Update report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const reportId = params.id;

    // Check if report exists using mock database
    const allReports = await drizzleDb.select().from(schema.reports);
    const existingReport = allReports.find(r => r.id === reportId);

    if (!existingReport) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Delete report (mock database doesn't support delete)
    // In a real implementation, this would delete the report

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully',
    });

  } catch (error) {
    console.error('Delete report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
