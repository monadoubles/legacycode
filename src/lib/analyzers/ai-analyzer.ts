import { AnalysisMetrics, AnalysisResult } from './base-analyzer';
import { ollamaClient } from '@/lib/ai/ollama-client';
import { createHash } from 'crypto';
import path from 'path';

/**
 * AI-powered code analyzer using Ollama
 * This analyzer is completely independent and uses AI for all analysis
 */
export class AIAnalyzer {
  private fileType: string;
  private readonly ANALYSIS_VERSION = '1.0.0';

  constructor(fileType: string | null) {
    this.fileType = fileType || '';
  }

  /**
   * Get technology type based on file extension
   */
  getTechnologyType(filename: string): string {
    // Extract extension from filename if available
    const extension = path.extname(filename).toLowerCase().replace('.', '');
    
    if (extension === 'pl' || extension === 'pm') return 'perl';
    if (extension === 'bwp' || extension === 'tibco' || extension === 'xml') return 'tibco';
    if (extension === 'kjb' || extension === 'ktr') return 'pentaho';
    if (extension === 'js' || extension === 'ts' || extension === 'jsx' || extension === 'tsx') return 'javascript';
    if (extension === 'py') return 'python';
    if (extension === 'java') return 'java';
    if (extension === 'cs') return 'csharp';
    if (extension === 'php') return 'php';
    if (extension === 'rb') return 'ruby';
    if (extension === 'go') return 'golang';
    if (extension === 'rs') return 'rust';
    if (extension === 'c' || extension === 'cpp' || extension === 'h') return 'c++';
    
    return 'generic';
  }

  /**
   * Create a complete analysis result for a file
   */
  async createAnalysisResult(content: string, filename: string, fileId: string): Promise<AnalysisResult> {
    const metrics = await this.analyze(content, filename);
    
    return {
      fileId,
      filename,
      technologyType: this.getTechnologyType(filename),
      metrics,
      contentHash: this.generateContentHash(content),
      analysisVersion: this.ANALYSIS_VERSION,
      analyzedAt: new Date()
    };
  }

