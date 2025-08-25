// 'use client';

// import { useState, useCallback, useRef } from 'react';
// import { FileUtils } from '@/lib/utils/file-utils';
// import { FileMetadata, FileValidation } from '@/lib/types/file';

// export interface UploadedFile {
//   id: string;
//   file: File;
//   metadata: FileMetadata;
//   validation: FileValidation;
//   status: 'pending' | 'uploading' | 'completed' | 'failed';
//   progress: number;
//   error?: string;
//   uploadedAt?: Date;
// }

// export interface UseFileUploadReturn {
//   // State
//   files: UploadedFile[];
//   isUploading: boolean;
//   uploadProgress: number;
//   error: string | null;
  
//   // Actions
//   addFiles: (newFiles: File[]) => void;
//   removeFile: (fileId: string) => void;
//   uploadFiles: () => Promise<void>;
//   uploadFile: (fileId: string) => Promise<void>;
//   clearFiles: () => void;
//   retryUpload: (fileId: string) => Promise<void>;
  
//   // Validation
//   validateFiles: (filesToValidate: File[]) => FileValidation[];
  
//   // Getters
//   getFile: (fileId: string) => UploadedFile | undefined;
//   validFiles: UploadedFile[];
//   invalidFiles: UploadedFile[];
//   completedFiles: UploadedFile[];
//   failedFiles: UploadedFile[];
//   pendingFiles: UploadedFile[];
  
//   // Statistics
//   totalFiles: number;
//   totalSize: number;
//   completedCount: number;
//   failedCount: number;
// }

// export function useFileUpload(
//   onUploadComplete?: (files: UploadedFile[]) => void,
//   onUploadError?: (error: string) => void
// ): UseFileUploadReturn {
//   const [files, setFiles] = useState<UploadedFile[]>([]);
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [error, setError] = useState<string | null>(null);
//   const abortController = useRef<AbortController | null>(null);

//   // Add files to upload queue
//   const addFiles = useCallback((newFiles: File[]) => {
//     const uploadedFiles: UploadedFile[] = newFiles.map(file => {
//       const validation = FileUtils.validateFile(file);
//       const id = generateFileId();
      
//       // Create metadata
//       const metadata: FileMetadata = {
//         id,
//         filename: file.name,
//         originalPath: file.name,
//         relativePath: FileUtils.generateUniqueFilename(file.name),
//         fileSize: file.size,
//         fileType: FileUtils.getFileExtension(file.name),
//         mimeType: file.type || 'application/octet-stream',
//         encoding: 'utf-8',
//         contentHash: '', // Will be calculated during upload
//         technology: FileUtils.detectTechnology(file.name, FileUtils.getFileExtension(file.name)) as any,
//         uploadedBy: 'current-user', // Would come from auth context
//         uploadedAt: new Date(),
//         tags: [],
//         isArchived: false
//       };

//       return {
//         id,
//         file,
//         metadata,
//         validation,
//         status: validation.isValid ? 'pending' : 'failed',
//         progress: 0,
//         error: validation.isValid ? undefined : validation.errors.join(', ')
//       };
//     });

//     setFiles(prev => [...prev, ...uploadedFiles]);
//     setError(null);
//   }, []);

//   // Remove file from queue
//   const removeFile = useCallback((fileId: string) => {
//     setFiles(prev => prev.filter(f => f.id !== fileId));
//   }, []);

//   // Upload all files
//   const uploadFiles = useCallback(async () => {
//     const filesToUpload = files.filter(f => f.status === 'pending');
    
//     if (filesToUpload.length === 0) {
//       return;
//     }

//     setIsUploading(true);
//     setError(null);
//     setUploadProgress(0);

//     const controller = new AbortController();
//     abortController.current = controller;

//     try {
//       const totalFiles = filesToUpload.length;
//       let completedFiles = 0;

//       // Upload files in batches to avoid overwhelming the server
//       const batchSize = 3;
//       const batches = [];
      
//       for (let i = 0; i < filesToUpload.length; i += batchSize) {
//         batches.push(filesToUpload.slice(i, i + batchSize));
//       }

//       for (const batch of batches) {
//         if (controller.signal.aborted) {
//           throw new Error('Upload cancelled');
//         }

//         // Upload batch in parallel
//         await Promise.all(
//           batch.map(async (uploadFile) => {
//             try {
//               await uploadSingleFile(uploadFile, controller.signal, (progress) => {
//                 setFiles(prev => prev.map(f => 
//                   f.id === uploadFile.id 
//                     ? { ...f, progress, status: 'uploading' }
//                     : f
//                 ));
//               });

//               // Mark as completed
//               setFiles(prev => prev.map(f => 
//                 f.id === uploadFile.id 
//                   ? { ...f, status: 'completed', progress: 100, uploadedAt: new Date() }
//                   : f
//               ));

//               completedFiles++;
//               setUploadProgress((completedFiles / totalFiles) * 100);

//             } catch (fileError) {
//               console.error(`Upload failed for file ${uploadFile.file.name}:`, fileError);
              
