// 'use client';

// import { useState, useEffect } from 'react';

// export interface Report {
//   id: string;
//   name: string;
//   description?: string;
//   status: 'generating' | 'completed' | 'failed';
//   fileCount: number;
//   createdAt: string;
//   updatedAt: string;
// }

// export function useReports() {
//   const [reports, setReports] = useState<Report[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchReports = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch('/api/reports');
//       if (!response.ok) {
//         throw new Error('Failed to fetch reports');
//       }
//       const data = await response.json();
//       setReports(data.reports || []);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to fetch reports');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const createReport = async (name: string, description?: string, fileIds?: string[]) => {
//     try {
//       const response = await fetch('/api/reports', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ name, description, fileIds }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to create report');
//       }

//       const data = await response.json();
//       await fetchReports();
//       return data.report;
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to create report');
//       throw err;
//     }
//   };

//   useEffect(() => {
//     fetchReports();
//   }, []);

//   return {
//     reports,
//     loading,
//     error,
//     createReport,
//     refreshReports: fetchReports,
//   };
// }
