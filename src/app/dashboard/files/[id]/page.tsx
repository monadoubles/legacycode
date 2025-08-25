import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  ArrowLeft,
  Download,
  Eye
} from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: {
    id: string;
  };
}

export default function FileDetailPage({ params }: PageProps) {
  // Mock file data
  const fileData = {
    id: params.id,
    name: 'legacy_system.pl',
    type: 'pl',
    size: '25.6 KB',
    status: 'analyzed',
    complexity: 'high',
    uploadedAt: '2024-01-15T10:30:00Z',
    analyzedAt: '2024-01-15T10:32:00Z',
    metrics: {
      linesOfCode: 247,
      codeLines: 198,
      commentLines: 32,
      blankLines: 17,
      cyclomaticComplexity: 15,
      nestingDepth: 6,
      maintainabilityIndex: 42.5,
      functionCount: 12,
      riskScore: 78,
    },
    suggestions: [
      {
        id: '1',
        type: 'refactor',
        severity: 'high',
        title: 'Reduce function complexity',
        description: 'The function processData() has high cyclomatic complexity (CC=8). Consider breaking it into smaller functions.',
        lineNumber: 45,
      },
      {
        id: '2',
        type: 'security',
        severity: 'medium',
        title: 'Potential SQL injection',
        description: 'String concatenation used in SQL query. Consider using parameterized queries.',
        lineNumber: 123,
      },
      {
        id: '3',
        type: 'performance',
        severity: 'low',
        title: 'Inefficient loop',
        description: 'Loop could be optimized by caching array length.',
        lineNumber: 89,
      }
    ]
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'analyzed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/files">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Files
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              {getStatusIcon(fileData.status)}
              <span className="ml-2">{fileData.name}</span>
            </h1>
            <p className="text-muted-foreground">
              Uploaded {new Date(fileData.uploadedAt).toLocaleDateString()} • {fileData.size}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            View Code
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lines of Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fileData.metrics.linesOfCode}</div>
            <div className="text-xs text-muted-foreground">
              {fileData.metrics.codeLines} code, {fileData.metrics.commentLines} comments
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Complexity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fileData.metrics.cyclomaticComplexity}</div>
            <Badge className="bg-red-100 text-red-800 text-xs">
              {fileData.complexity}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fileData.metrics.riskScore}</div>
            <div className="text-xs text-muted-foreground">
              Needs attention
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Functions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fileData.metrics.functionCount}</div>
            <div className="text-xs text-muted-foreground">
              Max depth: {fileData.metrics.nestingDepth}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Detailed Metrics
            </CardTitle>
            <CardDescription>
              Comprehensive analysis results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Cyclomatic Complexity</div>
                <div className="text-lg font-medium">{fileData.metrics.cyclomaticComplexity}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Nesting Depth</div>
                <div className="text-lg font-medium">{fileData.metrics.nestingDepth}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Maintainability Index</div>
                <div className="text-lg font-medium">{fileData.metrics.maintainabilityIndex}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Risk Score</div>
                <div className="text-lg font-medium">{fileData.metrics.riskScore}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              AI Suggestions
            </CardTitle>
            <CardDescription>
              {fileData.suggestions.length} improvement recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fileData.suggestions.map((suggestion) => (
                <div key={suggestion.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{suggestion.title}</h4>
                    <Badge className={getSeverityColor(suggestion.severity)}>
                      {suggestion.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {suggestion.description}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Line {suggestion.lineNumber} • {suggestion.type}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}