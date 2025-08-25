// import { BaseAnalyzer, AnalysisMetrics } from './base-analyzer';
// import { complexityCalculator } from './complexity-calculator';
// import { dependencyAnalyzer } from './dependency-analyzer';

// export class TibcoAnalyzer extends BaseAnalyzer {
//   getTechnologyType(): string {
//     return 'tibco';
//   }

//   /**
//    * Traditional analysis implementation for Tibco code
//    */
//   protected async traditionalAnalyze(content: string, filename: string): Promise<AnalysisMetrics> {
//     const lineCount = this.countLines(content);
//     const activityCount = this.countActivities(content);
//     const processComplexity = this.calculateProcessComplexity(content);
//     const nestingDepth = this.calculateProcessNestingDepth(content);
//     const dependencyAnalysis = dependencyAnalyzer.analyzeDependencies(content, 'tibco');
//     const issuesFound = this.findIssues(content);

//     const partialMetrics = {
//       linesOfCode: lineCount.total,
//       codeLines: lineCount.code,
//       commentLines: lineCount.comments,
//       blankLines: lineCount.blank,
//       cyclomaticComplexity: processComplexity,
//       nestingDepth,
//       functionCount: activityCount,
//       classCount: this.countProcesses(content),
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
//         processType: this.getProcessType(content),
//         activityTypes: this.getActivityTypes(content),
//         transitionCount: this.countTransitions(content),
//         variableCount: this.countVariables(content),
//         serviceCount: this.countServices(content),
//         exceptionHandlers: this.countExceptionHandlers(content),
//         performanceImpactActivities: this.getPerformanceImpactActivities(content),
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
//     return ['choice', 'switch', 'if', 'condition', 'otherwise'];
//   }

//   protected getOpeningPatterns(): RegExp[] {
//     return [
//       /<pd:activity/g,
//       /<pd:process/g,
//       /<pd:group/g,
//       /<pd:sequence/g,
//     ];
//   }

//   protected getClosingPatterns(): RegExp[] {
//     return [
//       /<\/pd:activity>/g,
//       /<\/pd:process>/g,
//       /<\/pd:group>/g,
//       /<\/pd:sequence>/g,
//     ];
//   }

//   protected getFunctionPatterns(): RegExp[] {
//     return [
//       /<pd:activity[^>]+name="[^"]+"/g,
//       /<pd:process[^>]+name="[^"]+"/g,
//     ];
//   }

//   protected getLoopKeywords(): string[] {
//     return ['while', 'repeat', 'foreach', 'group'];
//   }

//   private countActivities(content: string): number {
//     const activityMatches = content.match(/<pd:activity/g);
//     return activityMatches ? activityMatches.length : 0;
//   }

//   private countProcesses(content: string): number {
//     const processMatches = content.match(/<pd:process/g);
//     return processMatches ? processMatches.length : 0;
//   }

//   private calculateProcessComplexity(content: string): number {
//     let complexity = 1; // Base complexity
    
//     // Add complexity for different activity types
//     const complexActivities = [
//       'com.tibco.pe.core.CallProcessActivity',
//       'com.tibco.pe.core.ChoiceActivity', 
//       'com.tibco.pe.core.WhileActivity',
//       'com.tibco.pe.core.ForEachActivity',
//       'com.tibco.pe.core.RepeatUntilActivity',
//       'com.tibco.plugin.jdbc.JDBCQueryActivity',
//       'com.tibco.plugin.xml.XMLParseActivity',
//       'com.tibco.plugin.xml.XMLRenderActivity'
//     ];
    
//     complexActivities.forEach(activityType => {
//       const regex = new RegExp(`type="${activityType}"`, 'g');
//       const matches = content.match(regex);
//       if (matches) {
//         complexity += matches.length;
//       }
//     });
    
//     // Add extra complexity for conditional activities
//     const conditionalActivities = [
//       'com.tibco.pe.core.ChoiceActivity',
//       'com.tibco.pe.core.IfActivity'
//     ];
    
//     conditionalActivities.forEach(activityType => {
//       const regex = new RegExp(`type="${activityType}"`, 'g');
//       const matches = content.match(regex);
//       if (matches) {
//         complexity += matches.length; // Double count for conditional logic
//       }
//     });
    
//     return complexity;
//   }

//   private calculateProcessNestingDepth(content: string): number {
//     let maxDepth = 0;
//     let currentDepth = 0;
//     const lines = content.split('\n');
    
//     for (const line of lines) {
//       const trimmed = line.trim();
      
//       if (trimmed.includes('<pd:group') || trimmed.includes('<pd:sequence')) {
//         currentDepth++;
//         maxDepth = Math.max(maxDepth, currentDepth);
//       }
      
//       if (trimmed.includes('</pd:group>') || trimmed.includes('</pd:sequence>')) {
//         currentDepth = Math.max(0, currentDepth - 1);
//       }
//     }
    
//     return maxDepth;
//   }

//   private countTransitions(content: string): number {
//     const transitionMatches = content.match(/<pd:transition/g);
//     return transitionMatches ? transitionMatches.length : 0;
//   }

