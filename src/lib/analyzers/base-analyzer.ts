import { createHash } from 'crypto';
import { ollamaClient } from '@/lib/ai/ollama-client';

export interface AnalysisMetrics {
  linesOfCode: number;
  codeLines: number;
  commentLines: number;
  blankLines: number;
  cyclomaticComplexity: number;
  nestingDepth: number;
  maintainabilityIndex: number;
  functionCount: number;
  classCount: number;
  loopCount: number;
  conditionalCount: number;
  sqlJoinCount: number;
  dependencyCount: number;
  complexityLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  detailedMetrics: Record<string, any>;
  issuesFound: Array<{
    line: number;
    column?: number;
    severity: 'info' | 'warning' | 'error';
    message: string;
    rule: string;
  }>;
}

export interface AnalysisResult {
  fileId: string;
  filename: string;
  technologyType: string;
  metrics: AnalysisMetrics;
  contentHash: string;
  analysisVersion: string;
  analyzedAt: Date;
}

// export abstract class BaseAnalyzer {
//   protected readonly ANALYSIS_VERSION = '1.0.0';

//   abstract getTechnologyType(): string;
  
//   /**
//    * Analyze code using AI or fallback to traditional analysis
//    */
//   async analyze(content: string, filename: string): Promise<AnalysisMetrics> {
//     try {
//       // Check if Ollama is available
//       const isOllamaAvailable = await ollamaClient.isAvailable();
      
//       if (!isOllamaAvailable) {
//         console.log('Ollama not available, falling back to traditional analysis');
//         return this.traditionalAnalyze(content, filename);
//       }

//       // Use AI to analyze the code
//       const prompt = `
//         Analyze this code and provide the following metrics in JSON format:
//         - linesOfCode: total number of lines
//         - codeLines: number of code lines (excluding comments and blank lines)
//         - commentLines: number of comment lines
//         - blankLines: number of blank lines
//         - cyclomaticComplexity: a number between 1-50 representing code complexity
//         - nestingDepth: maximum nesting level in the code
//         - functionCount: number of functions/methods
//         - classCount: number of classes/objects
//         - loopCount: number of loops
//         - conditionalCount: number of conditional statements
//         - sqlJoinCount: number of SQL joins if applicable
//         - dependencyCount: number of imports/dependencies
//         - complexityLevel: one of "low", "medium", "high", or "critical"
//         - riskScore: a number between 0-100 representing risk
        
//         Return ONLY valid JSON without any explanation or additional text.
//       `;

//       const aiResponse = await ollamaClient.generateSuggestion(prompt, content);
      
//       // Try to parse the AI response as JSON
//       try {
//         // Extract JSON from the response (in case AI added extra text)
//         const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
//         if (!jsonMatch) {
//           throw new Error('No valid JSON found in AI response');
//         }
        
//         const jsonStr = jsonMatch[0];
//         const metrics = JSON.parse(jsonStr);
        
//         // Validate and fill in any missing metrics
//         const validatedMetrics: AnalysisMetrics = {
//           linesOfCode: metrics.linesOfCode || content.split('\n').length,
//           codeLines: metrics.codeLines || 0,
//           commentLines: metrics.commentLines || 0,
//           blankLines: metrics.blankLines || 0,
//           cyclomaticComplexity: metrics.cyclomaticComplexity || 1,
//           nestingDepth: metrics.nestingDepth || 0,
//           maintainabilityIndex: metrics.maintainabilityIndex || 
//             this.calculateMaintainabilityIndex({ 
//               linesOfCode: metrics.linesOfCode, 
//               cyclomaticComplexity: metrics.cyclomaticComplexity 
//             }),
//           functionCount: metrics.functionCount || 0,
//           classCount: metrics.classCount || 0,
//           loopCount: metrics.loopCount || 0,
//           conditionalCount: metrics.conditionalCount || 0,
//           sqlJoinCount: metrics.sqlJoinCount || 0,
//           dependencyCount: metrics.dependencyCount || 0,
//           complexityLevel: metrics.complexityLevel || 'low',
//           riskScore: metrics.riskScore || 0,
//           detailedMetrics: metrics,
//           issuesFound: []
//         };
        
//         // Generate AI-powered suggestions
//         const securityIssues = await this.generateSecuritySuggestions(content);
//         const refactoringIssues = await this.generateRefactoringSuggestions(content, validatedMetrics.cyclomaticComplexity);
        