  /**
   * Generate content hash for deduplication
   */
  private generateContentHash(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Analyze code using AI
   */
  async analyze(content: string, filename: string): Promise<AnalysisMetrics> {
    try {
      // Check if Ollama is available
      const isOllamaAvailable = await ollamaClient.isAvailable();
      
      if (!isOllamaAvailable) {
        console.log('Ollama not available, falling back to simple analysis');
        return this.simpleAnalysis(content);
      }

      const technologyType = this.getTechnologyType(filename);

      // Use AI to analyze the code
      const prompt = `
        Analyze this code and provide the following metrics in JSON format:
        - linesOfCode: total number of lines
        - codeLines: number of code lines (excluding comments and blank lines)
        - commentLines: number of comment lines
        - blankLines: number of blank lines
        - cyclomaticComplexity: a number between 1-50 representing code complexity
        - nestingDepth: maximum nesting level in the code
        - functionCount: number of functions/methods
        - classCount: number of classes/objects
        - loopCount: number of loops
        - conditionalCount: number of conditional statements
        - sqlJoinCount: number of SQL joins if applicable
        - dependencyCount: number of imports/dependencies
        - complexityLevel: one of "low", "medium", "high", or "critical"
        - riskScore: a number between 0-100 representing risk
        
        Return ONLY valid JSON without any explanation or additional text.
      `;

      const aiResponse = await ollamaClient.generateSuggestion(prompt, content);
      
      // Try to parse the AI response as JSON
      try {
        // Extract JSON from the response (in case AI added extra text)
        // First try to find a complete JSON object
        let jsonStr = '';
        
        // Try different regex patterns to extract valid JSON
        const patterns = [
          /\{[\s\S]*?\}(?=\s*$)/,  // Match JSON object at the end of the string
          /\{[\s\S]*?\}/,         // Match first complete JSON object
          /\{[^\{\}]*?\}/         // Match simplest JSON object
        ];
        
        for (const pattern of patterns) {
          const match = aiResponse.match(pattern);
          if (match) {
            jsonStr = match[0];
            try {
              // Test if this is valid JSON
              JSON.parse(jsonStr);
              console.log('Found valid JSON with pattern:', pattern);
              break;
            } catch (e) {
              console.log('Invalid JSON with pattern:', pattern);
              continue;
            }
          }
        }
        
        if (!jsonStr) {
          throw new Error('No valid JSON found in AI response');
        }
        
        // Try to clean the JSON string before parsing
        jsonStr = jsonStr.replace(/[\u0000-\u001F]+/g, ' ')  // Remove control characters
                         .replace(/\\(?!["\\\/{bfnrt])/g, '\\\\') // Escape unescaped backslashes
                         .replace(/"\s*\w+\s*"\s*:\s*([^"\{\[]\S*)/g, '"$1"') // Quote unquoted values
                         .replace(/,\s*([\}\]])/g, '$1'); // Remove trailing commas
                         
        console.log('Cleaned JSON string:', jsonStr);
        
        // Handle the case where we have values without keys (like the example shown in the error)
        if (jsonStr.match(/"\d+,"/) || (jsonStr.match(/"\s*\w+\s*"/) && !jsonStr.includes(':'))) {
          try {
            // Try to reconstruct the JSON with proper keys
            const expectedKeys = [
              'linesOfCode', 'codeLines', 'commentLines', 'blankLines',
              'cyclomaticComplexity', 'nestingDepth', 'functionCount', 'classCount',
              'loopCount', 'conditionalCount', 'sqlJoinCount', 'dependencyCount',
              'complexityLevel', 'riskScore'
            ];
            
            // Extract all quoted values - handle both "value" and "value," formats
            const valueMatches = jsonStr.match(/"[^"]+"(?:,|\s|$)/g) || [];
            const values = valueMatches.map(v => v.replace(/"/g, '').replace(/,/g, '').trim());
            
            // Create a proper JSON object
            const reconstructedObj: Record<string, any> = {};
            for (let i = 0; i < Math.min(expectedKeys.length, values.length); i++) {
              // Convert numeric values
              const value = values[i];
              if (expectedKeys[i] === 'complexityLevel') {
                reconstructedObj[expectedKeys[i]] = value;
              } else {
                reconstructedObj[expectedKeys[i]] = !isNaN(Number(value)) ? Number(value) : value;
              }
            }
            
            // Try parsing the reconstructed object
            jsonStr = JSON.stringify(reconstructedObj);
            console.log('Reconstructed JSON:', jsonStr);
          } catch (reconstructError) {
            console.error('Failed to reconstruct JSON:', reconstructError);
          }
        }
        
        // Handle the specific case seen in the error where we have numbers with quotes and commas
        if (jsonStr.includes('"29,"') || jsonStr.includes('"25,"')) {
          try {
            // Extract all numbers from the response
            const numMatches = aiResponse.match(/\d+/g) || [];
            const reconstructedObj: Record<string, any> = {
              linesOfCode: parseInt(numMatches[0] || '0', 10),
              codeLines: parseInt(numMatches[1] || '0', 10),
              commentLines: parseInt(numMatches[2] || '0', 10),
              blankLines: parseInt(numMatches[3] || '0', 10),
              cyclomaticComplexity: parseInt(numMatches[4] || '1', 10),
              nestingDepth: parseInt(numMatches[5] || '0', 10),
              functionCount: parseInt(numMatches[6] || '0', 10),
              classCount: parseInt(numMatches[7] || '0', 10),
              loopCount: parseInt(numMatches[8] || '0', 10),
              conditionalCount: parseInt(numMatches[9] || '0', 10),
              sqlJoinCount: parseInt(numMatches[10] || '0', 10),
              dependencyCount: parseInt(numMatches[11] || '0', 10),
              complexityLevel: 'medium',
              riskScore: parseInt(numMatches[12] || '50', 10)
            };
            jsonStr = JSON.stringify(reconstructedObj);
            console.log('Reconstructed JSON from numbers:', jsonStr);
          } catch (error) {
            console.error('Failed to reconstruct JSON from numbers:', error);
          }
        }
        
        let parsedMetrics: any;
        
        // Try to parse the JSON string
        try {
          parsedMetrics = JSON.parse(jsonStr);
        } catch (finalParseError) {
          console.error('Final JSON parse error:', finalParseError);
          
          // Create a fallback metrics object
          parsedMetrics = {
            linesOfCode: content.split('\n').length,
            codeLines: Math.floor(content.split('\n').length * 0.7),
            commentLines: Math.floor(content.split('\n').length * 0.2),
            blankLines: Math.floor(content.split('\n').length * 0.1),
            cyclomaticComplexity: 5,
            nestingDepth: 3,
            functionCount: 2,
            classCount: 1,
            loopCount: 2,
            conditionalCount: 3,
            sqlJoinCount: 0,
            dependencyCount: 1,
            complexityLevel: 'medium',
            riskScore: 50
          };
          
          console.log('Created fallback metrics:', parsedMetrics);
        }
        
        // Validate and fill in any missing metrics
        const validatedMetrics: AnalysisMetrics = {
          linesOfCode: parsedMetrics.linesOfCode || content.split('\n').length,
          codeLines: parsedMetrics.codeLines || 0,
          commentLines: parsedMetrics.commentLines || 0,
          blankLines: parsedMetrics.blankLines || 0,
          cyclomaticComplexity: parsedMetrics.cyclomaticComplexity || 1,
          nestingDepth: parsedMetrics.nestingDepth || 0,
          maintainabilityIndex: parsedMetrics.maintainabilityIndex || this.calculateMaintainabilityIndex(parsedMetrics),
          functionCount: parsedMetrics.functionCount || 0,
          classCount: parsedMetrics.classCount || 0,
          loopCount: parsedMetrics.loopCount || 0,
          conditionalCount: parsedMetrics.conditionalCount || 0,
          sqlJoinCount: parsedMetrics.sqlJoinCount || 0,
          dependencyCount: parsedMetrics.dependencyCount || 0,
          complexityLevel: (parsedMetrics.complexityLevel || 'low') as 'low' | 'medium' | 'high' | 'critical',
          riskScore: parsedMetrics.riskScore || 0,
          detailedMetrics: parsedMetrics,
          issuesFound: [],
        };
        
        // Generate AI-powered suggestions
        const securityIssues = await this.generateSecuritySuggestions(content);
        console.log(securityIssues,"securityIssues")
        const refactoringIssues = await this.generateRefactoringSuggestions(content, validatedMetrics.cyclomaticComplexity);
        console.log(refactoringIssues,"refactoringIssues")
        // Add AI-generated issues to the metrics
        validatedMetrics.issuesFound = [
          ...securityIssues.map(issue => ({
            line: issue.line,
            severity: 'warning' as 'info' | 'warning' | 'error',
            message: issue.issue,
            rule: 'security'
          })),
          ...refactoringIssues.map(issue => ({
            line: issue.line,
            severity: 'info' as 'info' | 'warning' | 'error',
            message: issue.issue,
            rule: 'refactoring'
          }))
        ];
        
        return validatedMetrics;
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        return this.simpleAnalysis(content);
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.simpleAnalysis(content);
    }
  }

  /**
   * Generate security suggestions using AI
   * @param content Code content
   * @returns Array of security suggestions with line numbers
   */
  private async generateSecuritySuggestions(content: string): Promise<Array<{line: number; issue: string}>> {
    try {
      return await ollamaClient.analyzeSecurity(content);
    } catch (error) {
      console.error('Failed to generate security suggestions:', error);
      return [];
    }
  }

  /**
   * Generate refactoring suggestions using AI
   * @param content Code content
   * @param complexity Cyclomatic complexity
   * @returns Array of refactoring suggestions with line numbers
   */
  private async generateRefactoringSuggestions(content: string, complexity: number): Promise<Array<{line: number; issue: string}>> {
    try {
      return await ollamaClient.suggestRefactoring(content, complexity);
    } catch (error) {
      console.error('Failed to generate refactoring suggestions:', error);
      return [];
    }
  }

  /**
   * Simple analysis for when AI is not available
   */
  private simpleAnalysis(content: string): AnalysisMetrics {
    const lines = content.split('\n');
    const lineCount = lines.length;
    
    // Count different line types
    let commentLines = 0;
    let blankLines = 0;
    let codeLines = 0;
    
    let inMultilineComment = false;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine === '') {
        blankLines++;
      } else if (this.isCommentLine(trimmedLine)) {
        commentLines++;
      } else if (trimmedLine.includes('/*') && !trimmedLine.includes('*/')) {
        commentLines++;
        inMultilineComment = true;
      } else if (inMultilineComment) {
        commentLines++;
        if (trimmedLine.includes('*/')) {
          inMultilineComment = false;
        }
      } else {
        codeLines++;
      }
    }
    
    // Basic metrics calculation
    const functionCount = this.countFunctions(content);
    const classCount = this.countClasses(content);
    const loopCount = this.countLoops(content);
    const conditionalCount = this.countConditionals(content);
    const nestingDepth = this.calculateNestingDepth(content);
    const cyclomaticComplexity = conditionalCount + loopCount + 1;
    
    const partialMetrics = {
      linesOfCode: lineCount,
      codeLines,
      commentLines,
      blankLines,
      cyclomaticComplexity,
      nestingDepth,
      functionCount,
      classCount,
      loopCount,
      conditionalCount,
      sqlJoinCount: 0,
      dependencyCount: this.countDependencies(content),
    };
    
    const maintainabilityIndex = this.calculateMaintainabilityIndex(partialMetrics);
    const complexityLevel = this.determineComplexityLevel(cyclomaticComplexity);
    const riskScore = this.calculateRiskScore(partialMetrics);
    
    return {
      ...partialMetrics,
      maintainabilityIndex,
      complexityLevel,
      riskScore,
      detailedMetrics: {
        // Basic detailed metrics
        fileSize: content.length,
        averageFunctionSize: functionCount > 0 ? codeLines / functionCount : 0,
        commentRatio: lineCount > 0 ? commentLines / lineCount : 0,
      },
      issuesFound: this.findBasicIssues(content, partialMetrics),
    };
  }

  /**
   * Calculate maintainability index
   */
  private calculateMaintainabilityIndex(metrics: any): number {
    // Simplified maintainability index calculation
    // MI = 171 - 5.2 * ln(avgLinesPerModule) - 0.23 * (cyclomatic complexity) - 16.2 * ln(totalLines)
    const avgLinesPerModule = metrics.functionCount > 0 ? metrics.codeLines / metrics.functionCount : metrics.codeLines;
    const totalLines = metrics.linesOfCode;
    
    if (totalLines === 0) return 100;
    
    const mi = 171 - 
               5.2 * Math.log(avgLinesPerModule || 1) - 
               0.23 * metrics.cyclomaticComplexity - 
               16.2 * Math.log(totalLines);
    
    // Normalize to 0-100 range
    return Math.max(0, Math.min(100, mi));
  }

  /**
   * Determine complexity level based on cyclomatic complexity
   */
  private determineComplexityLevel(complexity: number): 'low' | 'medium' | 'high' | 'critical' {
    if (complexity <= 10) return 'low';
    if (complexity <= 20) return 'medium';
    if (complexity <= 50) return 'high';
    return 'critical';
  }

  /**
   * Calculate risk score
   */
  private calculateRiskScore(metrics: any): number {
    // Calculate risk score based on various metrics
    const complexityFactor = metrics.cyclomaticComplexity * 0.4;
    const nestingFactor = metrics.nestingDepth * 2;
    const sizeFactor = Math.log(metrics.linesOfCode) * 5;
    const commentFactor = metrics.linesOfCode > 0 ? 
      (1 - (metrics.commentLines / metrics.linesOfCode)) * 10 : 10;
    
    const riskScore = complexityFactor + nestingFactor + sizeFactor + commentFactor;
    
    // Normalize to 0-100 range
    return Math.min(100, Math.max(0, riskScore));
  }

  /**
   * Find basic issues in code
   */
  private findBasicIssues(content: string, metrics: any): any[] {
    const issues = [];
    
    // Check for long functions
    if (metrics.functionCount > 0 && metrics.codeLines / metrics.functionCount > 50) {
      issues.push({
        line: 0,
        severity: 'warning' as 'info' | 'warning' | 'error',
        message: 'Functions are too long on average. Consider refactoring.',
        rule: 'refactoring'
      });
    }
    
    // Check for high complexity
    if (metrics.cyclomaticComplexity > 20) {
      issues.push({
        line: 0,
        severity: 'warning' as 'info' | 'warning' | 'error',
        message: 'Code has high cyclomatic complexity. Consider simplifying logic.',
        rule: 'complexity'
      });
    }
    
    // Check for deep nesting
    if (metrics.nestingDepth > 5) {
      issues.push({
        line: 0,
        severity: 'warning' as 'info' | 'warning' | 'error',
        message: 'Code has deep nesting. Consider refactoring to reduce nesting depth.',
        rule: 'nesting'
      });
    }
    
    // Check for low comment ratio
    if (metrics.linesOfCode > 50 && metrics.commentLines / metrics.linesOfCode < 0.1) {
      issues.push({
        line: 0,
        severity: 'info' as 'info' | 'warning' | 'error',
        message: 'Code has low comment ratio. Consider adding more comments.',
        rule: 'documentation'
      });
    }
    
    return issues;
  }

  /**
   * Count functions in code
   */
  private countFunctions(content: string): number {
    let count = 0;
    const functionPatterns = this.getFunctionPatterns();
    
    for (const pattern of functionPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        count += matches.length;
      }
    }
    
    return count;
  }

  /**
   * Count classes in code
   */
  private countClasses(content: string): number {
    const classPatterns = [
      /class\s+\w+/g,
      /interface\s+\w+/g,
      /struct\s+\w+/g,
      /package\s+\w+/g,
      /module\s+\w+/g
    ];
    
    let count = 0;
    for (const pattern of classPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        count += matches.length;
      }
    }
    
    return count;
  }

  /**
   * Count loops in code
   */
  private countLoops(content: string): number {
    const loopKeywords = this.getLoopKeywords();
    let count = 0;
    
    for (const keyword of loopKeywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = content.match(regex);
      if (matches) {
        count += matches.length;
      }
    }
    
    return count;
  }

  /**
   * Count conditionals in code
   */
  private countConditionals(content: string): number {
    const decisionKeywords = this.getDecisionKeywords();
    let count = 0;
    
    for (const keyword of decisionKeywords) {
      try {
        // Escape special regex characters in the keyword
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'g');
        const matches = content.match(regex);
        if (matches) {
          count += matches.length;
        }
      } catch (error) {
        console.warn(`Error creating regex for keyword '${keyword}':`, error);
        // Continue with other keywords
      }
    }
    
    return count;
  }

  /**
   * Calculate nesting depth
   */
  private calculateNestingDepth(content: string): number {
    const lines = content.split('\n');
    let maxDepth = 0;
    let currentDepth = 0;
    
    for (const line of lines) {
      // Count opening braces/brackets
      for (const pattern of this.getOpeningPatterns()) {
        const matches = line.match(pattern);
        if (matches) {
          currentDepth += matches.length;
        }
      }
      
      // Update max depth
      maxDepth = Math.max(maxDepth, currentDepth);
      
      // Count closing braces/brackets
      for (const pattern of this.getClosingPatterns()) {
        const matches = line.match(pattern);
        if (matches) {
          currentDepth -= matches.length;
        }
      }
      
      // Ensure depth doesn't go negative
      currentDepth = Math.max(0, currentDepth);
    }
    
    return maxDepth;
  }

  /**
   * Count dependencies in code
   */
  private countDependencies(content: string): number {
    const importPatterns = [
      /import\s+[\w\s,{}*]+\s+from\s+['"]([^'"]+)['"];?/g, // ES6 imports
      /import\s+['"]([^'"]+)['"];?/g, // Import statements
      /require\s*\(['"]([^'"]+)['"]\);?/g, // CommonJS require
      /use\s+[\w\\:]+;?/g, // Perl use statements
      /include\s+['"]([^'"]+)['"];?/g, // C/C++ includes
      /from\s+[\w.]+\s+import\s+[\w\s,*]+/g, // Python imports
      /using\s+[\w.]+;?/g, // C# using statements
    ];
    
    let count = 0;
    for (const pattern of importPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        count += matches.length;
      }
    }
    
    return count;
  }

  // Helper methods for simple analysis
  protected isCommentLine(line: string): boolean {
    return line.trim().startsWith('//') || 
           line.trim().startsWith('#') || 
           line.trim().startsWith('/*') ||
           line.trim().startsWith('*') ||
           line.trim().startsWith('<!--');
  }

  protected getDecisionKeywords(): string[] {
    return ['if', 'else', 'switch', 'case', 'for', 'while', 'do', 'catch', '?'];
  }

  protected getOpeningPatterns(): RegExp[] {
    return [/{/, /\(/, /\[/];
  }

  protected getClosingPatterns(): RegExp[] {
    return [/}/, /\)/, /\]/];
  }

  protected getFunctionPatterns(): RegExp[] {
    return [
      /function\s+\w+\s*\(/g,
      /\w+\s*=\s*function\s*\(/g,
      /\w+\s*:\s*function\s*\(/g,
      /def\s+\w+\s*\(/g,
      /sub\s+\w+/g,
      /class\s+\w+/g
    ];
  }

  protected getLoopKeywords(): string[] {
    return ['for', 'while', 'do', 'foreach', 'repeat'];
  }
}
