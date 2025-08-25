'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  X, 
  Pause, 
  Play,
  StopCircle,
  RefreshCw
} from 'lucide-react';

export interface UploadProgressItem {
  id: string;
  fileName: string;
  fileSize: number;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed' | 'cancelled' | 'paused';
  speed?: number; // bytes per second
  timeRemaining?: number; // seconds
  error?: string;
  startTime?: Date;
  endTime?: Date;
}

export interface UploadProgressProps {
  items: UploadProgressItem[];
  totalProgress?: number;
  showIndividualProgress?: boolean;
  showSpeed?: boolean;
  showTimeRemaining?: boolean;
  allowCancel?: boolean;
  allowPause?: boolean;
  allowRetry?: boolean;
  onCancel?: (id: string) => void;
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onRetry?: (id: string) => void;
  onCancelAll?: () => void;
  className?: string;
}

export function UploadProgress({
  items,
  totalProgress,
  showIndividualProgress = true,
  showSpeed = true,
  showTimeRemaining = true,
  allowCancel = true,
  allowPause = false,
  allowRetry = true,
  onCancel,
  onPause,
  onResume,
  onRetry,
  onCancelAll,
  className = ''
}: UploadProgressProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    return `${formatFileSize(bytesPerSecond)}/s`;
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.round(seconds % 60);
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'cancelled':
        return <StopCircle className="w-4 h-4 text-gray-600" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-600" />;
      case 'uploading':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      uploading: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    };
    return colors[status as keyof typeof colors];
  };

  const calculateElapsedTime = (startTime?: Date): string => {
    if (!startTime) return '';
    const elapsed = (currentTime.getTime() - startTime.getTime()) / 1000;
    return formatTime(elapsed);
  };

  const completedCount = items.filter(item => item.status === 'completed').length;
  const failedCount = items.filter(item => item.status === 'failed').length;
  const uploadingCount = items.filter(item => item.status === 'uploading').length;
  const totalCount = items.length;

  const overallProgress = totalProgress !== undefined 
    ? totalProgress 
    : totalCount > 0 
      ? (completedCount / totalCount) * 100 
      : 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overall Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Upload Progress
            </h3>
            <Badge variant="outline">
              {completedCount}/{totalCount}
            </Badge>
          </div>
          
          {onCancelAll && uploadingCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancelAll}
            >
              Cancel All
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-blue-600">{uploadingCount}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Uploading</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-red-600">{failedCount}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Failed</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-gray-600">{totalCount}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
          </div>
        </div>
      </div>

      {/* Individual File Progress */}
      {showIndividualProgress && items.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
            File Details
          </h4>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {getStatusIcon(item.status)}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {item.fileName}
                    </span>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                    <span>{formatFileSize(item.fileSize)}</span>
                    
                    {item.status === 'uploading' && item.speed && showSpeed && (
                      <span>{formatSpeed(item.speed)}</span>
                    )}
                    
                    {item.status === 'uploading' && item.timeRemaining && showTimeRemaining && (
                      <span>{formatTime(item.timeRemaining)} remaining</span>
                    )}
                    
                    {item.startTime && ['uploading', 'completed'].includes(item.status) && (
                      <span>Elapsed: {calculateElapsedTime(item.startTime)}</span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {['uploading', 'completed'].includes(item.status) && (
                    <div className="space-y-1">
                      <Progress 
                        value={item.progress} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs">
                        <span>{Math.round(item.progress)}%</span>
                        {item.status === 'uploading' && (
                          <span>
                            {formatFileSize((item.progress / 100) * item.fileSize)} / {formatFileSize(item.fileSize)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {item.status === 'failed' && item.error && (
                    <div className="text-xs text-red-600 dark:text-red-400">
                      {item.error}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  {item.status === 'uploading' && allowPause && onPause && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPause(item.id)}
                    >
                      <Pause className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {item.status === 'paused' && onResume && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onResume(item.id)}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {item.status === 'failed' && allowRetry && onRetry && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRetry(item.id)}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {['uploading', 'pending', 'paused'].includes(item.status) && allowCancel && onCancel && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCancel(item.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Simplified progress indicator for smaller spaces
export function CompactUploadProgress({ 
  progress, 
  status, 
  fileName 
}: { 
  progress: number; 
  status: string;
  fileName?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="truncate">{fileName || 'Uploading...'}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}

// Progress indicator for single file upload
export function SingleFileProgress({
  fileName,
  fileSize,
  progress,
  status,
  speed,
  timeRemaining,
  error
}: {
  fileName: string;
  fileSize: number;
  progress: number;
  status: string;
  speed?: number;
  timeRemaining?: number;
  error?: string;
}) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex items-center gap-2">
        {status === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
        {status === 'failed' && <AlertCircle className="w-5 h-5 text-red-600" />}
        {status === 'uploading' && <Clock className="w-5 h-5 text-blue-600" />}
        
        <div className="flex-1">
          <div className="font-medium text-gray-900 dark:text-gray-100">{fileName}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {formatFileSize(fileSize)}
            {speed && status === 'uploading' && (
              <span> • {formatFileSize(speed)}/s</span>
            )}
            {timeRemaining && status === 'uploading' && (
              <span> • {formatTime(timeRemaining)} remaining</span>
            )}
          </div>
        </div>
      </div>

      {status !== 'pending' && (
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
