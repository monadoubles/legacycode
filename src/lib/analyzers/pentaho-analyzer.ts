// import { BaseAnalyzer, AnalysisMetrics } from './base-analyzer';
// import { dependencyAnalyzer } from './dependency-analyzer';

// export class PentahoAnalyzer extends BaseAnalyzer {
//   getTechnologyType(): string {
//     return 'pentaho';
//   }

//   /**
//    * Traditional analysis implementation for Pentaho code
//    */
//   protected async traditionalAnalyze(content: string, filename: string): Promise<AnalysisMetrics> {
//     // Parse Pentaho XML content
//     const parsedContent = this.parseXML(content);
    
//     const lineCount = this.countLines(content);
//     const stepCount = this.countSteps(content);
//     const transformationComplexity = this.calculateTransformationComplexity(content);
//     const nestingDepth = this.calculateNestingDepth(content);
//     const dependencyAnalysis = dependencyAnalyzer.analyzeDependencies(content, 'pentaho');
//     const issuesFound = this.findIssues(content);

//     const partialMetrics = {
//       linesOfCode: lineCount.total,
//       codeLines: lineCount.code,
//       commentLines: lineCount.comments,
//       blankLines: lineCount.blank,
//       cyclomaticComplexity: transformationComplexity,
//       nestingDepth,
//       functionCount: stepCount,
//       classCount: 0,
//       loopCount: this.countLoops(content),
//       conditionalCount: this.countConditionals(content),
//       sqlJoinCount: this.countSqlJoins(content),
//       dependencyCount: dependencyAnalysis.totalCount,
//     };

//     const maintainabilityIndex = this.calculateMaintainabilityIndex(partialMetrics);
    
//     const metrics: AnalysisMetrics = {
//       ...partialMetrics,
//       maintainabilityIndex,
//       riskScore: 0,
//       complexityLevel: 'low',
//       detailedMetrics: {
//         transformationType: this.getTransformationType(content),
//         stepTypes: this.getStepTypes(content),
//         connectionCount: this.countConnections(content),
//         hopCount: this.countHops(content),
//         errorHandlingSteps: this.countErrorHandlingSteps(content),
//         performanceImpactSteps: this.getPerformanceImpactSteps(content),
//       },
//       issuesFound,
//     };

//     metrics.riskScore = this.calculateRiskScore(metrics);
//     metrics.complexityLevel = this.determineComplexityLevel(metrics);

//     return metrics;
//   }

//   protected isCommentLine(line: string): boolean {
//     const trimmed = line.trim();
//     return trimmed.startsWith('<!--') || trimmed.includes('<!-- ') || trimmed.endsWith('-->');
//   }

//   protected getDecisionKeywords(): string[] {
//     return ['filter', 'switch', 'case', 'if', 'condition'];
//   }

//   protected getOpeningPatterns(): RegExp[] {
//     return [
//       /<step>/g,
//       /<transformation>/g,
//       /<job>/g,
//       /<hop>/g,
//     ];
//   }

//   protected getClosingPatterns(): RegExp[] {
//     return [
//       /<\/step>/g,
//       /<\/transformation>/g,
//       /<\/job>/g,
//       /<\/hop>/g,
//     ];
//   }

//   protected getFunctionPatterns(): RegExp[] {
//     return [
//       /<step>/g,
//       /<entry>/g,
//     ];
//   }

//   protected getLoopKeywords(): string[] {
//     return ['loop', 'iterate', 'repeat'];
//   }

//   /**
//    * Count loops in Pentaho transformations
//    */
//   protected countLoops(content: string): number {
//     // Count loop-related steps in Pentaho
//     const loopSteps = [
//       'SingleThreader',
//       'BlockingStep',
//       'ExecuteForEach',
//       'JobExecutor',
//       'LoopRows',
//       'Repeat',
//       'SingleThreader'
//     ];

//     let count = 0;
//     for (const step of loopSteps) {
//       const regex = new RegExp(`<type>${step}</type>`, 'gi');
//       const matches = content.match(regex);
//       if (matches) {
//         count += matches.length;
//       }
//     }
    
//     return count;
//   }

//   private parseXML(content: string): any {
//     // Simple XML parsing for Pentaho files
//     try {
//       return { parsed: true, content };
//     } catch (error: any) {
//       return { parsed: false, error: error.message };
//     }
//   }

//   private countSteps(content: string): number {
//     const stepMatches = content.match(/<step>/g);
//     const entryMatches = content.match(/<entry>/g);
//     return (stepMatches ? stepMatches.length : 0) + (entryMatches ? entryMatches.length : 0);
//   }

//   private calculateTransformationComplexity(content: string): number {
//     let complexity = 1; // Base complexity
    
//     // Add complexity for different step types
//     const complexSteps = [
//       'JavaScriptValueMod',
//       'ScriptValueMod', 
//       'ExecSQL',
//       'ExecSQLRow',
//       'DBLookup',
//       'DatabaseJoin',
//       'SortRows',
//       'GroupBy',
//       'Unique',
//       'SplitFields'
//     ];
    
