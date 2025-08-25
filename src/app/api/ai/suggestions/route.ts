// import { NextRequest, NextResponse } from 'next/server';
// import { db, drizzleDb } from '@/lib/database/connection';
// import { Suggestion } from '@/lib/database/types';

// import { suggestionGenerator } from '@/lib/ai/suggestion-generator';
// import { eq, and, desc } from 'drizzle-orm';
// import * as schema from '@/lib/database/models';
// import { readFile } from 'fs/promises';
// import { join } from 'path';

// export async function POST(request: NextRequest) {
//   try {
//     const { analysisId, fileId, regenerate = false } = await request.json();

//     if (!analysisId && !fileId) {
//       return NextResponse.json(
//         { error: 'Either analysisId or fileId is required' },
//         { status: 400 }
//       );
//     }

//     let targetAnalysisId = analysisId;

//     // If fileId provided, get the latest analysis
//     if (fileId && !analysisId) {
//       const fileAnalyses = await drizzleDb
//         .select()
//         .from(schema.analyses)
//         .where(eq(schema.analyses.fileId, fileId))
//         .orderBy(desc(schema.analyses.analyzedAt))
//         .limit(1);
      
//       if (fileAnalyses.length === 0) {
//         return NextResponse.json(
//           { error: 'No analysis found for this file' },
//           { status: 404 }
//         );
//       }

//       targetAnalysisId = fileAnalyses[0].id;
//     }

//     // Check if suggestions already exist and regenerate is false
//     if (!regenerate) {
//       const existingSuggestions = await drizzleDb
//         .select()
//         .from(schema.suggestions)
//         .where(eq(schema.suggestions.analysisId, targetAnalysisId));

//       if (existingSuggestions.length > 0) {
//         return NextResponse.json({
//           success: true,
//           suggestions: existingSuggestions,
//           fromCache: true,
//         });
//       }
//     }

//     // Get analysis and file data
//     const allAnalyses = await db.analyses.findMany();
//     const analysis = allAnalyses.find(a => a.id === targetAnalysisId);
    
//     if (!analysis) {
//       return NextResponse.json(
//         { error: 'Analysis not found' },
//         { status: 404 }
//       );
//     }

//     const allFiles = await db.files.findMany();
//     const file = allFiles.find(f => f.id === analysis.fileId);
    
//     if (!file) {
//       return NextResponse.json(
//         { error: 'File not found' },
//         { status: 404 }
//       );
//     }

//     // Use the pre-instantiated suggestion generator
//     // (ollamaClient is already imported and used internally by suggestionGenerator)

//     // Read file content (assuming filename as path for mock)
//     const filePath = join(process.env.UPLOAD_DIR || './uploads', file.filename);
//     const fileContent = await readFile(filePath, 'utf-8');

//     // Generate suggestions
//     const generatedSuggestions = await suggestionGenerator.generateSuggestions(
//       fileContent,
//       file.filename,
//       analysis,
//       (analysis.technologyType as 'perl' | 'tibco' | 'pentaho') || 'perl' // Default to 'perl' if technology not specified
//     );

//     // Delete existing suggestions if regenerating
//     if (regenerate) {
//       // For mock database, we would need to implement a delete method
//       // For now, we'll skip deletion as it's not implemented in mock
//       console.log('Regenerating suggestions - would delete existing ones');
//     }

//     // Save new suggestions to database
//     const savedSuggestions = [];
//     for (const suggestion of generatedSuggestions) {
//       const saved = await db.suggestions.create({
//         analysisId: targetAnalysisId,
//         type: suggestion.type,
//         severity: suggestion.severity,
//         category: suggestion.category,
//         startLine: suggestion.startLine,
//         endLine: suggestion.endLine,
//         startColumn: suggestion.startColumn,
//         endColumn: suggestion.endColumn,
//         title: suggestion.title,
//         description: suggestion.description,
//         explanation: suggestion.explanation,
//         codeSnippet: suggestion.codeSnippet,
//         suggestedFix: suggestion.suggestedFix,
//         modernizationApproach: suggestion.modernizationApproach,
//         alternativeSolutions: suggestion.alternativeSolutions,
//         impactScore: suggestion.impactScore,
//         effortEstimate: suggestion.effortEstimate,
//         aiModel: suggestion.aiModel,
//         aiConfidence: suggestion.aiConfidence,
//         aiPromptUsed: suggestion.aiPromptUsed,
//       });

//       savedSuggestions.push(saved);
//     }

//     return NextResponse.json({
//       success: true,
//       suggestions: savedSuggestions,
//       total: savedSuggestions.length,
//       analysisId: targetAnalysisId,
//       regenerated: regenerate,
//     });

//   } catch (error) {
//     console.error('AI suggestions error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const analysisId = searchParams.get('analysisId');
//     const fileId = searchParams.get('fileId');
//     const severity = searchParams.get('severity');
//     const type = searchParams.get('type');
//     const category = searchParams.get('category');

//     if (!analysisId && !fileId) {
//       return NextResponse.json(
//         { error: 'Either analysisId or fileId is required' },
//         { status: 400 }
//       );
//     }

//     let results: Suggestion[] = [];
    
//     if (analysisId) {
//       const allSuggestions = await db.suggestions.findMany();
//       results = allSuggestions.filter(suggestion => suggestion.analysisId === analysisId);
//     } else if (fileId) {
//       // Get suggestions for the latest analysis of this file
//       const allAnalyses = await db.analyses.findMany();
//       const fileAnalyses = allAnalyses.filter(analysis => analysis.fileId === fileId);
      
//       if (fileAnalyses.length === 0) {
//         return NextResponse.json({
//           success: true,
//           suggestions: [],
//           total: 0,
//         });
//       }

//       // Get the latest analysis by sorting by analyzedAt
//       const latestAnalysis = fileAnalyses.sort((a, b) => 
//         new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime()
//       )[0];

//       const allSuggestions = await db.suggestions.findMany();
//       results = allSuggestions.filter(suggestion => suggestion.analysisId === latestAnalysis.id);
//     }

//     // Apply filters
//     if (severity) {
//       results = results.filter(suggestion => suggestion.severity === severity);
//     }
//     if (type) {
//       results = results.filter(suggestion => suggestion.type === type);
//     }
//     if (category) {
//       results = results.filter(suggestion => suggestion.category === category);
//     }

//     // Sort results by createdAt and impactScore
//     results = results.sort((a, b) => {
//       const dateCompare = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
//       if (dateCompare !== 0) return dateCompare;
//       return (b.impactScore || 0) - (a.impactScore || 0);
//     });

//     // Group suggestions by category for better organization
//     const groupedSuggestions = results.reduce((acc, suggestion) => {
//       const category = suggestion.category || 'general';
//       if (!acc[category]) {
//         acc[category] = [];
//       }
//       acc[category].push(suggestion);
//       return acc;
//     }, {} as Record<string, Suggestion[]>);

//     return NextResponse.json({
//       success: true,
//       suggestions: results,
//       grouped: groupedSuggestions,
//       total: results.length,
//       filters: {
//         severity,
//         type,
//         category,
//       },
//     });

//   } catch (error) {
//     console.error('Get suggestions error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }
