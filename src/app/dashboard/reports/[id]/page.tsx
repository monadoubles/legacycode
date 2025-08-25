'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  BarChart3, 
  Download,
  ArrowLeft,
  Calendar,
  Users,
  TrendingUp,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';

interface PageProps {
  params: {
    id: string;
  };
}

export default function ReportDetailPage({ params }: PageProps) {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/reports/${params.id}?includeData=true`);
        
        if (!response.ok) {
          throw new Error(`Error fetching report: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        // Store the files data separately for rendering issues
        const filesData = data.files || [];
        
        // Process file analyses to calculate security issues and risk scores
        if (filesData.length > 0) {
          let securityIssuesCount = 0;
          let totalRiskScore = 0;
          let validRiskScores = 0;
          
          filesData.forEach((fileData: any) => {
            if (fileData.analysis && fileData.analysis.issuesFound) {
              // Count security issues
              const securityIssues = fileData.analysis.issuesFound.filter(
                (issue: any) => issue.rule === 'security'
              );
              securityIssuesCount += securityIssues.length;
            }
            
            // Calculate average risk score
            if (fileData.analysis && fileData.analysis.riskScore) {
              totalRiskScore += parseFloat(fileData.analysis.riskScore);
              validRiskScores++;
            }
          });
          
          // Update the report summary with calculated values
          const updatedReport = {
            ...data.report,
            files: filesData, // Store the files data in the report object
            summary: {
              ...data.report.summary,
              securityIssues: securityIssuesCount,
              riskScore: validRiskScores > 0 ? totalRiskScore / validRiskScores : 0
            }
          };
          
          setReportData(updatedReport);
        } else {
          setReportData({
            ...data.report,
            files: [] // Ensure files property exists even if empty
          });
        }
      } catch (err: any) {
        console.error('Failed to fetch report data:', err);
        setError(err.message || 'Failed to load report data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, [params.id]);

  const formatTechnologyDistribution = () => {
    if (!reportData?.technologyDistribution) return {};
    
    const techData: Record<string, { files: number, percentage: number }> = {};
    const total = Object.values(reportData.technologyDistribution).reduce((sum: number, value: any) => sum + value, 0);
    
    Object.entries(reportData.technologyDistribution).forEach(([tech, count]: [string, any]) => {
      techData[tech] = {
        files: count,
        percentage: Math.round((count / total) * 100)
      };
    });
    
    return techData;
  };

  const formatComplexityDistribution = () => {
    if (!reportData?.complexityDistribution) return {};
    
    const complexityData: Record<string, { files: number, percentage: number }> = {};
    const total = Object.values(reportData.complexityDistribution).reduce((sum: number, value: any) => sum + value, 0);
    
    Object.entries(reportData.complexityDistribution).forEach(([level, count]: [string, any]) => {
      complexityData[level] = {
        files: count,
        percentage: Math.round((count / total) * 100)
      };
    });
    
    return complexityData;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <div className="text-red-500 text-xl">Error: {error}</div>
        <Link href="/dashboard/reports">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </Button>
        </Link>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <div className="text-xl">Report not found</div>
        <Link href="/dashboard/reports">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </Button>
        </Link>
      </div>
    );
  }

  // Handle export functionality
  const handleExport = async (format: string) => {
    try {
      setExporting(true);
      setExportFormat(format);
      setExportError(null);
      
      const response = await fetch('/api/reports/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId: params.id,
          format: format,
          options: {
            includeSuggestions: true
          }
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Export failed');
      }
      
      // Get the file from the response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a link and trigger download
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `report-${params.id}-${format}.${format}`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Show success message
      alert(`Report successfully exported as ${format.toUpperCase()}`);
    } catch (err: any) {
      console.error('Export error:', err);
      setExportError(err.message);
    } finally {
      setExporting(false);
      setExportFormat(null);
    }
  };
  
  const technologyBreakdown = formatTechnologyDistribution();
  const complexityBreakdown = formatComplexityDistribution();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/reports">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Reports
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{reportData.name || 'Unnamed Report'}</h1>
            <p className="text-muted-foreground">{reportData.description || 'No description provided'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => handleExport('pdf')} 
            disabled={exporting || reportData.status !== 'completed'}
          >
            {exporting && exportFormat === 'pdf' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExport('csv')} 
            disabled={exporting || reportData.status !== 'completed'}
          >
            {exporting && exportFormat === 'csv' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExport('json')} 
            disabled={exporting || reportData.status !== 'completed'}
          >
            {exporting && exportFormat === 'json' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export JSON
          </Button>
        </div>
      </div>

      {/* Report Info */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Created on {reportData.createdAt ? format(new Date(reportData.createdAt), 'MMM d, yyyy') : 'Unknown date'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">By</div>
                <div className="font-medium">{reportData.generatedBy}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Files Analyzed</div>
                <div className="font-medium">{reportData.summary.analyzedFiles}</div>
              </div>
            </div>
            <Badge className={`${reportData.status === 'completed' ? 'bg-green-100 text-green-800' : reportData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : reportData.status === 'error' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
              {reportData.status === 'completed' ? 'Completed' : reportData.status === 'pending' ? 'In Progress' : reportData.status === 'error' ? 'Error' : reportData.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reportData.summary?.totalFiles || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Complexity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reportData.summary?.highComplexityFiles || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Complexity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reportData.summary?.averageComplexity?.toFixed(1) || '0.0'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {typeof reportData.summary?.riskScore === 'number' 
                ? reportData.summary.riskScore.toFixed(1) 
                : '0.0'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Security Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {reportData.summary?.securityIssues || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Analyzed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{reportData.summary?.analyzedFiles || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technology Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Technology Breakdown
            </CardTitle>
            <CardDescription>
              Distribution by technology type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(technologyBreakdown).map(([tech, data]: [string, any]) => (
                <div key={tech} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary" className="capitalize">
                      {tech}
                    </Badge>
                    <span className="text-sm">{data.files} files</span>
                  </div>
                  <span className="text-sm font-medium">{data.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Complexity Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Complexity Distribution
            </CardTitle>
            <CardDescription>
              Files by complexity level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(complexityBreakdown).map(([level, data]: [string, any]) => (
                <div key={level} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      level === 'low' ? 'bg-green-500' :
                      level === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm capitalize">{level} complexity</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{data.files} files</div>
                    <div className="text-xs text-muted-foreground">{data.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>
            Prioritized actions to improve code quality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.status === 'pending' ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Generating recommendations...</p>
              </div>
            ) : reportData.recommendations && reportData.recommendations.length > 0 ? (
              reportData.recommendations.map((rec: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{rec.title}</h4>
                    <Badge className={getPriorityColor(rec.priority)}>
                      {rec.priority} priority
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {rec.description}
                  </p>
                  <div className="text-xs text-muted-foreground font-medium">
                    Impact: {rec.impact}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No recommendations available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Security Issues</CardTitle>
          <CardDescription>
            Security vulnerabilities detected in the codebase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.status === 'pending' ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Analyzing security issues...</p>
              </div>
            ) : (
              <div>
                {reportData.files && reportData.files.some((fileData: any) => 
                  fileData.analysis?.issuesFound?.some((issue: any) => issue.rule === 'security')
                ) ? (
                  reportData.files.map((fileData: any, fileIndex: number) => {
                    // Make sure we can access issuesFound
                    if (!fileData.analysis || !fileData.analysis.issuesFound) {
                      return null;
                    }
                    
                    const securityIssues = fileData.analysis.issuesFound.filter(
                      (issue: any) => issue.rule === 'security'
                    );
                    
                    return securityIssues.length > 0 ? (
                      <div key={fileIndex} className="mb-6">
                        <h4 className="font-medium mb-2">{fileData.file.filename}</h4>
                        <div className="space-y-3">
                          {securityIssues.map((issue: any, issueIndex: number) => (
                            <div key={issueIndex} className="border-l-4 border-red-500 pl-3 py-1">
                              <div className="flex items-start">
                                <div className="flex-1">
                                  <p className="text-sm">{issue.message}</p>
                                </div>
                                <Badge variant="outline" className="bg-red-50 text-red-800 ml-2 whitespace-nowrap">
                                  {issue.severity}
                                </Badge>
                              </div>
                              {issue.line > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">Line: {issue.line}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No security issues detected</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Refactoring Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Refactoring Suggestions</CardTitle>
          <CardDescription>
            Code improvement opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.status === 'pending' ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Analyzing code for refactoring...</p>
              </div>
            ) : (
              <div>
                {reportData.files && reportData.files.some((fileData: any) => 
                  fileData.analysis?.issuesFound?.some((issue: any) => issue.rule === 'refactoring')
                ) ? (
                  reportData.files.map((fileData: any, fileIndex: number) => {
                    // Make sure we can access issuesFound
                    if (!fileData.analysis || !fileData.analysis.issuesFound) {
                      return null;
                    }
                    
                    const refactoringIssues = fileData.analysis.issuesFound.filter(
                      (issue: any) => issue.rule === 'refactoring'
                    );
                    
                    return refactoringIssues.length > 0 ? (
                      <div key={fileIndex} className="mb-6">
                        <h4 className="font-medium mb-2">{fileData.file.filename}</h4>
                        <div className="space-y-3">
                          {refactoringIssues.map((issue: any, issueIndex: number) => (
                            <div key={issueIndex} className="border-l-4 border-blue-500 pl-3 py-1">
                              <div className="flex items-start">
                                <div className="flex-1">
                                  <p className="text-sm">{issue.message}</p>
                                </div>
                                <Badge variant="outline" className="bg-blue-50 text-blue-800 ml-2 whitespace-nowrap">
                                  {issue.severity}
                                </Badge>
                              </div>
                              {issue.line > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">Line: {issue.line}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No refactoring suggestions available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}