//     complexSteps.forEach(stepType => {
//       const regex = new RegExp(`<type>${stepType}</type>`, 'g');
//       const matches = content.match(regex);
//       if (matches) {
//         complexity += matches.length;
//       }
//     });
    
//     // Add complexity for conditional steps
//     const conditionalSteps = ['FilterRows', 'SwitchCase', 'IfNull'];
//     conditionalSteps.forEach(stepType => {
//       const regex = new RegExp(`<type>${stepType}</type>`, 'g');
//       const matches = content.match(regex);
//       if (matches) {
//         complexity += matches.length * 2; // Conditional logic adds more complexity
//       }
//     });
    
//     return complexity;
//   }

//   private countConnections(content: string): number {
//     const connectionMatches = content.match(/<connection>/g);
//     return connectionMatches ? connectionMatches.length : 0;
//   }

//   private countHops(content: string): number {
//     const hopMatches = content.match(/<hop>/g);
//     return hopMatches ? hopMatches.length : 0;
//   }


//   private countConditionals(content: string): number {
//     const conditionalSteps = ['FilterRows', 'SwitchCase', 'IfNull', 'Abort'];
//     let count = 0;
    
//     conditionalSteps.forEach(stepType => {
//       const regex = new RegExp(`<type>${stepType}</type>`, 'g');
//       const matches = content.match(regex);
//       if (matches) {
//         count += matches.length;
//       }
//     });
    
//     return count;
//   }

//   private countErrorHandlingSteps(content: string): number {
//     const errorSteps = ['Abort', 'WriteToLog', 'MailValidator'];
//     let count = 0;
    
//     errorSteps.forEach(stepType => {
//       const regex = new RegExp(`<type>${stepType}</type>`, 'g');
//       const matches = content.match(regex);
//       if (matches) {
//         count += matches.length;
//       }
//     });
    
//     return count;
//   }

//   private getTransformationType(content: string): string {
//     if (content.includes('<transformation>')) {
//       return 'transformation';
//     } else if (content.includes('<job>')) {
//       return 'job';
//     }
//     return 'unknown';
//   }

//   private getStepTypes(content: string): string[] {
//     const stepTypes: string[] = [];
//     const typeMatches = content.match(/<type>([^<]+)<\/type>/g);
    
//     if (typeMatches) {
//       typeMatches.forEach(match => {
//         const typeMatch = match.match(/<type>([^<]+)<\/type>/);
//         if (typeMatch) {
//           stepTypes.push(typeMatch[1]);
//         }
//       });
//     }
    
//     return [...new Set(stepTypes)]; // Remove duplicates
//   }

//   private getPerformanceImpactSteps(content: string): string[] {
//     const performanceSteps = [
//       'SortRows',
//       'GroupBy',
//       'DatabaseJoin',
//       'DBLookup',
//       'ExecSQL',
//       'ExecSQLRow',
//       'Unique',
//       'MergeJoin'
//     ];
    
//     const foundSteps: string[] = [];
    
//     performanceSteps.forEach(stepType => {
//       const regex = new RegExp(`<type>${stepType}</type>`, 'g');
//       const matches = content.match(regex);
//       if (matches) {
//         foundSteps.push(stepType);
//       }
//     });
    
//     return foundSteps;
//   }

//   private findIssues(content: string): Array<{
//     line: number;
//     column?: number;
//     severity: 'info' | 'warning' | 'error';
//     message: string;
//     rule: string;
//   }> {
//     const issues = [];
//     const lines = content.split('\n');

//     for (let i = 0; i < lines.length; i++) {
//       const line = lines[i];
//       const lineNumber = i + 1;

//       // Check for performance issues
//       if (line.includes('<type>SortRows</type>')) {
//         issues.push({
//           line: lineNumber,
//           severity: 'warning' as const,
//           message: 'SortRows step can be memory-intensive with large datasets',
//           rule: 'performance-sort-rows',
//         });
//       }

//       if (line.includes('<type>ExecSQL</type>')) {
//         issues.push({
//           line: lineNumber,
//           severity: 'warning' as const,
//           message: 'ExecSQL step should be used carefully, consider using dedicated database steps',
//           rule: 'performance-exec-sql',
//         });
//       }

//       // Check for hardcoded connections
//       if (line.includes('password=') && !line.includes('${')) {
//         issues.push({
//           line: lineNumber,
//           severity: 'error' as const,
//           message: 'Hardcoded password detected, use variables instead',
//           rule: 'security-hardcoded-password',
//         });
//       }

//       // Check for missing error handling
//       if (line.includes('<type>TableInput</type>') || line.includes('<type>TableOutput</type>')) {
//         const hasErrorHandling = content.includes('<type>Abort</type>') || content.includes('error_handling="Y"');
//         if (!hasErrorHandling) {
//           issues.push({
//             line: lineNumber,
//             severity: 'warning' as const,
//             message: 'Consider adding error handling for database operations',
//             rule: 'reliability-error-handling',
//           });
//         }
//       }
//     }

//     return issues;
//   }
// }
