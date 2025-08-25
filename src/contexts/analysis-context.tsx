// 'use client';

// import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// // Types
// export interface AnalysisFile {
//   id: string;
//   filename: string;
//   fileType: string;
//   fileSize: number;
//   status: 'uploading' | 'processing' | 'completed' | 'error';
//   progress: number;
//   complexityLevel?: 'low' | 'medium' | 'high' | 'critical';
//   metrics?: {
//     linesOfCode: number;
//     cyclomaticComplexity: number;
//     maintainabilityIndex: number;
//   };
// }

// export interface AnalysisState {
//   files: AnalysisFile[];
//   isUploading: boolean;
//   isAnalyzing: boolean;
//   uploadProgress: number;
//   selectedFiles: string[];
//   filters: {
//     technology: string[];
//     complexity: string[];
//     status: string[];
//   };
// }

// // Actions
// type AnalysisAction =
//   | { type: 'ADD_FILES'; payload: AnalysisFile[] }
//   | { type: 'UPDATE_FILE'; payload: { id: string; updates: Partial<AnalysisFile> } }
//   | { type: 'REMOVE_FILE'; payload: string }
//   | { type: 'SET_UPLOADING'; payload: boolean }
//   | { type: 'SET_ANALYZING'; payload: boolean }
//   | { type: 'SET_UPLOAD_PROGRESS'; payload: number }
//   | { type: 'SELECT_FILE'; payload: string }
//   | { type: 'DESELECT_FILE'; payload: string }
//   | { type: 'CLEAR_SELECTION' }
//   | { type: 'SET_FILTERS'; payload: Partial<AnalysisState['filters']> }
//   | { type: 'RESET_STATE' };

// // Initial state
// const initialState: AnalysisState = {
//   files: [],
//   isUploading: false,
//   isAnalyzing: false,
//   uploadProgress: 0,
//   selectedFiles: [],
//   filters: {
//     technology: [],
//     complexity: [],
//     status: [],
//   },
// };

// // Reducer
// function analysisReducer(state: AnalysisState, action: AnalysisAction): AnalysisState {
//   switch (action.type) {
//     case 'ADD_FILES':
//       return {
//         ...state,
//         files: [...state.files, ...action.payload],
//       };
    
//     case 'UPDATE_FILE':
//       return {
//         ...state,
//         files: state.files.map(file =>
//           file.id === action.payload.id
//             ? { ...file, ...action.payload.updates }
//             : file
//         ),
//       };
    
//     case 'REMOVE_FILE':
//       return {
//         ...state,
//         files: state.files.filter(file => file.id !== action.payload),
//         selectedFiles: state.selectedFiles.filter(id => id !== action.payload),
//       };
    
//     case 'SET_UPLOADING':
//       return { ...state, isUploading: action.payload };
    
//     case 'SET_ANALYZING':
//       return { ...state, isAnalyzing: action.payload };
    
//     case 'SET_UPLOAD_PROGRESS':
//       return { ...state, uploadProgress: action.payload };
    
//     case 'SELECT_FILE':
//       return {
//         ...state,
//         selectedFiles: [...state.selectedFiles, action.payload],
//       };
    
//     case 'DESELECT_FILE':
//       return {
//         ...state,
//         selectedFiles: state.selectedFiles.filter(id => id !== action.payload),
//       };
    
//     case 'CLEAR_SELECTION':
//       return { ...state, selectedFiles: [] };
    
//     case 'SET_FILTERS':
//       return {
//         ...state,
//         filters: { ...state.filters, ...action.payload },
//       };
    
//     case 'RESET_STATE':
//       return initialState;
    
//     default:
//       return state;
//   }
// }

// // Context
// const AnalysisContext = createContext<{
//   state: AnalysisState;
//   dispatch: React.Dispatch<AnalysisAction>;
// } | null>(null);

// // Provider
// export function AnalysisProvider({ children }: { children: ReactNode }) {
//   const [state, dispatch] = useReducer(analysisReducer, initialState);

//   return (
//     <AnalysisContext.Provider value={{ state, dispatch }}>
//       {children}
//     </AnalysisContext.Provider>
//   );
// }

// // Hook
// export function useAnalysis() {
//   const context = useContext(AnalysisContext);
  
//   if (!context) {
//     throw new Error('useAnalysis must be used within an AnalysisProvider');
//   }

//   const { state, dispatch } = context;

//   // Helper functions
//   const addFiles = (files: AnalysisFile[]) => {
//     dispatch({ type: 'ADD_FILES', payload: files });
//   };

//   const updateFile = (id: string, updates: Partial<AnalysisFile>) => {
//     dispatch({ type: 'UPDATE_FILE', payload: { id, updates } });
//   };

//   const removeFile = (id: string) => {
//     dispatch({ type: 'REMOVE_FILE', payload: id });
//   };

//   const setUploading = (isUploading: boolean) => {
//     dispatch({ type: 'SET_UPLOADING', payload: isUploading });
//   };

//   const setAnalyzing = (isAnalyzing: boolean) => {
//     dispatch({ type: 'SET_ANALYZING', payload: isAnalyzing });
//   };

//   const setUploadProgress = (progress: number) => {
//     dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: progress });
//   };

//   const selectFile = (id: string) => {
//     dispatch({ type: 'SELECT_FILE', payload: id });
//   };

//   const deselectFile = (id: string) => {
//     dispatch({ type: 'DESELECT_FILE', payload: id });
//   };

//   const clearSelection = () => {
//     dispatch({ type: 'CLEAR_SELECTION' });
//   };

//   const setFilters = (filters: Partial<AnalysisState['filters']>) => {
//     dispatch({ type: 'SET_FILTERS', payload: filters });
//   };

//   const resetState = () => {
//     dispatch({ type: 'RESET_STATE' });
//   };

//   // Computed values
//   const completedFiles = state.files.filter(file => file.status === 'completed');
//   const processingFiles = state.files.filter(file => file.status === 'processing');
//   const errorFiles = state.files.filter(file => file.status === 'error');
//   const totalFiles = state.files.length;

//   return {
//     ...state,
//     addFiles,
//     updateFile,
//     removeFile,
//     setUploading,
//     setAnalyzing,
//     setUploadProgress,
//     selectFile,
//     deselectFile,
//     clearSelection,
//     setFilters,
//     resetState,
//     // Computed values
//     completedFiles,
//     processingFiles,
//     errorFiles,
//     totalFiles,
//     completionRate: totalFiles > 0 ? (completedFiles.length / totalFiles) * 100 : 0,
//   };
// }
