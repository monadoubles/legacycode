'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '@/contexts/theme-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Download, Eye, EyeOff } from 'lucide-react';

interface CodeViewerProps {
  code: string;
  language: string;
  filename: string;
  issues?: Array<{
    line: number;
    severity: 'error' | 'warning' | 'info';
    message: string;
  }>;
  className?: string;
}

export function CodeViewer({ code, language, filename, issues = [], className }: CodeViewerProps) {
  const { theme } = useTheme();
  const [showIssues, setShowIssues] = useState(true);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const downloadFile = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLanguageFromExtension = (lang: string) => {
    const langMap: Record<string, string> = {
      'pl': 'perl',
      'pm': 'perl',
      'xml': 'xml',
      'ktr': 'xml',
      'kjb': 'xml',
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
    };
    return langMap[lang] || 'text';
  };

  const getIssueSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const lineProps = (lineNumber: number) => {
    const issue = issues.find(i => i.line === lineNumber);
    return {
      style: {
        backgroundColor: issue 
          ? issue.severity === 'error' 
            ? 'rgba(239, 68, 68, 0.1)'
            : issue.severity === 'warning'
            ? 'rgba(245, 158, 11, 0.1)'
            : 'rgba(59, 130, 246, 0.1)'
          : selectedLine === lineNumber
          ? 'rgba(156, 163, 175, 0.1)'
          : 'transparent',
        cursor: 'pointer',
      },
      onClick: () => setSelectedLine(lineNumber === selectedLine ? null : lineNumber),
    };
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{filename}</CardTitle>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="outline">{language.toUpperCase()}</Badge>
                {issues.length > 0 && (
                  <Badge variant="destructive">{issues.length} issues</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={downloadFile}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              {issues.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowIssues(!showIssues)}
                >
                  {showIssues ? (
                    <EyeOff className="w-4 h-4 mr-2" />
                  ) : (
                    <Eye className="w-4 h-4 mr-2" />
                  )}
                  Issues
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <SyntaxHighlighter
                language={getLanguageFromExtension(language)}
                style={theme === 'dark' ? oneDark : oneLight}
                showLineNumbers={true}
                lineNumberStyle={{ minWidth: '3em' }}
                wrapLongLines={true}
                lineProps={lineProps}
                className="text-sm"
              >
                {code}
              </SyntaxHighlighter>
            </div>
            
            {showIssues && issues.length > 0 && (
              <div className="lg:col-span-1">
                <h4 className="font-semibold mb-3">Code Issues</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {issues.map((issue, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedLine(issue.line)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Badge className={getIssueSeverityColor(issue.severity)} variant="outline">
                          {issue.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Line {issue.line}
                        </span>
                      </div>
                      <p className="text-sm">{issue.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