//   private countVariables(content: string): number {
//     const variableMatches = content.match(/<pd:variable/g);
//     return variableMatches ? variableMatches.length : 0;
//   }

//   private countServices(content: string): number {
//     const serviceMatches = content.match(/<pd:service/g);
//     return serviceMatches ? serviceMatches.length : 0;
//   }

//   private countExceptionHandlers(content: string): number {
//     const exceptionMatches = content.match(/<pd:handler/g);
//     return exceptionMatches ? exceptionMatches.length : 0;
//   }

//   protected countLoops(content: string): number {
//     const loopActivities = [
//       'com.tibco.pe.core.WhileActivity',
//       'com.tibco.pe.core.ForEachActivity',
//       'com.tibco.pe.core.RepeatUntilActivity',
//       'com.tibco.pe.core.GroupActivity'
//     ];
    
//     let count = 0;
//     loopActivities.forEach(activityType => {
//       const regex = new RegExp(`type="${activityType}"`, 'g');
//       const matches = content.match(regex);
//       if (matches) {
//         count += matches.length;
//       }
//     });
    
//     return count;
//   }

//   private countConditionals(content: string): number {
//     const conditionalActivities = [
//       'com.tibco.pe.core.ChoiceActivity',
//       'com.tibco.pe.core.IfActivity'
//     ];
    
//     let count = 0;
//     conditionalActivities.forEach(activityType => {
//       const regex = new RegExp(`type="${activityType}"`, 'g');
//       const matches = content.match(regex);
//       if (matches) {
//         count += matches.length;
//       }
//     });
    
//     return count;
//   }

//   private getProcessType(content: string): string {
//     if (content.includes('com.tibco.pe.core.ProcessDefinition')) {
//       return 'process';
//     } else if (content.includes('com.tibco.pe.core.ServiceDefinition')) {
//       return 'service';
//     }
//     return 'unknown';
//   }

//   private getActivityTypes(content: string): string[] {
//     const activityTypes: string[] = [];
//     const typeMatches = content.match(/type="([^"]+)"/g);
    
//     if (typeMatches) {
//       typeMatches.forEach(match => {
//         const typeMatch = match.match(/type="([^"]+)"/);
//         if (typeMatch) {
//           const activityType = typeMatch[1];
//           if (activityType.includes('com.tibco')) {
//             activityTypes.push(activityType.split('.').pop() || activityType);
//           }
//         }
//       });
//     }
    
//     return [...new Set(activityTypes)];
//   }

//   private getPerformanceImpactActivities(content: string): string[] {
//     const performanceActivities = [
//       'JDBCQueryActivity',
//       'JDBCUpdateActivity',
//       'XMLParseActivity',
//       'XMLRenderActivity',
//       'WriteFileActivity',
//       'ReadFileActivity',
//       'CallProcessActivity'
//     ];
    
//     const foundActivities: string[] = [];
    
//     performanceActivities.forEach(activityType => {
//       const regex = new RegExp(`type="[^"]*${activityType}"`, 'g');
//       const matches = content.match(regex);
//       if (matches) {
//         foundActivities.push(activityType);
//       }
//     });
    
//     return foundActivities;
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
//       if (line.includes('JDBCQueryActivity') && line.includes('maxRows="-1"')) {
//         issues.push({
//           line: lineNumber,
//           severity: 'warning' as const,
//           message: 'Unlimited result set can cause memory issues',
//           rule: 'performance-unlimited-resultset',
//         });
//       }

//       if (line.includes('CallProcessActivity') && !line.includes('asyncCall="true"')) {
//         issues.push({
//           line: lineNumber,
//           severity: 'info' as const,
//           message: 'Consider using asynchronous calls for better performance',
//           rule: 'performance-sync-call',
//         });
//       }

//       // Check for hardcoded values
//       if (line.includes('jdbcProperty') && line.includes('value=') && !line.includes('$')) {
//         issues.push({
//           line: lineNumber,
//           severity: 'warning' as const,
//           message: 'Hardcoded database connection detected, use variables instead',
//           rule: 'maintainability-hardcoded-db',
//         });
//       }

//       // Check for missing error handling
//       if (line.includes('type="com.tibco.plugin.jdbc.JDBCQueryActivity"')) {
//         const hasErrorHandler = content.includes('<pd:handler type="com.tibco.pe.core.ExceptionHandler"');
//         if (!hasErrorHandler) {
//           issues.push({
//             line: lineNumber,
//             severity: 'warning' as const,
//             message: 'Consider adding error handling for database operations',
//             rule: 'reliability-error-handling',
//           });
//         }
//       }

//       // Check for deprecated activities
//       if (line.includes('com.tibco.plugin.xml.XMLParseActivity')) {
//         issues.push({
//           line: lineNumber,
//           severity: 'info' as const,
//           message: 'Consider migrating to newer XML processing activities',
//           rule: 'modernization-deprecated-activity',
//         });
//       }
//     }

//     return issues;
//   }
// }
