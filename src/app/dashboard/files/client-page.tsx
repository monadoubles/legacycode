'use client';

import { useState, useEffect } from 'react';
import { FileStatus } from '@/lib/database/models/file';
import { formatBytes, formatRelativeTime, getStatusIcon, getStatusColor } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  FileText, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  BarChart3,
  Loader2
} from 'lucide-react';

// Type definitions
interface Analysis {
  id: string;
  fileId: string;
  linesOfCode: number;
  cyclomaticComplexity: number;
  complexityLevel: string;
  createdAt: string;
  updatedAt: string;
}

interface File {
  id: string;
  filename: string;
  originalPath: string;
  fileSize: number;
  fileType: string;
  contentHash: string;
  status: keyof typeof FileStatus | string;
  processingStartedAt: string | null;
  processingCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isAnalyzed: boolean;
  isArchived: boolean;
  hasErrors: boolean;
  errorMessage: string | null;
  analysis?: Analysis | null;
}

interface FilesResponse {
  files: File[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    fileTypes: string[];
    statuses: string[];
  };
  stats: {
    totalFiles: number;
    totalSize: number;
    analyzedFiles: number;
    failedFiles: number;
    pendingFiles: number;
    processingFiles: number;
    uploadingFiles: number;
  };
}

export default function FilesClientPage() {
  const [filesData, setFilesData] = useState<FilesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(new Set());

  // Function to fetch files data
  const fetchFiles = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/files');
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      const data = await response.json();
      setFilesData(data);
      setError(null);
      
      // Track which files are still processing or uploaded
      const processing = new Set<string>();
      data.files.forEach((file: File) => {
        // Check for both string values and FileStatus enum values
        // Include PENDING status as well
        console.log(file,"file")
        const status = file.status.toLowerCase();
        if (
          status === FileStatus.PROCESSING.toLowerCase() || 
          status === FileStatus.UPLOADED.toLowerCase() || 
          status === FileStatus.PENDING.toLowerCase() || 
          status === 'processing' || 
          status === 'uploaded' || 
          status === 'pending'
        ) {
          processing.add(file.id);
          console.log(`File ${file.filename} is still processing with status: ${file.status}`);
        } else {
          console.log(`File ${file.filename} has status: ${file.status}`);
        }
      });
      
      console.log(`Found ${processing.size} files still processing`);
      setProcessingFiles(processing);
      
      return processing.size > 0; // Return true if there are still processing files
    } catch (err) {
      setError('Error fetching files: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Function to trigger analysis for a file
  const analyzeFile = async (fileId: string) => {
    try {
      setProcessingFiles(prev => new Set(prev).add(fileId));
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to trigger analysis');
      }
      
      // Refresh files data after triggering analysis
      await fetchFiles();
    } catch (err) {
      setError('Error triggering analysis: ' + (err instanceof Error ? err.message : String(err)));
      setProcessingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  // Function to re-analyze a file
  const reanalyzeFile = async (fileId: string) => {
    try {
      setProcessingFiles(prev => new Set(prev).add(fileId));
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-force-reanalysis': 'true',
        },
        body: JSON.stringify({ fileId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to trigger re-analysis');
      }
      
      // Refresh files data after triggering analysis
      await fetchFiles();
    } catch (err) {
      setError('Error triggering re-analysis: ' + (err instanceof Error ? err.message : String(err)));
      setProcessingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchFiles();
  }, []);

  // Polling for updates if there are processing files
  useEffect(() => {
    if (processingFiles.size === 0) {
      // If no files are processing, do a single check after a delay
      // This helps catch files that might have just been uploaded
      const checkTimer = setTimeout(() => {
        fetchFiles();
      }, 3000);
      
      return () => clearTimeout(checkTimer);
    }
    
    // Immediate fetch to get latest status
    fetchFiles();
    
    // Set up polling interval
    const interval = setInterval(async () => {
      const stillProcessing = await fetchFiles();
      console.log(`Polling: ${stillProcessing ? 'Still processing files' : 'No more processing files'}`);
      
      if (!stillProcessing) {
        // Do one final check after a short delay to ensure we have the latest data
        setTimeout(() => {
          fetchFiles();
        }, 1000);
      }
    }, 2000); // Poll every 2 seconds
    
    return () => clearInterval(interval);
  }, [processingFiles.size]); // Depend on size instead of the Set object itself

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading files...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <div className="flex">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!filesData || filesData.files.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md bg-muted/50">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No files found</h3>
        <p className="mt-2 text-muted-foreground">
          Upload some files to get started with analysis.
        </p>
        <Button className="mt-4" asChild>
          <a href="/dashboard/upload">Upload Files</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Files</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fetchFiles()}
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Total Files</span>
          </div>
          <div className="mt-2 text-2xl font-bold">{filesData.stats.totalFiles}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {formatBytes(filesData.stats.totalSize)}
          </div>
        </div>
        
        <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium">Analyzed</span>
          </div>
          <div className="mt-2 text-2xl font-bold">{filesData.stats.analyzedFiles}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {Math.round((filesData.stats.analyzedFiles / filesData.stats.totalFiles) * 100)}% complete
          </div>
        </div>
        
        <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-medium">Processing</span>
          </div>
          <div className="mt-2 text-2xl font-bold">{filesData.stats.processingFiles}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Files currently being analyzed
          </div>
        </div>
        
        <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium">Failed</span>
          </div>
          <div className="mt-2 text-2xl font-bold">{filesData.stats.failedFiles}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Files with analysis errors
          </div>
        </div>
      </div>

      <Table>
        <TableCaption>A list of all uploaded files and their analysis status.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>File</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Complexity</TableHead>
            <TableHead>Lines of Code</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filesData.files.map((file) => (
            <TableRow key={file.id}>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{file.filename}</span>
                </div>
                <span className="text-xs text-muted-foreground block mt-1">
                  {file.fileType}
                </span>
              </TableCell>
              <TableCell>{formatBytes(file.fileSize)}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(file.status)} flex items-center gap-1`}
                  >
                    {processingFiles.has(file.id) ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <span className="h-3 w-3" dangerouslySetInnerHTML={{ __html: getStatusIcon(String(file.status)) }} />
                    )}
                    {processingFiles.has(file.id) ? 'Processing' : String(file.status)}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                {file.analysis ? (
                  <Badge variant="outline" className={`${file.analysis.complexityLevel === 'high' ? 'text-red-500 bg-red-50' : file.analysis.complexityLevel === 'medium' ? 'text-amber-500 bg-amber-50' : 'text-green-500 bg-green-50'}`}>
                    {file.analysis.complexityLevel}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </TableCell>
              <TableCell>
                {file.analysis ? (
                  file.analysis.linesOfCode.toLocaleString()
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                {file.isAnalyzed ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => reanalyzeFile(file.id)}
                    disabled={processingFiles.has(file.id)}
                  >
                    {processingFiles.has(file.id) ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <RefreshCw className="h-3 w-3 mr-1" />
                    )}
                    Re-analyze
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => analyzeFile(file.id)}
                    disabled={processingFiles.has(file.id)}
                  >
                    {processingFiles.has(file.id) ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <BarChart3 className="h-3 w-3 mr-1" />
                    )}
                    Analyze
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
