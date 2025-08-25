import { ollamaClient } from './ollama-client';
import { getPromptForAnalysis } from './prompts';

export interface Suggestion {
  startColumn: number | undefined;
  endColumn: number | undefined;
  codeSnippet: string | undefined;
  alternativeSolutions: any;
  aiModel: string | undefined;
  aiPromptUsed: string | undefined;
  id: string;
  type: 'refactor' | 'security' | 'performance' | 'modernization' | 'style';
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  title: string;
  description: string;
  explanation?: string;
  suggestedFix?: string;
  modernizationApproach?: string;
  startLine?: number;
  endLine?: number;
  impactScore: number;
  effortEstimate: 'low' | 'medium' | 'high';
  aiConfidence: number;
}

export class SuggestionGenerator {
  async generateSuggestions(
    code: string,
    filename: string,
    metrics: any,
    technology: 'perl' | 'tibco' | 'pentaho'
  ): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    
    try {
      // Generate different types of suggestions based on code complexity
      if (metrics.cyclomaticComplexity > 10) {
        const refactorSuggestions = await this.generateRefactoringSuggestions(
          code, filename, metrics, technology
        );
        suggestions.push(...refactorSuggestions);
      }
      
      // Always check for security issues
      const securitySuggestions = await this.generateSecuritySuggestions(
        code, filename, technology
      );
      suggestions.push(...securitySuggestions);
      
      // Performance suggestions for larger files
      if (metrics.linesOfCode > 200) {
        const performanceSuggestions = await this.generatePerformanceSuggestions(
          code, filename, technology
        );
        suggestions.push(...performanceSuggestions);
      }
      
      // Modernization suggestions for legacy patterns
      const modernizationSuggestions = await this.generateModernizationSuggestions(
        code, filename, technology
      );
      suggestions.push(...modernizationSuggestions);
      
    } catch (error) {
      console.error('Error generating suggestions:', error);
    }
    
    return suggestions;
  }
  
  private async generateRefactoringSuggestions(
    code: string,
    filename: string,
    metrics: any,
    technology: 'perl' | 'tibco' | 'pentaho'
  ): Promise<Suggestion[]> {
    const prompt = getPromptForAnalysis('REFACTORING', technology);
    const aiResponse = await ollamaClient.generateSuggestion(prompt, code);
    
    return [
      {
        id: `refactor-${Date.now()}-1`,
        type: 'refactor',
        severity: metrics.cyclomaticComplexity > 20 ? 'high' : 'medium',
        category: 'complexity',
        title: 'Reduce Cyclomatic Complexity',
        description: `Function complexity is ${metrics.cyclomaticComplexity}. Consider breaking down large functions.`,
        explanation: aiResponse.substring(0, 200) + '...',
        suggestedFix: 'Break large functions into smaller, focused functions',
        impactScore: 0.8,
        effortEstimate: 'medium',
        aiConfidence: 0.7,
        startColumn: undefined,
        endColumn: undefined,
        codeSnippet: undefined,
        alternativeSolutions: undefined,
        aiModel: undefined,
        aiPromptUsed: undefined
      }
    ];
  }
  
  private async generateSecuritySuggestions(
    code: string,
    filename: string,
    technology: 'perl' | 'tibco' | 'pentaho'
  ): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    
    // Check for common security issues
    if (code.includes('eval(') || code.includes('exec(')) {
      suggestions.push({
        id: `security-${Date.now()}-1`,
        type: 'security',
        severity: 'high',
        category: 'code-injection',
        title: 'Potential Code Injection Risk',
        description: 'Use of eval() or exec() functions detected',
        explanation: 'These functions can execute arbitrary code and pose security risks',
        suggestedFix: 'Replace with safer alternatives or implement proper input validation',
        impactScore: 0.9,
        effortEstimate: 'low',
        aiConfidence: 0.8,
        startColumn: undefined,
        endColumn: undefined,
        codeSnippet: undefined,
        alternativeSolutions: undefined,
        aiModel: undefined,
        aiPromptUsed: undefined
      });
    }
    
    if (code.match(/password|secret|key/i)) {
      const lines = code.split('');
      lines.forEach((line, index) => {
        if (line.match(/password\s*=\s*["'][^"']+["']/i)) {
          suggestions.push({
            id: `security-${Date.now()}-${index}`,
            type: 'security',
            severity: 'critical',
            category: 'credentials',
            title: 'Hardcoded Credentials Detected',
            description: 'Hardcoded password or secret found in code',
            explanation: 'Credentials should be stored in environment variables or secure configuration',
            suggestedFix: 'Move credentials to environment variables',
            startLine: index + 1,
            impactScore: 0.95,
            effortEstimate: 'low',
            aiConfidence: 0.9,
            startColumn: undefined,
            endColumn: undefined,
            codeSnippet: undefined,
            alternativeSolutions: undefined,
            aiModel: undefined,
            aiPromptUsed: undefined
          });
        }
      });
    }
    
    return suggestions;
  }
  
  private async generatePerformanceSuggestions(
    code: string,
    filename: string,
    technology: 'perl' | 'tibco' | 'pentaho'
  ): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];
    
    // Check for nested loops
    const nestedLoopPattern = /for\s*\([^}]*for\s*\(/g;
    if (nestedLoopPattern.test(code)) {
      suggestions.push({
        id: `performance-${Date.now()}-1`,
        type: 'performance',
        severity: 'medium',
        category: 'algorithms',
        title: 'Nested Loops Detected',
        description: 'Nested loops may cause performance issues with large datasets',
        explanation: 'Consider optimizing algorithm complexity or using data structures like hash maps',
        suggestedFix: 'Review algorithm design and consider using more efficient data structures',
        impactScore: 0.6,
        effortEstimate: 'medium',
        aiConfidence: 0.7,
        startColumn: undefined,
        endColumn: undefined,
        codeSnippet: undefined,
        alternativeSolutions: undefined,
        aiModel: undefined,
        aiPromptUsed: undefined
      });
    }
    
    return suggestions;
  }
  
  private async generateModernizationSuggestions(
    code: string,
    filename: string,
    technology: 'perl' | 'tibco' | 'pentaho'
  ): Promise<Suggestion[]> {
    const prompt = getPromptForAnalysis('MODERNIZATION', technology);
    const aiResponse = await ollamaClient.generateSuggestion(prompt, code);
    
    return [
      {
        id: `modernization-${Date.now()}-1`,
        type: 'modernization',
        severity: 'low',
        category: 'migration',
        title: `${technology.toUpperCase()} Modernization Opportunities`,
        description: `Consider modernizing this ${technology} code for better maintainability`,
        explanation: aiResponse.substring(0, 200) + '...',
        modernizationApproach: 'Gradual migration to modern practices',
        impactScore: 0.7,
        effortEstimate: 'high',
        aiConfidence: 0.6,
        startColumn: undefined,
        endColumn: undefined,
        codeSnippet: undefined,
        alternativeSolutions: undefined,
        aiModel: undefined,
        aiPromptUsed: undefined
      }
    ];
  }
}

export const suggestionGenerator = new SuggestionGenerator();
