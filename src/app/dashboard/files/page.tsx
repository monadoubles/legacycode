import { Metadata } from 'next';

// Import client component for real-time updates
import FilesClientPage from './client-page';

export const metadata: Metadata = {
  title: 'Files | Legacy Code Analyzer',
  description: 'View and manage your uploaded files',
};

export default function FilesPage() {
  return <FilesClientPage />;
}
