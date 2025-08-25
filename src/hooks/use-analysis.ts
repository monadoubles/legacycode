// 'use client';

// import { useState, useCallback, useEffect } from 'react';
// import { AnalysisResult as SimpleAnalysisResult } from '@/lib/types';
// import { AnalysisResult } from '@/lib/types/analysis';
// import { AnalysisProgress, BatchAnalysisResult } from '@/lib/types/analysis';

// export interface UseAnalysisReturn {
//   // State
//   isAnalyzing: boolean;
//   progress: AnalysisProgress[];
//   results: AnalysisResult[];
//   currentBatch: BatchAnalysisResult | null;
//   error: string | null;
  
//   // Actions
//   analyzeFiles: (fileIds: string[]) => Promise<void>;
//   analyzeFile: (fileId: string) => Promise<AnalysisResult | null>;
//   cancelAnalysis: (fileId?: string) => void;
//   clearResults: () => void;
//   retryFailedAnalysis: (fileId: string) => Promise<void>;
  
//   // Getters
//   getAnalysisResult: (fileId: string) => AnalysisResult | undefined;
//   getAnalysisProgress: (fileId: string) => AnalysisProgress | undefined;
//   isFileAnalyzing: (fileId: string) => boolean;
//   hasErrors: boolean;
//   completedCount: number;
//   failedCount: number;
// }

// export function useAnalysis(): UseAnalysisReturn {
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [progress, setProgress] = useState<AnalysisProgress[]>([]);
//   const [results, setResults] = useState<AnalysisResult[]>([]);
//   const [currentBatch, setCurrentBatch] = useState<BatchAnalysisResult | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [abortController, setAbortController] = useState<AbortController | null>(null);

//   // Analyze multiple files
//   const analyzeFiles = useCallback(async (fileIds: string[]) => {
//     if (isAnalyzing) {
//       throw new Error('Analysis already in progress');
//     }

//     setIsAnalyzing(true);
//     setError(null);
//     setCurrentBatch(null);

//     const controller = new AbortController();
//     setAbortController(controller);

//     try {
//       // Initialize progress for all files
//       const initialProgress: AnalysisProgress[] = fileIds.map(fileId => ({
//         fileId,
//         filename: `file-${fileId}`, // Would be fetched from file metadata
//         status: 'queued',
//         progress: 0,
//         currentStep: 'Queued for analysis'
//       }));

//       setProgress(initialProgress);

//       // Create batch
//       const batchId = `batch-${Date.now()}`;
//       const batch: BatchAnalysisResult = {
//         batchId,
//         fileIds,
//         status: 'running',
//         results: [],
//         summary: {
//           totalFiles: fileIds.length,
//           analyzedFiles: 0,
//           failedFiles: 0,
//           averageComplexity: 0,
//           highRiskFiles: 0,
//           totalIssues: 0,
//           criticalIssues: 0
//         },
//         startedAt: new Date()
//       };

//       setCurrentBatch(batch);

//       // Process files sequentially to avoid overwhelming the system
//       const batchResults: AnalysisResult[] = [];

//       for (let i = 0; i < fileIds.length; i++) {
//         if (controller.signal.aborted) {
//           throw new Error('Analysis cancelled');
//         }

//         const fileId = fileIds[i];
        
//         // Update progress to analyzing
//         setProgress(prev => prev.map(p => 
//           p.fileId === fileId 
//             ? { ...p, status: 'analyzing', currentStep: 'Starting analysis...', startedAt: new Date() }
//             : p
//         ));

//         try {
//           const result = await analyzeFileInternal(fileId, controller.signal, (step, progress) => {
//             setProgress(prev => prev.map(p => 
//               p.fileId === fileId 
//                 ? { ...p, currentStep: step, progress }
//                 : p
//             ));
//           });

//           if (result) {
//             batchResults.push(result);
            
//             // Update progress to completed
//             setProgress(prev => prev.map(p => 
//               p.fileId === fileId 
//                 ? { ...p, status: 'completed', progress: 100, completedAt: new Date() }
//                 : p
//             ));
//           }
//         } catch (fileError) {
//           console.error(`Analysis failed for file ${fileId}:`, fileError);
          
//           // Update progress to failed
//           setProgress(prev => prev.map(p => 
//             p.fileId === fileId 
//               ? { 
//                   ...p, 
//                   status: 'failed', 
//                   error: fileError instanceof Error ? fileError.message : 'Unknown error',
//                   completedAt: new Date()
//                 }
//               : p
//           ));
//         }
//       }

//       // Update batch with final results
//       const finalBatch: BatchAnalysisResult = {
//         ...batch,
//         status: 'completed',
//         results: batchResults,
//         summary: {
//           totalFiles: fileIds.length,
//           analyzedFiles: batchResults.length,
//           failedFiles: fileIds.length - batchResults.length,
//           averageComplexity: batchResults.length > 0 
//             ? batchResults.reduce((sum: any, r: any) => sum + r.metrics.cyclomaticComplexity, 0) / batchResults.length
//             : 0,
//           highRiskFiles: batchResults.filter((r: any) => r.metrics.riskScore > 70).length,
//           totalIssues: batchResults.reduce((sum: any, r: any) => sum + r.metrics.securityIssues.length + r.metrics.performanceIssues.length, 0),
//           criticalIssues: batchResults.reduce((sum: any, r: any) => 
//             sum + r.metrics.securityIssues.filter((i: any) => i.severity === 'critical').length +
//             r.metrics.performanceIssues.filter((i: any) => i.severity === 'critical').length, 0)
//         },
//         completedAt: new Date(),
//         processingTime: Date.now() - batch.startedAt.getTime()
//       };

