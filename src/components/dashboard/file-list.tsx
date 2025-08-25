'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Clock, CheckCircle, AlertCircle, Eye } from 'lucide-react';

interface FileItem {
  id: string;
  filename: string;
  fileType: string;
  analyzedAt: string;
  complexityLevel: string;
  linesOfCode: number;
}

interface FileListProps {
  files?: FileItem[];
  title?: string;
  description?: string;
  maxItems?: number;
}

export function FileList({ 
  files, 
  title = "Recent Files", 
  description = "Latest analyzed files",
  maxItems = 5 
}: FileListProps) {
  // Use provided files or empty array if none provided
  const fileData = files || [];

  // Process files to match the component's expected format
  const processedFiles = fileData.map(file => {
    // Extract file extension from filename
    const fileExtension = file.fileType || file.filename.split('.').pop() || '';
    
    // Format date string (assuming analyzedAt is an ISO date string)
    const analyzedDate = new Date(file.analyzedAt);
    const now = new Date();
    const diffMs = now.getTime() - analyzedDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    let timeString;
    if (diffHours < 1) {
      timeString = 'Just now';
    } else if (diffHours < 24) {
      timeString = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      timeString = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
    
    return {
      id: file.id,
      name: file.filename,
      type: fileExtension,
      size: '~', // Size not provided in API data
      status: 'analyzed' as const,
      complexity: file.complexityLevel.toLowerCase(),
      linesOfCode: file.linesOfCode,
      analyzedAt: timeString
    };
  });

  const displayFiles = processedFiles.slice(0, maxItems);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'analyzed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getComplexityColor = (complexity?: string) => {
    switch (complexity) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'critical':
        return 'bg-red-200 text-red-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pl':
      case 'pm':
        return '🐪'; // Perl
      case 'xml':
        return '🔧'; // TIBCO
      case 'ktr':
      case 'kjb':
        return '🔄'; // Pentaho
      default:
        return '📄';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(file.status)}
                  <span className="text-lg">{getFileTypeIcon(file.type)}</span>
                </div>
                <div>
                  <h4 className="font-medium text-sm">{file.name}</h4>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>{file.size}</span>
                    {file.linesOfCode && (
                      <>
                        <span>•</span>
                        <span>{file.linesOfCode} LOC</span>
                      </>
                    )}
                    <span>•</span>
                    <span>{file.analyzedAt}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {file.complexity && (
                  <Badge className={getComplexityColor(file.complexity)}>
                    {file.complexity}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  .{file.type}
                </Badge>
                {file.status === 'analyzed' && (
                  <Button variant="ghost" size="sm" className="h-8">
                    <Eye className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {processedFiles.length > maxItems && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              View All Files ({fileData.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}