//         // Add AI-generated issues to the metrics
//         validatedMetrics.issuesFound = [
//           ...securityIssues.map(issue => ({
//             line: 0, // AI doesn't provide line numbers currently
//             severity: 'warning' as 'info' | 'warning' | 'error',
//             message: issue,
//             rule: 'security'
//           })),
//           ...refactoringIssues.map(issue => ({
//             line: 0, // AI doesn't provide line numbers currently
//             severity: 'info' as 'info' | 'warning' | 'error',
//             message: issue,
//             rule: 'refactoring'
//           }))
//         ];
        
//         return validatedMetrics;
//       } catch (parseError) {
//         console.error('Failed to parse AI response:', parseError);
//         return this.traditionalAnalyze(content, filename);
//       }
//     } catch (error) {
//       console.error('AI analysis failed:', error);
//       return this.traditionalAnalyze(content, filename);
//     }
//   }
  
//   /**
//    * Generate security suggestions using AI
//    */
//   protected async generateSecuritySuggestions(content: string): Promise<string[]> {
//     try {
//       return await ollamaClient.analyzeSecurity(content);
//     } catch (error) {
//       console.error('Failed to generate security suggestions:', error);
//       return [];
//     }
//   }

//   /**
//    * Generate refactoring suggestions using AI
//    */
//   protected async generateRefactoringSuggestions(content: string, complexity: number): Promise<string[]> {
//     try {
//       return await ollamaClient.suggestRefactoring(content, complexity);
//     } catch (error) {
//       console.error('Failed to generate refactoring suggestions:', error);
//       return [];
//     }
//   }
  
//   /**
//    * Traditional analysis method to be implemented by subclasses
//    */
//   protected abstract traditionalAnalyze(content: string, filename: string): Promise<AnalysisMetrics>;

//   /**
//    * Generate content hash for deduplication
//    */
//   protected generateContentHash(content: string): string {
//     return createHash('sha256').update(content).digest('hex');
//   }

//   /**
//    * Count different types of lines
//    */
//   protected countLines(content: string): {
//     total: number;
//     code: number;
//     comments: number;
//     blank: number;
//   } {
//     const lines = content.split('\n');
//     let codeLines = 0;
//     let commentLines = 0;
//     let blankLines = 0;

//     for (const line of lines) {
//       const trimmedLine = line.trim();
      
//       if (trimmedLine === '') {
//         blankLines++;
//       } else if (this.isCommentLine(trimmedLine)) {
//         commentLines++;
//       } else {
//         codeLines++;
//       }
//     }

//     return {
//       total: lines.length,
//       code: codeLines,
//       comments: commentLines,
//       blank: blankLines,
//     };
//   }

//   /**
//    * Check if line is a comment (to be overridden by specific analyzers)
//    */
//   protected abstract isCommentLine(line: string): boolean;

//   /**
//    * Calculate cyclomatic complexity
//    */
//   protected calculateCyclomaticComplexity(content: string): number {
//     // Base implementation - count decision points
//     const decisionKeywords = this.getDecisionKeywords();
//     let complexity = 1; // Base complexity

//     for (const keyword of decisionKeywords) {
//       const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
//       const matches = content.match(regex);
//       if (matches) {
//         complexity += matches.length;
//       }
//     }

//     return complexity;
//   }

//   /**
//    * Get decision keywords for complexity calculation
//    */
//   protected abstract getDecisionKeywords(): string[];

//   /**
//    * Calculate nesting depth
//    */
//   protected calculateNestingDepth(content: string): number {
//     const lines = content.split('\n');
//     let maxDepth = 0;
//     let currentDepth = 0;
    
//     const openingPatterns = this.getOpeningPatterns();
//     const closingPatterns = this.getClosingPatterns();

//     for (const line of lines) {
//       const trimmedLine = line.trim();
      
//       // Check for opening patterns
//       for (const pattern of openingPatterns) {
//         if (pattern.test(trimmedLine)) {
//           currentDepth++;
//           maxDepth = Math.max(maxDepth, currentDepth);
//         }
//       }
      
//       // Check for closing patterns
//       for (const pattern of closingPatterns) {
//         if (pattern.test(trimmedLine)) {
//           currentDepth = Math.max(0, currentDepth - 1);
//         }
//       }
//     }

//     return maxDepth;
//   }

