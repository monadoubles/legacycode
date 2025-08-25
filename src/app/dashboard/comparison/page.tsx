'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, FileText, BarChart3, AlertTriangle, Loader2 } from 'lucide-react';
import { fetchReportsList, compareReports, ReportBasicInfo, ReportDetail } from '@/lib/api/comparison';

export default function ComparisonPage() {
  const [selectedReport1, setSelectedReport1] = useState('');
  const [selectedReport2, setSelectedReport2] = useState('');
  const [reports, setReports] = useState<ReportBasicInfo[]>([]);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available reports on component mount
  useEffect(() => {
    async function loadReports() {
      try {
        const reportsList = await fetchReportsList();
        setReports(reportsList);
      } catch (err) {
        setError('Failed to load reports. Please try again later.');
        console.error('Error loading reports:', err);
      }
    }
    
    loadReports();
  }, []);

  // Function to handle comparison
  const handleCompare = async () => {
    if (!selectedReport1 || !selectedReport2) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await compareReports([selectedReport1, selectedReport2]);
      setComparisonData(result.data);
    } catch (err) {
      setError('Failed to compare reports. Please try again later.');
      console.error('Error comparing reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDifference = (val1: number, val2: number) => {
    const diff = val1 - val2;
    const isPositive = diff > 0;
    const isNegative = diff < 0;
    
    return {
      value: Math.abs(diff),
      isPositive,
      isNegative,
      percentage: Math.abs((diff / val2) * 100).toFixed(1)
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Report Comparison</h1>
        <p className="text-muted-foreground">
          Compare analysis results across different reports and time periods
        </p>
      </div>

      {/* Report Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Reports to Compare</CardTitle>
          <CardDescription>
            Choose two reports to analyze differences and trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report 1</label>
              <Select value={selectedReport1} onValueChange={setSelectedReport1}>
                <SelectTrigger>
                  <SelectValue placeholder="Select first report" />
                </SelectTrigger>
                <SelectContent>
                  {reports.map((report) => (
                    <SelectItem key={report.id} value={report.id}>
                      {report.name} ({new Date(report.createdAt).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-center">
              <ArrowRight className="w-6 h-6 text-muted-foreground" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Report 2</label>
              <Select value={selectedReport2} onValueChange={setSelectedReport2}>
                <SelectTrigger>
                  <SelectValue placeholder="Select second report" />
                </SelectTrigger>
                <SelectContent>
                  {reports.map((report) => (
                    <SelectItem key={report.id} value={report.id}>
                      {report.name} ({new Date(report.createdAt).toLocaleDateString()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button 
              disabled={!selectedReport1 || !selectedReport2 || loading} 
              onClick={handleCompare}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Comparing...
                </>
              ) : (
                'Compare Reports'
              )}
            </Button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-md">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {selectedReport1 && selectedReport2 && comparisonData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Report 1 Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  {comparisonData.reports[0].name}
                </CardTitle>
                <CardDescription>Baseline report</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Files</span>
                  <span className="font-medium">{comparisonData.reports[0].metrics.totalFiles}</span>
                </div>
                <div className="flex justify-between">
                  <span>High Complexity</span>
                  <span className="font-medium">{comparisonData.reports[0].metrics.highComplexityFiles}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg. Complexity</span>
                  <span className="font-medium">{comparisonData.reports[0].metrics.averageComplexity.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total LOC</span>
                  <span className="font-medium">{comparisonData.reports[0].metrics.totalLinesOfCode.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Report 2 Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  {comparisonData.reports[1].name}
                </CardTitle>
                <CardDescription>Comparison report</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Files</span>
                  <span className="font-medium">{comparisonData.reports[1].metrics.totalFiles}</span>
                </div>
                <div className="flex justify-between">
                  <span>High Complexity</span>
                  <span className="font-medium">{comparisonData.reports[1].metrics.highComplexityFiles}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg. Complexity</span>
                  <span className="font-medium">{comparisonData.reports[1].metrics.averageComplexity.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total LOC</span>
                  <span className="font-medium">{comparisonData.reports[1].metrics.totalLinesOfCode.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Differences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Key Differences
              </CardTitle>
              <CardDescription>
                Changes between the selected reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries({
                  'Total Files': getDifference(comparisonData.reports[0].metrics.totalFiles, comparisonData.reports[1].metrics.totalFiles),
                  'High Complexity': getDifference(comparisonData.reports[0].metrics.highComplexityFiles, comparisonData.reports[1].metrics.highComplexityFiles),
                  'Avg. Complexity': getDifference(comparisonData.reports[0].metrics.averageComplexity, comparisonData.reports[1].metrics.averageComplexity),
                  'Total LOC': getDifference(comparisonData.reports[0].metrics.totalLinesOfCode, comparisonData.reports[1].metrics.totalLinesOfCode),
                }).map(([key, diff]) => (
                  <div key={key} className="text-center p-4 border rounded">
                    <div className="text-sm text-muted-foreground">{key}</div>
                    <div className="text-2xl font-bold mt-1">
                      {diff.isPositive && '+'}
                      {diff.isNegative && '-'}
                      {diff.value}
                    </div>
                    <Badge 
                      variant={diff.isPositive ? "destructive" : diff.isNegative ? "default" : "secondary"}
                      className="mt-1"
                    >
                      {diff.percentage}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
