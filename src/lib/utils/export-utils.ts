import { AnalysisResult } from '../types/analysis';
import { GeneratedReport } from '../types/report';

export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf' | 'xlsx' | 'xml';
  includeMetrics: boolean;
  includeIssues: boolean;
  includeSuggestions: boolean;
  includeCharts: boolean;
  customFields?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export class ExportUtils {
  static async exportAnalysisResults(
    results: AnalysisResult[],
    options: ExportOptions
  ): Promise<Blob> {
    switch (options.format) {
      case 'json':
        return this.exportToJson(results, options);
      case 'csv':
        return this.exportToCsv(results, options);
      case 'pdf':
        return this.exportToPdf(results, options);
      case 'xlsx':
        return this.exportToExcel(results, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  static async exportReport(
    report: GeneratedReport,
    format: 'pdf' | 'xlsx' | 'csv'
  ): Promise<Blob> {
    const data = this.prepareReportData(report);
    
    switch (format) {
      case 'pdf':
        return this.generatePdfReport(data);
      case 'xlsx':
        return this.generateExcelReport(data);
      case 'csv':
        return this.generateCsvReport(data);
      default:
        throw new Error(`Unsupported report format: ${format}`);
    }
  }

  private static exportToJson(
    results: AnalysisResult[],
    options: ExportOptions
  ): Blob {
    const exportData = {
      exportedAt: new Date().toISOString(),
      format: 'json',
      options,
      totalFiles: results.length,
      results: results.map(result => this.filterResultFields(result, options))
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  }

  private static exportToCsv(
    results: AnalysisResult[],
    options: ExportOptions
  ): Blob {
    const headers = this.getCsvHeaders(options);
    const rows = results.map(result => this.convertToCsvRow(result, options));
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    return new Blob([csvContent], { type: 'text/csv' });
  }

  private static async exportToPdf(
    results: AnalysisResult[],
    options: ExportOptions
  ): Promise<Blob> {
    // This would typically use a PDF library like jsPDF or PDFKit
    const htmlContent = this.generateHtmlReport(results, options);
    
    // For demonstration, we'll create a simple text-based PDF
    const pdfContent = `Legacy Code Analysis Report
Generated: ${new Date().toISOString()}

Summary:
- Total Files: ${results.length}
- High Risk Files: ${results.filter(r => r.riskScore > 70).length}
- Average Complexity: ${this.calculateAverageComplexity(results)}

${results.map(r => `
File: ${r.filename}
Technology: ${r.technology}
Risk Score: ${r.riskScore}
Complexity: ${r.overallComplexity}
Security Issues: ${r.securityIssues.length}
Performance Issues: ${r.performanceIssues.length}
---`).join('\n')}`;

    return new Blob([pdfContent], { type: 'application/pdf' });
  }

  private static async exportToExcel(
    results: AnalysisResult[],
    options: ExportOptions
  ): Promise<Blob> {
    // This would use a library like ExcelJS or SheetJS
    const workbookData = {
      sheets: [
        {
          name: 'Analysis Summary',
          data: this.prepareExcelSummaryData(results)
        },
        {
          name: 'Detailed Results',
          data: this.prepareExcelDetailData(results, options)
        }
      ]
    };

    // For demonstration, create a CSV-like format
    const csvData = this.exportToCsv(results, options);
    return new Blob([csvData], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  }

  private static filterResultFields(
    result: AnalysisResult,
    options: ExportOptions
  ): Partial<AnalysisResult> {
    const filtered: any = {
      id: result.id,
      filename: result.filename,
      technology: result.technology,
      overallComplexity: result.overallComplexity,
      riskScore: result.riskScore,
      analyzedAt: result.analyzedAt
    };

    if (options.includeMetrics) {
      filtered.metrics = result.metrics;
    }

    if (options.includeIssues) {
      filtered.securityIssues = result.securityIssues;
      filtered.performanceIssues = result.performanceIssues;
    }

    if (options.includeSuggestions) {
      filtered.refactoringOpportunities = result.refactoringOpportunities;
      filtered.modernizationSuggestions = result.modernizationSuggestions;
    }

    return filtered;
  }

  private static getCsvHeaders(options: ExportOptions): string[] {
    const baseHeaders = [
      'File Name',
      'Technology', 
      'Overall Complexity',
      'Risk Score',
      'Analyzed At'
    ];

    if (options.includeMetrics) {
      baseHeaders.push(
        'Lines of Code',
        'Cyclomatic Complexity',
        'Maintainability Index',
        'Function Count'
      );
    }

    if (options.includeIssues) {
      baseHeaders.push(
        'Security Issues',
        'Performance Issues'
      );
    }

    return baseHeaders;
  }

  private static convertToCsvRow(
    result: AnalysisResult,
    options: ExportOptions
  ): string[] {
    const baseRow = [
      this.escapeCsvValue(result.filename),
      result.technology,
      result.overallComplexity,
      result.riskScore.toString(),
      result.analyzedAt.toISOString()
    ];

    if (options.includeMetrics) {
      baseRow.push(
        result.metrics.linesOfCode.toString(),
        result.metrics.cyclomaticComplexity.toString(),
        result.metrics.maintainabilityIndex.toString(),
        result.metrics.functionCount.toString()
      );
    }

    if (options.includeIssues) {
      baseRow.push(
        result.securityIssues.length.toString(),
        result.performanceIssues.length.toString()
      );
    }

    return baseRow;
  }

  private static escapeCsvValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private static generateHtmlReport(
    results: AnalysisResult[],
    options: ExportOptions
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Legacy Code Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 10px; }
        .summary { background: #f5f5f5; padding: 15px; margin: 20px 0; }
        .result { border: 1px solid #ddd; margin: 10px 0; padding: 15px; }
        .high-risk { border-left: 5px solid #d32f2f; }
        .medium-risk { border-left: 5px solid #f57c00; }
        .low-risk { border-left: 5px solid #388e3c; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Legacy Code Analysis Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="summary">
        <h2>Summary</h2>
        <ul>
            <li>Total Files: ${results.length}</li>
            <li>High Risk Files: ${results.filter(r => r.riskScore > 70).length}</li>
            <li>Average Complexity: ${this.calculateAverageComplexity(results)}</li>
        </ul>
    </div>
    
    <div class="results">
        <h2>Detailed Results</h2>
        ${results.map(result => `
            <div class="result ${this.getRiskClass(result.riskScore)}">
                <h3>${result.filename}</h3>
                <p><strong>Technology:</strong> ${result.technology}</p>
                <p><strong>Risk Score:</strong> ${result.riskScore}</p>
                <p><strong>Complexity:</strong> ${result.overallComplexity}</p>
                ${options.includeIssues ? `
                    <p><strong>Security Issues:</strong> ${result.securityIssues.length}</p>
                    <p><strong>Performance Issues:</strong> ${result.performanceIssues.length}</p>
                ` : ''}
            </div>
        `).join('')}
    </div>
</body>
</html>`;
  }

  private static calculateAverageComplexity(results: AnalysisResult[]): string {
    if (results.length === 0) return '0';
    
    const total = results.reduce((sum, r) => sum + r.metrics.cyclomaticComplexity, 0);
    return (total / results.length).toFixed(1);
  }

  private static getRiskClass(riskScore: number): string {
    if (riskScore > 70) return 'high-risk';
    if (riskScore > 40) return 'medium-risk';
    return 'low-risk';
  }

  private static prepareReportData(report: GeneratedReport): any {
    return {
      title: report.name,
      generatedAt: report.generatedAt,
      summary: report.data?.summary,
      sections: report.data?.sections,
      recommendations: report.data?.recommendations
    };
  }

  private static async generatePdfReport(data: any): Promise<Blob> {
    // Implementation would use a PDF library
    const content = JSON.stringify(data, null, 2);
    return new Blob([content], { type: 'application/pdf' });
  }

  private static async generateExcelReport(data: any): Promise<Blob> {
    // Implementation would use an Excel library
    const content = JSON.stringify(data, null, 2);
    return new Blob([content], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  }

  private static async generateCsvReport(data: any): Promise<Blob> {
    // Convert report data to CSV format
    const csv = this.convertReportToCsv(data);
    return new Blob([csv], { type: 'text/csv' });
  }

  private static convertReportToCsv(data: any): string {
    const rows = [
      ['Section', 'Metric', 'Value'],
      ...Object.entries(data.summary.metrics).map(([key, value]) => [
        'Summary',
        key,
        value?.toString() || ''
      ])
    ];

    return rows.map(row => row.join(',')).join('\n');
  }

  private static prepareExcelSummaryData(results: AnalysisResult[]): any[] {
    return [
      ['Metric', 'Value'],
      ['Total Files', results.length],
      ['High Risk Files', results.filter(r => r.riskScore > 70).length],
      ['Average Complexity', this.calculateAverageComplexity(results)]
    ];
  }

  private static prepareExcelDetailData(
    results: AnalysisResult[],
    options: ExportOptions
  ): any[] {
    const headers = this.getCsvHeaders(options);
    const data = results.map(result => this.convertToCsvRow(result, options));
    
    return [headers, ...data];
  }
}
