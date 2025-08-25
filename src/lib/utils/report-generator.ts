import { AnalysisResult } from "../types/analysis";
import { GeneratedReport, ReportSection } from "../types/report";
import { ReportTemplate } from "../types/report";
import { ReportData } from "../types/report";

export class ReportGenerator {
  static async generateReport(
    template: ReportTemplate,
    analysisResults: AnalysisResult[],
    parameters: Record<string, any> = {}
  ): Promise<GeneratedReport> {
    const reportData = await this.processReportData(template, analysisResults, parameters);
    
    const report: GeneratedReport = {
      id: this.generateReportId(),
      templateId: template.id,
      name: this.interpolateString(template.name, parameters),
      description: template.description ? this.interpolateString(template.description, parameters) : undefined,
      parameters,
      status: 'completed',
      formats: template.formats.filter(f => f.enabled).map(format => ({
        type: format.type,
        generatedAt: new Date()
      })),
      data: reportData,
      generatedBy: parameters.userId || 'system',
      generatedAt: new Date(),
      isShared: false,
      downloadCount: 0
    };

    return report;
  }

  private static async processReportData(
    template: ReportTemplate,
    analysisResults: AnalysisResult[],
    parameters: Record<string, any>
  ): Promise<ReportData> {
    // Filter results based on template filters
    const filteredResults = this.applyFilters(analysisResults, template.filters, parameters);
    
    // Generate summary
    const summary = this.generateSummary(filteredResults, parameters);
    
    // Process each section
    const sections = await Promise.all(
      template.sections.map(section => this.processSection(section, filteredResults, parameters))
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(filteredResults);

    // Generate appendices
    const appendices = this.generateAppendices(filteredResults, template);

    return {
      summary,
      sections: sections.filter(s => s !== null),
      recommendations,
      appendices
    };
  }

  private static applyFilters(
    results: AnalysisResult[],
    filters: any[],
    parameters: Record<string, any>
  ): AnalysisResult[] {
    return results.filter(result => {
      return filters.every(filter => {
        const value = this.getNestedValue(result, filter.field);
        const filterValue = parameters[filter.field] || filter.value;

        switch (filter.operator) {
          case 'equals':
            return value === filterValue;
          case 'contains':
            return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
          case 'greater_than':
            return Number(value) > Number(filterValue);
          case 'less_than':
            return Number(value) < Number(filterValue);
          case 'in':
            return Array.isArray(filterValue) && filterValue.includes(value);
          case 'between':
            return Array.isArray(filterValue) && 
                   Number(value) >= Number(filterValue[0]) && 
                   Number(value) <= Number(filterValue[1]);
          case 'exists':
            return value !== undefined && value !== null;
          default:
            return true;
        }
      });
    });
  }

  private static generateSummary(
    results: AnalysisResult[],
    parameters: Record<string, any>
  ) {
    const timeRange = {
      start: parameters.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: parameters.endDate || new Date()
    };

    const metrics = {
      averageComplexity: this.calculateAverage(results, 'metrics.cyclomaticComplexity'),
      highRiskFiles: results.filter(r => r.riskScore > 70).length,
      securityIssues: results.reduce((sum, r) => sum + r.securityIssues.length, 0),
      performanceIssues: results.reduce((sum, r) => sum + r.performanceIssues.length, 0),
      technicalDebtHours: results.reduce((sum, r) => sum + (r.technicalDebt?.estimatedHours || 0), 0)
    };

    return {
      totalFiles: results.length,
      analyzedFiles: results.length,
      timeRange,
      metrics
    };
  }

  private static async processSection(
    section: any,
    results: AnalysisResult[],
    parameters: Record<string, any>
  ): Promise<{
    id: string;
    title: string;
    type: ReportSection['type'];
    data?: any;
    chart?: {
      type: string;
      data?: any[];
      options?: any;
    };
    recommendations?: string[];
    appendices?: any[];
  } | null> {
    if (!section.isVisible) return null;

    const sectionData: {
      id: string;
      title: string;
      type: ReportSection['type'];
      data?: any;
      chart?: {
        type: string;
        data?: any[];
        options?: any;
      };
      recommendations?: string[];
      appendices?: any[];
    } = {
      id: section.id,
      title: section.title,
      type: section.type
    };

    switch (section.type) {
      case 'summary':
        sectionData.data = this.generateSectionSummary(results, section.configuration);
        break;
      
      case 'chart':
        const chartData = this.generateChartData(results, section.configuration);
        sectionData.chart = {
          type: chartData.type,
          data: chartData.data,
          options: chartData.options
        }
        break;
      
      case 'table':
        sectionData.data = this.generateTableData(results, section.configuration);
        break;
      
      case 'list':
        sectionData.data = this.generateListData(results, section.configuration);
        break;
      
      case 'metrics':
        sectionData.data = this.generateMetricsData(results, section.configuration);
        break;
      
      case 'comparison':
        sectionData.data = this.generateComparisonData(results, section.configuration);
        break;
      
      default:
        sectionData.data = { message: 'Section type not implemented' };
    }

    return sectionData;
  }

  private static generateSectionSummary(results: AnalysisResult[], config: any) {
    return {
      totalFiles: results.length,
      averageComplexity: this.calculateAverage(results, 'metrics.cyclomaticComplexity'),
      riskDistribution: this.calculateRiskDistribution(results),
      technologyBreakdown: this.calculateTechnologyBreakdown(results)
    };
  }

  private static generateChartData(results: AnalysisResult[], config: any) {
    const { chartType, dataSource, groupBy, aggregation } = config;

    let data: any[] = [];

    switch (dataSource) {
      case 'complexity':
        data = this.generateComplexityChartData(results, chartType);
        break;
      case 'technology':
        data = this.generateTechnologyChartData(results, chartType);
        break;
      case 'risk':
        data = this.generateRiskChartData(results, chartType);
        break;
      case 'trends':
        data = this.generateTrendsChartData(results, chartType);
        break;
      default:
        data = [];
    }

    return {
      type: chartType,
      data,
      options: this.getChartOptions(chartType)
    };
  }

  private static generateTableData(results: AnalysisResult[], config: any) {
    const { columns, sortBy, sortOrder, limit } = config;

    let tableData: any[] = results.map(result => {
      const row: any = {};
      columns.forEach((col: string) => {
        row[col] = this.getNestedValue(result, col);
      });
      return row;
    });

    // Sort data
    if (sortBy) {
      tableData.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    // Limit results
    if (limit) {
      tableData = tableData.slice(0, limit);
    }

    return {
      headers: columns,
      rows: tableData
    };
  }

  private static generateListData(results: AnalysisResult[], config: any) {
    const { dataSource, limit } = config;

    switch (dataSource) {
      case 'high_risk_files':
        return results
          .filter(r => r.riskScore > 70)
          .slice(0, limit || 10)
          .map(r => ({
            title: r.filename,
            subtitle: `Risk Score: ${r.riskScore}`,
            description: `${r.securityIssues.length} security issues, ${r.performanceIssues.length} performance issues`
          }));
      
      case 'complex_files':
        return results
          .filter(r => r.metrics.cyclomaticComplexity > 10)
          .slice(0, limit || 10)
          .map(r => ({
            title: r.filename,
            subtitle: `Complexity: ${r.metrics.cyclomaticComplexity}`,
            description: `${r.metrics.linesOfCode} lines of code`
          }));
      
      default:
        return [];
    }
  }

  private static generateMetricsData(results: AnalysisResult[], config: any) {
    return {
      totalFiles: results.length,
      averageComplexity: this.calculateAverage(results, 'metrics.cyclomaticComplexity'),
      averageLOC: this.calculateAverage(results, 'metrics.linesOfCode'),
      averageRiskScore: this.calculateAverage(results, 'riskScore'),
      highComplexityFiles: results.filter(r => r.metrics.cyclomaticComplexity > 10).length,
      highRiskFiles: results.filter(r => r.riskScore > 70).length,
      totalSecurityIssues: results.reduce((sum, r) => sum + r.securityIssues.length, 0),
      totalPerformanceIssues: results.reduce((sum, r) => sum + r.performanceIssues.length, 0)
    };
  }

  private static generateComparisonData(results: AnalysisResult[], config: any) {
    // This would compare current results with previous analysis
    // For now, return placeholder data
    return {
      current: this.generateMetricsData(results, config),
      previous: null, // TODO: Implement historical comparison
      changes: {
        complexity: 0,
        riskScore: 0,
        issueCount: 0
      }
    };
  }

  private static generateRecommendations(results: AnalysisResult[]): string[] {
    const recommendations: string[] = [];

    // High complexity files
    const highComplexityFiles = results.filter(r => r.metrics.cyclomaticComplexity > 15);
    if (highComplexityFiles.length > 0) {
      recommendations.push(
        `Consider refactoring ${highComplexityFiles.length} files with high cyclomatic complexity (>15)`
      );
    }

    // Security issues
    const securityIssueCount = results.reduce((sum, r) => sum + r.securityIssues.length, 0);
    if (securityIssueCount > 0) {
      recommendations.push(
        `Address ${securityIssueCount} security issues found across analyzed files`
      );
    }

    // Performance issues
    const performanceIssueCount = results.reduce((sum, r) => sum + r.performanceIssues.length, 0);
    if (performanceIssueCount > 0) {
      recommendations.push(
        `Optimize ${performanceIssueCount} performance issues to improve application speed`
      );
    }

    // Technical debt
    const totalDebtHours = results.reduce((sum, r) => sum + (r.technicalDebt?.estimatedHours || 0), 0);
    if (totalDebtHours > 40) {
      recommendations.push(
        `Allocate ${Math.round(totalDebtHours)} hours to address accumulated technical debt`
      );
    }

    return recommendations;
  }

  private static generateAppendices(results: AnalysisResult[], template: any): { title: string; content: string; type: "text" | "table" | "list"; }[] {
    return [
      {
        title: 'Methodology',
        content: 'This analysis was performed using automated code analysis tools that evaluate complexity, security, and performance metrics.',
        type: 'text' as "text"
      },
      {
        title: 'File List',
        content: results.map(r => r.filename).join(', '),
        type: 'text' as "text"
      }
    ];
  }

  // Helper methods
  private static generateReportId(): string {
    return 'report_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private static interpolateString(template: string, parameters: Record<string, any>): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      return parameters[key] || match;
    });
  }

  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private static calculateAverage(results: AnalysisResult[], path: string): number {
    if (results.length === 0) return 0;
    
    const values = results.map(r => Number(this.getNestedValue(r, path)) || 0);
    const sum = values.reduce((acc, val) => acc + val, 0);
    return Math.round((sum / values.length) * 100) / 100;
  }