//   /**
//    * Get opening patterns for nesting depth calculation
//    */
//   protected abstract getOpeningPatterns(): RegExp[];

//   /**
//    * Get closing patterns for nesting depth calculation
//    */
//   protected abstract getClosingPatterns(): RegExp[];

//   /**
//    * Count functions/subroutines
//    */
//   protected countFunctions(content: string): number {
//     const functionPatterns = this.getFunctionPatterns();
//     let count = 0;

//     for (const pattern of functionPatterns) {
//       const matches = content.match(pattern);
//       if (matches) {
//         count += matches.length;
//       }
//     }

//     return count;
//   }

//   /**
//    * Get function patterns for counting
//    */
//   protected abstract getFunctionPatterns(): RegExp[];

//   /**
//    * Count loops
//    */
//   protected countLoops(content: string): number {
//     const loopKeywords = this.getLoopKeywords();
//     let count = 0;

//     for (const keyword of loopKeywords) {
//       const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
//       const matches = content.match(regex);
//       if (matches) {
//         count += matches.length;
//       }
//     }

//     return count;
//   }

//   /**
//    * Get loop keywords
//    */
//   protected abstract getLoopKeywords(): string[];

//   /**
//    * Count SQL joins
//    */
//   protected countSqlJoins(content: string): number {
//     const joinPatterns = [
//       /\bINNER\s+JOIN\b/gi,
//       /\bLEFT\s+JOIN\b/gi,
//       /\bRIGHT\s+JOIN\b/gi,
//       /\bFULL\s+JOIN\b/gi,
//       /\bJOIN\b/gi,
//     ];

//     let count = 0;
//     for (const pattern of joinPatterns) {
//       const matches = content.match(pattern);
//       if (matches) {
//         count += matches.length;
//       }
//     }

//     return count;
//   }

//   /**
//    * Calculate maintainability index
//    */
//   protected calculateMaintainabilityIndex(metrics: Partial<AnalysisMetrics>): number {
//     const {
//       linesOfCode = 0,
//       cyclomaticComplexity = 1,
//       // Simplified calculation
//     } = metrics;

//     // Simplified maintainability index calculation
//     const logLOC = Math.log(Math.max(linesOfCode, 1));
//     const logCC = Math.log(Math.max(cyclomaticComplexity, 1));
    
//     let mi = 171 - 5.2 * logLOC - 0.23 * cyclomaticComplexity - 16.2 * logCC;
//     mi = Math.max(0, Math.min(100, mi)); // Clamp between 0-100

//     return Math.round(mi * 100) / 100; // Round to 2 decimal places
//   }

//   /**
//    * Calculate risk score
//    */
//   protected calculateRiskScore(metrics: AnalysisMetrics): number {
//     let score = 0;

//     // Complexity factors
//     if (metrics.cyclomaticComplexity > 20) score += 30;
//     else if (metrics.cyclomaticComplexity > 10) score += 20;
//     else if (metrics.cyclomaticComplexity > 5) score += 10;

//     // Size factors
//     if (metrics.linesOfCode > 1000) score += 20;
//     else if (metrics.linesOfCode > 500) score += 10;

//     // Nesting factors
//     if (metrics.nestingDepth > 5) score += 25;
//     else if (metrics.nestingDepth > 3) score += 15;

//     // Maintainability factors
//     if (metrics.maintainabilityIndex < 20) score += 25;
//     else if (metrics.maintainabilityIndex < 40) score += 15;

//     return Math.min(100, score);
//   }

//   /**
//    * Determine complexity level
//    */
//   protected determineComplexityLevel(metrics: AnalysisMetrics): 'low' | 'medium' | 'high' | 'critical' {
//     const riskScore = metrics.riskScore;

//     if (riskScore >= 75) return 'critical';
//     if (riskScore >= 50) return 'high';
//     if (riskScore >= 25) return 'medium';
//     return 'low';
//   }

//   /**
//    * Create analysis result
//    */
//   public async createAnalysisResult(
//     content: string,
//     filename: string,
//     fileId: string
//   ): Promise<AnalysisResult> {
//     const metrics = await this.analyze(content, filename);
    
//     return {
//       fileId,
//       filename,
//       technologyType: this.getTechnologyType(),
//       metrics,
//       contentHash: this.generateContentHash(content),
//       analysisVersion: this.ANALYSIS_VERSION,
//       analyzedAt: new Date(),
//     };
//   }
// }
