'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface DragDropUploaderProps {
  onFileUpload: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  className?: string;
}

export function DragDropUploader({
  onFileUpload,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024,
  className,
}: DragDropUploaderProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setUploadError(null);

    if (rejectedFiles.length > 0) {
      const errorMessages = rejectedFiles.map(({ file, errors }) => {
        const errorType = errors[0]?.code;
        switch (errorType) {
          case 'file-too-large':
            return `${file.name} is too large`;
          case 'file-invalid-type':
            return `${file.name} is not a supported file type`;
          default:
            return `${file.name} could not be uploaded`;
        }
      });
      setUploadError(errorMessages.join(', '));
      return;
    }

    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/x-perl': ['.pl', '.pm'],
      'application/xml': ['.xml'],
      'text/plain': ['.txt', '.log'],
      'application/octet-stream': ['.ktr', '.kjb'],
    },
    maxFiles,
    maxSize,
    multiple: true,
  });

  return (
    <div className={cn('space-y-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          'hover:bg-muted/50',
          isDragActive && !isDragReject ? 'border-primary bg-primary/5' : '',
          isDragReject ? 'border-destructive bg-destructive/5' : '',
          !isDragActive ? 'border-muted-foreground/25' : ''
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          <div className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center',
            isDragActive && !isDragReject ? 'bg-primary text-primary-foreground' : '',
            isDragReject ? 'bg-destructive text-destructive-foreground' : '',
            !isDragActive ? 'bg-muted text-muted-foreground' : ''
          )}>
            {isDragReject ? (
              <AlertCircle className="w-8 h-8" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {isDragActive
                ? isDragReject
                  ? 'Invalid file type'
                  : 'Drop files here'
                : 'Upload Legacy Code Files'
              }
            </h3>
            
            <p className="text-sm text-muted-foreground">
              {isDragActive
                ? 'Release to upload files'
                : 'Drag & drop files here, or click to browse'
              }
            </p>
            
            <div className="flex flex-wrap justify-center gap-1 text-xs text-muted-foreground">
              <span>.pl</span>
              <span></span>
              <span>.pm</span>
              <span></span>
              <span>.xml</span>
              <span></span>
              <span>.ktr</span>
              <span></span>
              <span>.kjb</span>
              <span></span>
              <span>.txt</span>
            </div>
          </div>
          
          <Button type="button" variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Choose Files
          </Button>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="text-sm text-destructive">{uploadError}</span>
          </div>
        </div>
      )}
    </div>
  );
}
