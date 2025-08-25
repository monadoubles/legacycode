'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  BarChart3,
  TrendingUp,
  Share
} from 'lucide-react';
import { formatRelativeTime, formatDate } from '@/lib/utils';

interface Report {
  id: string;
  name: string;
  description?: string;
  status: 'generating' | 'completed' | 'failed' | 'archived';
  fileIds: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
  // Extended UI properties (may not all be available from API)
  version?: string;
  totalFiles?: number;
  generatedBy?: string;
  fileCount?: number;
  avgComplexity?: number;
  highComplexityFiles?: number;
  exportFormats?: string[];
  tags?: string[];
  isPublic?: boolean;
  isPinned?: boolean;
}

// Default values for reports when API data is missing certain fields
const defaultReportValues = {
  version: '1.0',
  generatedBy: 'System',
  exportFormats: ['PDF', 'JSON'],
  tags: [],
  isPublic: false,
  isPinned: false,
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  
  // Form state for report creation
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [fileSelection, setFileSelection] = useState('all');

  // Reset form when dialog closes
  useEffect(() => {
    if (!isCreateDialogOpen) {
      setReportName('');
      setReportDescription('');
      setFileSelection('all');
    }
  }, [isCreateDialogOpen]);

  // Fetch reports from API
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/reports');
        if (!response.ok) {
          throw new Error(`Error fetching reports: ${response.statusText}`);
        }
        const data = await response.json();
        
        // Process and enhance the reports with default values for missing fields
        const processedReports = data.reports.map((report: any) => {
          // Convert string dates to Date objects for consistent handling
          const createdAt = new Date(report.createdAt);
          const updatedAt = new Date(report.updatedAt);
          
          // Calculate derived values based on available data
          const fileCount = report.fileIds?.length || 0;
          
          // Add random values for demo purposes (in a real app, these would come from the API)
          // These should be removed once the API provides all necessary data
          const demoValues = {
            avgComplexity: Math.round((Math.random() * 10 + 1) * 10) / 10,
            highComplexityFiles: Math.floor(Math.random() * fileCount * 0.3),
            tags: ['demo', report.status],
            isPinned: report.id.includes('1'), // Just for demo, pin the first report
          };
          
          return {
            ...defaultReportValues,
            ...report,
            fileCount,
            totalFiles: fileCount,
            createdAt,
            updatedAt,
            ...demoValues
          };
        });
        
        setReports(processedReports);
      } catch (err: any) {
        console.error('Failed to fetch reports:', err);
        setError(err.message || 'Failed to fetch reports');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReports();
  }, []);
  
  // Filter reports based on search and status
  useEffect(() => {
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (report.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) || false)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    setFilteredReports(filtered);
  }, [reports, searchTerm, statusFilter]);

  const getStatusIcon = (status: Report['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'generating':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'archived':
        return <FileText className="h-4 w-4 text-gray-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: Report['status']) => {
    const variants = {
      completed: 'default',
      generating: 'secondary', 
      failed: 'destructive',
      archived: 'outline',
    } as const;

    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  const handleDeleteReport = async (reportId: string) => {
    if (confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/reports/${reportId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to delete report: ${response.statusText}`);
        }
        
        // Update local state after successful API call
        setReports(prev => prev.filter(report => report.id !== reportId));
      } catch (err: any) {
        console.error('Error deleting report:', err);
        alert(`Failed to delete report: ${err.message}`);
      }
    }
  };

  // Handle report creation
  const handleCreateReport = async () => {
    if (!reportName.trim()) return;
    
    setIsCreatingReport(true);
    try {
      // Get file IDs based on selection type
      let fileIds: string[] = [];
      const allFiles = await fetch('/api/files').then(res => res.json());
      
      if (fileSelection === 'all') {
        // Get all analyzed files
        fileIds = allFiles.files
          .filter((file: any) => file.status === 'analyzed')
          .map((file: any) => file.id);
      } else if (fileSelection === 'high-complexity') {
        // Get high complexity files
        // In a real app, we would filter by complexity from analyses
        // For now, we'll just take a subset of files as an example
        const analyzedFiles = allFiles.files.filter((file: any) => file.status === 'analyzed');
        console.log(analyzedFiles,"analyzedFiles")
        fileIds = analyzedFiles.slice(0, Math.max(1, Math.floor(analyzedFiles.length * 0.3))).map((file: any) => file.id);
      } else if (fileSelection === 'recent') {
        // Get recently analyzed files (last 10)
        fileIds = allFiles.files
          .filter((file: any) => file.status === 'analyzed')
          .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 10)
          .map((file: any) => file.id);
      }
      console.log(allFiles.files,fileIds,"fileIds")
      // Ensure we have at least one file
      if (fileIds.length === 0) {
        throw new Error('No files available for report generation');
      }
      
      // Call API to create report
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: reportName,
          description: reportDescription,
          fileIds: fileIds,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create report: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Close dialog and refresh reports
      setIsCreateDialogOpen(false);
      
      // Refresh reports list
      const reportsResponse = await fetch('/api/reports');
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        
        // Process and enhance the reports with default values for missing fields
        const processedReports = reportsData.reports.map((report: any) => {
          // Convert string dates to Date objects for consistent handling
          const createdAt = new Date(report.createdAt);
          const updatedAt = new Date(report.updatedAt);
          
          // Calculate derived values based on available data
          const fileCount = report.fileIds?.length || 0;
          
          // Add random values for demo purposes (in a real app, these would come from the API)
          const demoValues = {
            avgComplexity: Math.round((Math.random() * 10 + 1) * 10) / 10,
            highComplexityFiles: Math.floor(Math.random() * fileCount * 0.3),
            tags: ['demo', report.status],
            isPinned: report.id.includes('1'), // Just for demo, pin the first report
          };
          
          return {
            ...defaultReportValues,
            ...report,
            fileCount,
            totalFiles: fileCount,
            createdAt,
            updatedAt,
            ...demoValues
          };
        });
        
        setReports(processedReports);
      }
      
    } catch (err: any) {
      console.error('Error creating report:', err);
      alert(`Failed to create report: ${err.message}`);
    } finally {
      setIsCreatingReport(false);
    }
  };

  const handleExportReport = async (report: Report, format: string) => {
    try {
      // Call the export API endpoint with POST and include suggestions
      const response = await fetch(`/api/reports/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId: report.id,
          format: format,
          options: {
            includeSuggestions: true  // Enable recommendations and security issues
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob);
      const element = document.createElement('a');
      element.href = url;
      element.download = `${report.name.replace(/\s+/g, '_')}.${format.toLowerCase()}`;
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(element);
    } catch (err: any) {
      console.error('Export error:', err);
      alert(`Failed to export report: ${err.message}`);
      
      // Fallback to client-side export for demo purposes
      console.log(`Fallback: Exporting report ${report.name} as ${format}`);
      const element = document.createElement('a');
      element.setAttribute('href', `data:text/plain;charset=utf-8,Report: ${report.name}`);
      element.setAttribute('download', `${report.name.replace(/\s+/g, '_')}.${format.toLowerCase()}`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const pinnedReports = filteredReports.filter(report => report.isPinned);
  const regularReports = filteredReports.filter(report => !report.isPinned);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate, view, and manage your code analysis reports
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Report
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Report</DialogTitle>
                <DialogDescription>
                  Generate a new analysis report from your selected files and filters.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="report-name" className="text-sm font-medium">
                    Report Name
                  </label>
                  <Input
                    id="report-name"
                    placeholder="Enter report name..."
                    className="w-full"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    disabled={isCreatingReport}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="report-desc" className="text-sm font-medium">
                    Description
                  </label>
                  <Input
                    id="report-desc"
                    placeholder="Brief description of the report..."
                    className="w-full"
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    disabled={isCreatingReport}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Include Files</label>
                  <Select 
                    value={fileSelection} 
                    onValueChange={setFileSelection}
                    disabled={isCreatingReport}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select files to include" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All analyzed files</SelectItem>
                      <SelectItem value="high-complexity">High complexity files only</SelectItem>
                      <SelectItem value="recent">Recently analyzed files</SelectItem>
                      {/* <SelectItem value="custom">Custom selection...</SelectItem> */}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isCreatingReport}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateReport}
                  disabled={isCreatingReport || !reportName.trim()}
                >
                  {isCreatingReport ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                      Generating...
                    </>
                  ) : (
                    'Generate Report'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="generating">Generating</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading and Error States */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading reports...</p>
        </div>
      )}
      
      {error && !isLoading && (
        <div className="text-center py-12 text-destructive">
          <AlertCircle className="mx-auto h-12 w-12" />
          <h3 className="mt-4 text-lg font-semibold">Failed to load reports</h3>
          <p className="mt-2">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Reports Content */}
      {!isLoading && !error && (
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Reports ({filteredReports.length})</TabsTrigger>
            <TabsTrigger value="pinned">Pinned ({pinnedReports.length})</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Pinned Reports */}
          {pinnedReports.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <span className="mr-2">📌</span>
                Pinned Reports
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pinnedReports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onDelete={handleDeleteReport}
                    onExport={handleExportReport}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular Reports */}
          <div className="space-y-4">
            {pinnedReports.length > 0 && (
              <h3 className="text-lg font-semibold">All Reports</h3>
            )}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {regularReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onDelete={handleDeleteReport}
                  onExport={handleExportReport}
                />
              ))}
            </div>
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No reports found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'Create your first report to get started.'}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pinned">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pinnedReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onDelete={handleDeleteReport}
                onExport={handleExportReport}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredReports
              .sort((a, b) => {
                const dateA = a.updatedAt instanceof Date ? a.updatedAt : new Date(a.updatedAt);
                const dateB = b.updatedAt instanceof Date ? b.updatedAt : new Date(b.updatedAt);
                return dateB.getTime() - dateA.getTime();
              })
              .slice(0, 6)
              .map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onDelete={handleDeleteReport}
                  onExport={handleExportReport}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>
      )}
    </div>
  );
}