//               setFiles(prev => prev.map(f => 
//                 f.id === uploadFile.id 
//                   ? { 
//                       ...f, 
//                       status: 'failed', 
//                       error: fileError instanceof Error ? fileError.message : 'Upload failed'
//                     }
//                   : f
//               ));
//             }
//           })
//         );
//       }

//       const finalCompletedFiles = files.filter(f => f.status === 'completed');
//       onUploadComplete?.(finalCompletedFiles);

//     } catch (uploadError) {
//       const errorMessage = uploadError instanceof Error ? uploadError.message : 'Upload failed';
//       setError(errorMessage);
//       onUploadError?.(errorMessage);
      
//       // Mark pending files as failed
//       setFiles(prev => prev.map(f => 
//         f.status === 'uploading' || f.status === 'pending'
//           ? { ...f, status: 'failed', error: 'Upload cancelled' }
//           : f
//       ));
      
//     } finally {
//       setIsUploading(false);
//       abortController.current = null;
//     }
//   }, [files, onUploadComplete, onUploadError]);

//   // Upload single file
//   const uploadFile = useCallback(async (fileId: string) => {
//     const uploadFile = files.find(f => f.id === fileId);
//     if (!uploadFile || uploadFile.status !== 'pending') {
//       return;
//     }

//     try {
//       setFiles(prev => prev.map(f => 
//         f.id === fileId 
//           ? { ...f, status: 'uploading', progress: 0 }
//           : f
//       ));

//       const controller = new AbortController();
      
//       await uploadSingleFile(uploadFile, controller.signal, (progress) => {
//         setFiles(prev => prev.map(f => 
//           f.id === fileId 
//             ? { ...f, progress }
//             : f
//         ));
//       });

//       setFiles(prev => prev.map(f => 
//         f.id === fileId 
//           ? { ...f, status: 'completed', progress: 100, uploadedAt: new Date() }
//           : f
//       ));

//     } catch (error) {
//       setFiles(prev => prev.map(f => 
//         f.id === fileId 
//           ? { 
//               ...f, 
//               status: 'failed', 
//               error: error instanceof Error ? error.message : 'Upload failed'
//             }
//           : f
//       ));
//     }
//   }, [files]);

//   // Clear all files
//   const clearFiles = useCallback(() => {
//     if (abortController.current) {
//       abortController.current.abort();
//     }
//     setFiles([]);
//     setError(null);
//     setUploadProgress(0);
//     setIsUploading(false);
//   }, []);

//   // Retry failed upload
//   const retryUpload = useCallback(async (fileId: string) => {
//     setFiles(prev => prev.map(f => 
//       f.id === fileId 
//         ? { ...f, status: 'pending', error: undefined, progress: 0 }
//         : f
//     ));
    
//     await uploadFile(fileId);
//   }, [uploadFile]);

//   // Validate files
//   const validateFiles = useCallback((filesToValidate: File[]): FileValidation[] => {
//     return filesToValidate.map(file => FileUtils.validateFile(file));
//   }, []);

//   // Get specific file
//   const getFile = useCallback((fileId: string) => {
//     return files.find(f => f.id === fileId);
//   }, [files]);

//   // Computed values
//   const validFiles = files.filter(f => f.validation.isValid);
//   const invalidFiles = files.filter(f => !f.validation.isValid);
//   const completedFiles = files.filter(f => f.status === 'completed');
//   const failedFiles = files.filter(f => f.status === 'failed');
//   const pendingFiles = files.filter(f => f.status === 'pending');

//   const totalFiles = files.length;
//   const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);
//   const completedCount = completedFiles.length;
//   const failedCount = failedFiles.length;

//   return {
//     // State
//     files,
//     isUploading,
//     uploadProgress,
//     error,
    
//     // Actions
//     addFiles,
//     removeFile,
//     uploadFiles,
//     uploadFile,
//     clearFiles,
//     retryUpload,
    
//     // Validation
//     validateFiles,
    
//     // Getters
//     getFile,
//     validFiles,
//     invalidFiles,
//     completedFiles,
//     failedFiles,
//     pendingFiles,
    
//     // Statistics
//     totalFiles,
//     totalSize,
//     completedCount,
//     failedCount
//   };
// }

// // Helper functions
// function generateFileId(): string {
//   return `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
// }

// async function uploadSingleFile(
//   uploadFile: UploadedFile,
//   signal: AbortSignal,
//   onProgress: (progress: number) => void
// ): Promise<void> {
//   const formData = new FormData();
//   formData.append('file', uploadFile.file);
//   formData.append('metadata', JSON.stringify(uploadFile.metadata));

//   // Calculate content hash
//   const content = await FileUtils.readFileContent(uploadFile.file);
//   const contentHash = FileUtils.calculateContentHash(content);
//   formData.append('contentHash', contentHash);

//   onProgress(10);

//   const response = await fetch('/api/files/upload', {
//     method: 'POST',
//     body: formData,
//     signal
//   });

//   onProgress(90);

//   if (!response.ok) {
//     throw new Error(`Upload failed: ${response.statusText}`);
//   }

//   const result = await response.json();
  
//   if (!result.success) {
//     throw new Error(result.error || 'Upload failed');
//   }

//   onProgress(100);
// }