  private static calculateRiskDistribution(results: AnalysisResult[]) {
    const distribution = { low: 0, medium: 0, high: 0, critical: 0 };
    
    results.forEach(r => {
      if (r.riskScore <= 25) distribution.low++;
      else if (r.riskScore <= 50) distribution.medium++;
      else if (r.riskScore <= 75) distribution.high++;
      else distribution.critical++;
    });
    
    return distribution;
  }

  private static calculateTechnologyBreakdown(results: AnalysisResult[]) {
    const breakdown: Record<string, number> = {};
    
    results.forEach(r => {
      breakdown[r.technology] = (breakdown[r.technology] || 0) + 1;
    });
    
    return breakdown;
  }

  private static generateComplexityChartData(results: AnalysisResult[], chartType: string) {
    const complexityRanges = {
      'Low (1-5)': results.filter(r => r.metrics.cyclomaticComplexity <= 5).length,
      'Medium (6-10)': results.filter(r => r.metrics.cyclomaticComplexity > 5 && r.metrics.cyclomaticComplexity <= 10).length,
      'High (11-20)': results.filter(r => r.metrics.cyclomaticComplexity > 10 && r.metrics.cyclomaticComplexity <= 20).length,
      'Critical (>20)': results.filter(r => r.metrics.cyclomaticComplexity > 20).length
    };

    return Object.entries(complexityRanges).map(([name, value]) => ({ name, value }));
  }