// Report Card Component
interface ReportCardProps {
  report: Report;
  onDelete: (id: string) => void;
  onExport: (report: Report, format: string) => void;
}

function ReportCard({ report, onDelete, onExport }: ReportCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {report.isPinned && <span className="text-sm">📌</span>}
              <CardTitle className="text-lg line-clamp-1">{report.name}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {/* Status icon */}
              {report.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
              {report.status === 'generating' && <Clock className="h-4 w-4 text-blue-500 animate-spin" />}
              {report.status === 'failed' && <AlertCircle className="h-4 w-4 text-red-500" />}
              {report.status === 'archived' && <FileText className="h-4 w-4 text-gray-500" />}
              
              {/* Status badge */}
              <Badge 
                variant={
                  report.status === 'completed' ? 'default' :
                  report.status === 'generating' ? 'secondary' :
                  report.status === 'failed' ? 'destructive' : 'outline'
                } 
                className="capitalize"
              >
                {report.status}
              </Badge>
              
              {report.version && (
                <Badge variant="outline" className="text-xs">
                  v{report.version}
                </Badge>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/reports/${report.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit Report
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share className="mr-2 h-4 w-4" />
                Share Report
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {report.exportFormats && report.exportFormats.length > 0 ? (
                report.exportFormats.map((format) => (
                  <DropdownMenuItem
                    key={format}
                    onClick={() => onExport(report, format)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export as {format}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>
                  <Download className="mr-2 h-4 w-4" />
                  No export formats available
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(report.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <CardDescription className="line-clamp-2">
          {report.description || 'No description available'}
        </CardDescription>
        
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center text-muted-foreground">
              <FileText className="mr-1 h-3 w-3" />
              Files
            </div>
            <div className="font-medium">{report.fileCount}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center text-muted-foreground">
              <BarChart3 className="mr-1 h-3 w-3" />
              Avg Complexity
            </div>
            <div className="font-medium">{report.avgComplexity}</div>
          </div>
        </div>

        {/* Tags */}
        {report.tags && report.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {report.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {report.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{report.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center">
            <User className="mr-1 h-3 w-3" />
            {report.generatedBy || 'System'}
          </div>
          <div className="flex items-center">
            <Calendar className="mr-1 h-3 w-3" />
            {formatDate(report.updatedAt instanceof Date ? report.updatedAt : new Date(report.updatedAt))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
