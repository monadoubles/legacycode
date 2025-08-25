export interface ComplexityMetrics {
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  nestingDepth: number;
  halsteadVolume: number;
  maintainabilityIndex: number;
}

export class ComplexityCalculator {
  calculateCyclomaticComplexity(content: string): number {
    // Count decision points: if, while, for, case, catch, etc.
    const decisionPoints = [
      /\bif\b/g,
      /\belse\s+if\b/g,
      /\bwhile\b/g,
      /\bfor\b/g,
      /\bforeach\b/g,
      /\bcase\b/g,
      /\bcatch\b/g,
      /\b\?\s*:/g, // ternary operator
      /\b&&\b/g,   // logical AND
      /\b\|\|\b/g  // logical OR
    ];
    
    let complexity = 1; // Base complexity
    
    decisionPoints.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });
    
    return complexity;
  }
  
  calculateCognitiveComplexity(content: string): number {
    let complexity = 0;
    let nestingLevel = 0;
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Increment for nesting increases
      if (this.isNestingIncrease(trimmed)) {
        nestingLevel++;
      }
      
      // Decrement for nesting decreases
      if (this.isNestingDecrease(trimmed)) {
        nestingLevel = Math.max(0, nestingLevel - 1);
      }
      
      // Add cognitive load based on constructs
      if (this.isConditional(trimmed)) {
        complexity += 1 + nestingLevel;
      }
      
      if (this.isLoop(trimmed)) {
        complexity += 1 + nestingLevel;
      }
      
      if (this.isJump(trimmed)) {
        complexity += 1;
      }
    }
    
    return complexity;
  }
  
  calculateNestingDepth(content: string): number {
    let maxDepth = 0;
    let currentDepth = 0;
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (this.isBlockStart(trimmed)) {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      }
      
      if (this.isBlockEnd(trimmed)) {
        currentDepth = Math.max(0, currentDepth - 1);
      }
    }
    
    return maxDepth;
  }
  
  calculateHalsteadMetrics(content: string): { volume: number; difficulty: number } {
    const operators = this.extractOperators(content);
    const operands = this.extractOperands(content);
    
    const n1 = new Set(operators).size; // unique operators
    const n2 = new Set(operands).size;  // unique operands
    const N1 = operators.length;        // total operators
    const N2 = operands.length;         // total operands
    
    const vocabulary = n1 + n2;
    const length = N1 + N2;
    const volume = length * Math.log2(vocabulary || 1);
    const difficulty = (n1 / 2) * (N2 / (n2 || 1));
    
    return { volume, difficulty };
  }
  
  calculateMaintainabilityIndex(
    linesOfCode: number,
    cyclomaticComplexity: number,
    halsteadVolume: number
  ): number {
    const logLOC = Math.log(linesOfCode || 1);
    const logCC = Math.log(cyclomaticComplexity || 1);
    const logHV = Math.log(halsteadVolume || 1);
    
    let mi = 171 - 5.2 * logLOC - 0.23 * cyclomaticComplexity - 16.2 * logHV;
    mi = Math.max(0, Math.min(100, mi)); // Clamp between 0-100
    
    return Math.round(mi * 100) / 100;
  }
  
  calculateOverallComplexity(content: string, linesOfCode: number): ComplexityMetrics {
    const cyclomaticComplexity = this.calculateCyclomaticComplexity(content);
    const cognitiveComplexity = this.calculateCognitiveComplexity(content);
    const nestingDepth = this.calculateNestingDepth(content);
    const { volume: halsteadVolume } = this.calculateHalsteadMetrics(content);
    const maintainabilityIndex = this.calculateMaintainabilityIndex(
      linesOfCode,
      cyclomaticComplexity,
      halsteadVolume
    );
    
    return {
      cyclomaticComplexity,
      cognitiveComplexity,
      nestingDepth,
      halsteadVolume,
      maintainabilityIndex
    };
  }
  
  private isNestingIncrease(line: string): boolean {
    return /\{\s*$/.test(line) || /\b(if|while|for|foreach|else|sub)\b.*\{/.test(line);
  }
  
  private isNestingDecrease(line: string): boolean {
    return /^\s*\}/.test(line);
  }
  
  private isConditional(line: string): boolean {
    return /\b(if|elsif|unless|else)\b/.test(line);
  }
  
  private isLoop(line: string): boolean {
    return /\b(while|for|foreach|until)\b/.test(line);
  }
  
  private isJump(line: string): boolean {
    return /\b(break|continue|return|goto|next|last)\b/.test(line);
  }
  
  private isBlockStart(line: string): boolean {
    return this.isNestingIncrease(line);
  }
  
  private isBlockEnd(line: string): boolean {
    return this.isNestingDecrease(line);
  }
  
  private extractOperators(content: string): string[] {
    const operators: string[] = [];
    const operatorPatterns = [
      /[+\-*/=%<>!&|^~]/g,
      /\b(and|or|not|eq|ne|lt|gt|le|ge)\b/g
    ];
    
    operatorPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        operators.push(...matches);
      }
    });
    
    return operators;
  }
  
  private extractOperands(content: string): string[] {
    const operands: string[] = [];
    
    // Extract variables, literals, function names
    const operandPatterns = [
      /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g, // identifiers
      /\b\d+(\.\d+)?\b/g,          // numbers
      /"[^"]*"/g,                      // string literals
      /'[^']*'/g                       // string literals
    ];
    
    operandPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        operands.push(...matches);
      }
    });
    
    return operands;
  }
}

export const complexityCalculator = new ComplexityCalculator();
