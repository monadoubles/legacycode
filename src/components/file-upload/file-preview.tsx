'use client';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertCircle, FileText, Loader2 } from 'lucide-react';

interface FilePreviewProps {
  file: {
    id: string;
    name: string;
    size: number;
    type: string;
    status: 'uploading' | 'processing' | 'completed' | 'error' | 'analyzed' | 'failed' | 'pending' | 'uploaded' | 'duplicate';
    progress: number;
    error?: string;
    complexity?: string;
    linesOfCode?: number;
  };
}

export function FilePreview({ file }: FilePreviewProps) {
  const getStatusIcon = () => {
    switch (file.status) {
      case 'uploading':
      case 'uploaded':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'processing':
      case 'pending':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'completed':
      case 'analyzed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    switch (file.status) {
      case 'uploading':
        return 'Uploading...';
      case 'uploaded':
        return 'Uploaded';
      case 'processing':
        return 'Analyzing...';
      case 'pending':
        return 'Pending';
      case 'analyzed':
        return 'Analyzed';
      case 'failed':
        return 'Failed';
      case 'completed':
        return 'Completed';
      default:
        return 'Pending';
    }
  };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pl':
      case 'pm':
        return '🐪';
      case 'xml':
        return '🔧';
      case 'ktr':
      case 'kjb':
        return '🔄';
      default:
        return '📄';
    }
  };

  const getComplexityColor = (complexity: string) => {
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

  return (
    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-shrink-0 text-2xl">
        {getFileTypeIcon(file.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium truncate" title={file.name}>
            {file.name}
          </h4>
          {getStatusIcon()}
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground">
            {formatBytes(file.size)}
          </span>
          <span className="text-xs text-muted-foreground">
            {getStatusText()}
          </span>
        </div>
        
        {(file.status === 'uploading' || file.status === 'processing') && (
          <Progress value={file.progress} className="h-1 mt-2" />
        )}
        
        {file.status === 'completed' && (
          <div className="flex items-center justify-between mt-2">
            {file.complexity && (
              <Badge className={getComplexityColor(file.complexity)}>
                {file.complexity} complexity
              </Badge>
            )}
            {file.linesOfCode && (
              <span className="text-xs text-muted-foreground">
                {file.linesOfCode} LOC
              </span>
            )}
          </div>
        )}
        
        {file.status === 'error' && file.error && (
          <p className="text-xs text-red-500 mt-1" title={file.error}>
            {file.error.length > 50 ? `${file.error.slice(0, 50)}...` : file.error}
          </p>
        )}
      </div>
    </div>
  );
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}