//       setCurrentBatch(finalBatch);
//       setResults(prev => [...prev, ...batchResults]);

//     } catch (analysisError) {
//       setError(analysisError instanceof Error ? analysisError.message : 'Analysis failed');
      
//       // Mark remaining files as failed
//       setProgress(prev => prev.map(p => 
//         p.status === 'queued' || p.status === 'analyzing'
//           ? { ...p, status: 'failed', error: 'Batch analysis cancelled' }
//           : p
//       ));
//     } finally {
//       setIsAnalyzing(false);
//       setAbortController(null);
//     }
//   }, [isAnalyzing]);

//   // Analyze single file
//   const analyzeFile = useCallback(async (fileId: string): Promise<AnalysisResult | null> => {
//     try {
//       const controller = new AbortController();
//       const result = await analyzeFileInternal(fileId, controller.signal);
      
//       if (result) {
//         setResults(prev => {
//           const filtered = prev.filter(r => r.fileId !== fileId);
//           return [...filtered, result];
//         });
//       }
      
//       return result;
//     } catch (error) {
//       setError(error instanceof Error ? error.message : 'Single file analysis failed');
//       return null;
//     }
//   }, []);

//   // Cancel analysis
//   const cancelAnalysis = useCallback((fileId?: string) => {
//     if (fileId) {
//       // Cancel specific file
//       setProgress(prev => prev.map(p => 
//         p.fileId === fileId && (p.status === 'queued' || p.status === 'analyzing')
//           ? { ...p, status: 'cancelled' }
//           : p
//       ));
//     } else {
//       // Cancel all
//       if (abortController) {
//         abortController.abort();
//       }
//       setIsAnalyzing(false);
//       setProgress(prev => prev.map(p => 
//         p.status === 'queued' || p.status === 'analyzing'
//           ? { ...p, status: 'cancelled' }
//           : p
//       ));
//     }
//   }, [abortController]);

//   // Clear results
//   const clearResults = useCallback(() => {
//     setResults([]);
//     setProgress([]);
//     setCurrentBatch(null);
//     setError(null);
//   }, []);

//   // Retry failed analysis
//   const retryFailedAnalysis = useCallback(async (fileId: string) => {
//     const failedProgress = progress.find(p => p.fileId === fileId && p.status === 'failed');
//     if (!failedProgress) {
//       throw new Error('No failed analysis found for this file');
//     }

//     setProgress(prev => prev.map(p => 
//       p.fileId === fileId 
//         ? { ...p, status: 'queued', error: undefined, progress: 0 }
//         : p
//     ));

//     await analyzeFile(fileId);
//   }, [progress, analyzeFile]);

//   // Helper functions
//   const getAnalysisResult = useCallback((fileId: string) => {
//     return results.find(r => r.fileId === fileId);
//   }, [results]);

//   const getAnalysisProgress = useCallback((fileId: string) => {
//     return progress.find(p => p.fileId === fileId);
//   }, [progress]);

//   const isFileAnalyzing = useCallback((fileId: string) => {
//     const fileProgress = progress.find(p => p.fileId === fileId);
//     return fileProgress?.status === 'analyzing';
//   }, [progress]);

//   // Computed values
//   const hasErrors = progress.some(p => p.status === 'failed') || error !== null;
//   const completedCount = progress.filter(p => p.status === 'completed').length;
//   const failedCount = progress.filter(p => p.status === 'failed').length;

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (abortController) {
//         abortController.abort();
//       }
//     };
//   }, [abortController]);

//   return {
//     // State
//     isAnalyzing,
//     progress,
//     results,
//     currentBatch,
//     error,
    
//     // Actions
//     analyzeFiles,
//     analyzeFile,
//     cancelAnalysis,
//     clearResults,
//     retryFailedAnalysis,
    
//     // Getters
//     getAnalysisResult,
//     getAnalysisProgress,
//     isFileAnalyzing,
//     hasErrors,
//     completedCount,
//     failedCount
//   };
// }

// // Internal function to analyze a single file
// async function analyzeFileInternal(
//   fileId: string,
//   signal: AbortSignal,
//   onProgress?: (step: string, progress: number) => void
// ): Promise<AnalysisResult | null> {
//   onProgress?.('Initializing analysis...', 10);

//   const response = await fetch('/api/analyze', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({ fileIds: [fileId] }),
//     signal
//   });

//   if (!response.ok) {
//     throw new Error(`Analysis failed: ${response.statusText}`);
//   }

//   onProgress?.('Processing file...', 50);

//   const data = await response.json();

//   onProgress?.('Generating insights...', 80);

//   if (!data.success || !data.results || data.results.length === 0) {
//     throw new Error('No analysis results returned');
//   }

//   onProgress?.('Analysis complete', 100);

//   return data.results[0];
// }