  private static generateTechnologyChartData(results: AnalysisResult[], chartType: string) {
    const techCounts = this.calculateTechnologyBreakdown(results);
    return Object.entries(techCounts).map(([name, value]) => ({ name, value }));
  }

  private static generateRiskChartData(results: AnalysisResult[], chartType: string) {
    const riskDistribution = this.calculateRiskDistribution(results);
    return Object.entries(riskDistribution).map(([name, value]) => ({ name, value }));
  }

  private static generateTrendsChartData(results: AnalysisResult[], chartType: string) {
    // Group by analysis date and calculate metrics over time
    const groupedByDate: Record<string, AnalysisResult[]> = {};
    
    results.forEach(r => {
      const date = r.analyzedAt.toISOString().split('T')[0];
      if (!groupedByDate[date]) groupedByDate[date] = [];
      groupedByDate[date].push(r);
    });

    return Object.entries(groupedByDate).map(([date, dayResults]) => ({
      date,
      complexity: this.calculateAverage(dayResults, 'metrics.cyclomaticComplexity'),
      riskScore: this.calculateAverage(dayResults, 'riskScore'),
      fileCount: dayResults.length
    }));
  }

  private static getChartOptions(chartType: string) {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false
    };

    switch (chartType) {
      case 'pie':
        return {
          ...baseOptions,
          plugins: {
            legend: { position: 'right' }
          }
        };
      
      case 'bar':
        return {
          ...baseOptions,
          scales: {
            y: { beginAtZero: true }
          }
        };
      
      case 'line':
        return {
          ...baseOptions,
          scales: {
            x: { type: 'time' },
            y: { beginAtZero: true }
          }
        };
      
      default:
        return baseOptions;
    }
  }
}
