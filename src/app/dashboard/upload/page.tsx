'use client';

import { useState, useEffect } from 'react';
// import { DragDropUploader } from '@/components/file-upload/drag-drop-uploader';
import { UploadProgress } from '@/components/file-upload/upload-progress';
import { FilePreview } from '@/components/file-upload/file-preview';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  BarChart3 
} from 'lucide-react';
import Link from 'next/link';
import { DragDropUploader } from '@/components/file-upload/drag-drop-uploader';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'completed' | 'error' | 'analyzed' | 'failed' | 'pending' | 'uploaded';
  progress: number;
  error?: string;
  complexity?: string;
  linesOfCode?: number;
  isAnalyzed?: boolean;
}

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Cleanup polling interval when component unmounts
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);
  
  // Function to poll for file status updates
  const startPollingForFileStatus = () => {
    // Clear any existing polling interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    // Start a new polling interval
    const interval = setInterval(async () => {
      // Only poll if we have files that are not completed or failed
      const processingFiles = uploadedFiles.filter(file => 
        file.status === 'uploading' || 
        file.status === 'uploaded' || 
        file.status === 'processing' || 
        file.status === 'pending'
      );
      
      if (processingFiles.length === 0) {
        // No more files to check, stop polling
        clearInterval(interval);
        setPollingInterval(null);
        return;
      }
      
      try {
        // Fetch latest file statuses from API
        const response = await fetch('/api/files');
        if (!response.ok) {
          throw new Error('Failed to fetch file statuses');
        }
        
        const data = await response.json();
        const apiFiles = data.files || [];
        
        // Update local file statuses based on API response
        let updatedFiles = [...uploadedFiles];
        let filesUpdated = false;
        
        for (const apiFile of apiFiles) {
          // Find matching file in our local state
          const fileIndex = updatedFiles.findIndex(f => f.id === apiFile.id);
          if (fileIndex >= 0) {
            // Map API status to our status format
            let newStatus: UploadedFile['status'] = 'processing';
            let progress = updatedFiles[fileIndex].progress;
            
            switch (apiFile.status) {
              case 'UPLOADED':
              case 'uploaded':
                newStatus = 'uploaded';
                progress = 30;
                break;
              case 'PROCESSING':
              case 'processing':
                newStatus = 'processing';
                progress = 60;
                break;
              case 'ANALYZED':
              case 'analyzed':
                newStatus = 'analyzed'; // Changed from 'completed' to 'analyzed' to match backend
                progress = 100;
                break;
              case 'FAILED':
              case 'failed':
                newStatus = 'failed'; // Changed from 'error' to 'failed' to match backend
                progress = 100;
                break;
            }
            
            // Only update if status has changed
            if (updatedFiles[fileIndex].status !== newStatus) {
              updatedFiles[fileIndex] = {
                ...updatedFiles[fileIndex],
                status: newStatus,
                progress: progress,
                error: apiFile.errorMessage || undefined,
                // Add analysis data if available
                complexity: apiFile.analysis?.complexityLevel,
                linesOfCode: apiFile.analysis?.linesOfCode
              };
              filesUpdated = true;
            }
          }
        }
        
        // Update state if any files were updated
        if (filesUpdated) {
          setUploadedFiles(updatedFiles);
          
          // Update overall progress
          const totalFiles = updatedFiles.length;
          const completedFiles = updatedFiles.filter((f: UploadedFile) => 
            f.status === 'analyzed'
          ).length;
          const errorFiles = updatedFiles.filter((f: UploadedFile) => 
            f.status === 'failed'
          ).length;
          
          setOverallProgress(((completedFiles + errorFiles) / Math.max(1, totalFiles)) * 100);
        }
      } catch (error) {
        console.error('Error polling for file status:', error);
      }
    }, 2000); // Poll every 2 seconds
    
    setPollingInterval(interval);
  };

  const handleFileUpload = async (files: File[]) => {
    const newFiles: UploadedFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.name.split('.').pop() || '',
      status: 'uploading',
      progress: 0,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsAnalyzing(true);

    try {
      // Create FormData for API call
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      // Call the upload API
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      // Handle any errors from the API
      if (response.ok && result.errors && result.errors.length > 0) {
        for (const apiError of result.errors) {
          const matchingFile = newFiles.find((f: UploadedFile) => f.name === apiError.filename);
          if (matchingFile) {
            setUploadedFiles(prev => 
              prev.map((f: UploadedFile) => f.id === matchingFile.id ? { 
                ...f, 
                status: 'error',
                error: apiError.error 
              } : f)
            );
          }
        }
      }

      // Update files based on API response
      if (result.uploadedFiles) {
        for (const apiFile of result.uploadedFiles) {
          const matchingFile = newFiles.find(f => f.name === apiFile.filename);
          if (matchingFile) {
            // Update with real file ID from server and set status based on API response
            setUploadedFiles(prev => 
              prev.map(f => f.id === matchingFile.id ? { 
                ...f, 
                id: apiFile.id, // Use the real file ID from the server
                status: apiFile.status === 'duplicate' ? 'completed' : apiFile.status === 'uploaded' ? 'processing' : apiFile.status,
                error: apiFile.message && apiFile.status !== 'uploaded' ? apiFile.message : undefined,
                progress: apiFile.status === 'duplicate' ? 100 : apiFile.status === 'uploaded' ? 50 : 0
              } : f)
            );
          }
        }
        
        // Start polling for file status updates
        startPollingForFileStatus();
      }
    } catch (error) {
      console.error('Upload failed:', error);
      // Mark all files as failed
      setUploadedFiles(prev => 
        prev.map((f: UploadedFile) => 
          newFiles.some((nf: UploadedFile) => nf.id === f.id) 
            ? { ...f, status: 'error', progress: 0, error: error instanceof Error ? error.message : 'Upload failed' } 
            : f
        )
      );
    } finally {
      setIsAnalyzing(false);
      
      // Calculate overall progress
      const totalFiles = uploadedFiles.length;
      const completedFiles = uploadedFiles.filter((f: UploadedFile) => 
        f.status === 'completed' || f.status === 'analyzed'
      ).length;
      const errorFiles = uploadedFiles.filter((f: UploadedFile) => 
        f.status === 'error' || f.status === 'failed'
      ).length;
      
      setOverallProgress(((completedFiles + errorFiles) / Math.max(1, totalFiles)) * 100);
    }
  };

  const completedFiles = uploadedFiles.filter((f: UploadedFile) => 
    f.isAnalyzed === true
  ).length;
  const processingFiles = uploadedFiles.filter((f: UploadedFile) => 
    f.status === 'processing' || f.status === 'uploading' || f.status === 'pending'
  ).length;
  const errorFiles = uploadedFiles.filter((f: UploadedFile) => 
    f.status === 'failed'
  ).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Upload & Analyze</h1>
              <p className="text-muted-foreground mt-2">
                Upload your legacy code files for comprehensive analysis
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Supported Formats */}
            <Card>
              <CardHeader>
                <CardTitle>Supported File Types</CardTitle>
                <CardDescription>
                  Upload files in the following formats for analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">.pl (Perl Scripts)</Badge>
                  <Badge variant="secondary">.pm (Perl Modules)</Badge>
                  <Badge variant="secondary">.xml (TIBCO XML)</Badge>
                  <Badge variant="secondary">.ktr (Pentaho Transformations)</Badge>
                  <Badge variant="secondary">.kjb (Pentaho Jobs)</Badge>
                  <Badge variant="secondary">.txt (Text Files)</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Upload Area */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Files
                </CardTitle>
                <CardDescription>
                  Drag and drop your files here or click to browse
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DragDropUploader onFileUpload={handleFileUpload} />
              </CardContent>
            </Card>

            {/* Analysis Progress */}
            {uploadedFiles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Progress</CardTitle>
                  <CardDescription>
                    {completedFiles} of {uploadedFiles.length} files analyzed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={overallProgress} className="w-full" />
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center justify-center text-green-600 mb-1">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div className="text-2xl font-bold text-green-600">{completedFiles}</div>
                      <div className="text-sm text-muted-foreground">Completed</div>
                    </div>
                    
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center justify-center text-blue-600 mb-1">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div className="text-2xl font-bold text-blue-600">{processingFiles}</div>
                      <div className="text-sm text-muted-foreground">Processing</div>
                    </div>
                    
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div className="flex items-center justify-center text-red-600 mb-1">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                      <div className="text-2xl font-bold text-red-600">{errorFiles}</div>
                      <div className="text-sm text-muted-foreground">Errors</div>
                    </div>
                  </div>

                  {completedFiles > 0 && (
                    <div className="pt-4">
                      <Link href="/">
                        <Button className="w-full">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          View Analysis Results
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - File List & Info */}
          <div className="space-y-6">
            {/* Upload Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <FileText className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div className="text-sm">
                    <div className="font-medium">Multiple Files</div>
                    <div className="text-muted-foreground">Upload multiple files at once for batch analysis</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div className="text-sm">
                    <div className="font-medium">Duplicate Detection</div>
                    <div className="text-muted-foreground">Duplicate files are automatically detected and skipped</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <BarChart3 className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div className="text-sm">
                    <div className="font-medium">Real-time Analysis</div>
                    <div className="text-muted-foreground">View results as files are processed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Uploaded Files</CardTitle>
                  <CardDescription>
                    {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} in queue
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                  {uploadedFiles.map(file => (
                    <FilePreview key={file.id} file={file} />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Analysis Info */}
            <Card>
              <CardHeader>
                <CardTitle>What We Analyze</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Code Metrics</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li> Lines of Code (LOC)</li>
                    <li> Cyclomatic Complexity</li>
                    <li> Nesting Depth</li>
                    <li> Function Count</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Quality Assessment</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li> Maintainability Index</li>
                    <li> Risk Score</li>
                    <li> Dependencies</li>
                    <li> SQL Complexity</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">AI Insights</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li> Refactoring suggestions</li>
                    <li> Security recommendations</li>
                    <li> Modernization paths</li>
                    <li> Performance tips</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
