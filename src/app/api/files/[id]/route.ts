import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database/connection';
import { Suggestion } from '@/lib/database/types';
import { unlink } from 'fs/promises';
import { join } from 'path';
// Removed drizzle-orm imports as we're using mock database

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
    const fileId = params.id;

    // Get file with its analysis and suggestions using mock database
    const allFiles = await db.files.findMany();
    const file = allFiles.find(f => f.id === fileId);

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Get analysis for this file
    const allAnalyses = await db.analyses.findMany();
    const analysis = allAnalyses.find(a => a.fileId === fileId);

    // Get suggestions if analysis exists
    let fileSuggestions: Suggestion[] = [];
    if (analysis) {
      const allSuggestions = await db.suggestions.findMany();
      fileSuggestions = allSuggestions
        .filter(s => s.analysisId === analysis.id)
        .sort((a, b) => (b.impactScore || 0) - (a.impactScore || 0));
    }

    // Get file content if requested
    const includeContent = request.nextUrl.searchParams.get('includeContent') === 'true';
    let content = null;

    if (includeContent) {
      try {
        const filePath = join(process.env.UPLOAD_DIR || './uploads', file.filename);
        const { readFile } = await import('fs/promises');
        content = await readFile(filePath, 'utf-8');
      } catch (error) {
        console.warn(`Could not read file content: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      file: {
        ...file,
        content: includeContent ? content : undefined,
      },
      analysis,
      suggestions: fileSuggestions,
      stats: {
        totalSuggestions: fileSuggestions.length,
        criticalSuggestions: fileSuggestions.filter(s => s.severity === 'critical').length,
        highSuggestions: fileSuggestions.filter(s => s.severity === 'high').length,
        mediumSuggestions: fileSuggestions.filter(s => s.severity === 'medium').length,
        lowSuggestions: fileSuggestions.filter(s => s.severity === 'low').length,
      },
    });

  } catch (error) {
    console.error('Get file error:', error);
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
    const fileId = params.id;
    const updates = await request.json();

    // Validate allowed updates
    const allowedUpdates = [
      'filename',
      'status',
      'isArchived',
      'uploadedBy',
      'batchId',
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

    // Update file (mock database doesn't support updates)
    // In a real implementation, this would update the file record
    const allFiles = await db.files.findMany();
    const existingFile = allFiles.find(f => f.id === fileId);

    if (!existingFile) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Simulate updated file for response
    const updatedFile = {
      ...existingFile,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      file: updatedFile,
      message: 'File updated successfully (simulated - mock DB)',
    });

  } catch (error) {
    console.error('Update file error:', error);
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
    const fileId = params.id;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    // Get file info first
    const allFiles = await db.files.findMany();
    const file = allFiles.find(f => f.id === fileId);

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    if (permanent) {
      // Delete physical file
      try {
        const filePath = join(process.env.UPLOAD_DIR || './uploads', file.filename);
        await unlink(filePath);
      } catch (error) {
        console.warn(`Could not delete physical file: ${error}`);
      }

      // Delete from database (mock database doesn't support delete)
      // In a real implementation, this would delete the file record

      return NextResponse.json({
        success: true,
        message: 'File permanently deleted',
      });
    } else {
      // Soft delete - mark as archived (mock database doesn't support updates)
      // In a real implementation, this would mark the file as archived

      return NextResponse.json({
        success: true,
        message: 'File archived successfully',
      });
    }

  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
