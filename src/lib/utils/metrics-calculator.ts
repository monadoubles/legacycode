import { CodeMetrics } from "../types/analysis";

export class MetricsCalculator {
  static calculateQualityScore(metrics: CodeMetrics): number {
    // Weighted quality score calculation
    const weights = {
      maintainabilityIndex: 0.3,
      complexity: 0.25,
      testCoverage: 0.2,
      documentation: 0.15,
      duplications: 0.1
    };

    // Normalize complexity (inverse relationship - lower complexity = higher quality)
    const normalizedComplexity = Math.max(0, 100 - (metrics.cyclomaticComplexity * 2));
    
    // Calculate base quality score
    let qualityScore = 
      (metrics.maintainabilityIndex * weights.maintainabilityIndex) +
      (normalizedComplexity * weights.complexity);

    // Add other factors if available
    // Note: These would come from additional analysis
    const testCoverage = 0; // TODO: Implement test coverage analysis
    const documentation = this.estimateDocumentationScore(metrics);
    const duplications = this.estimateDuplicationScore(metrics);

    qualityScore += 
      (testCoverage * weights.testCoverage) +
      (documentation * weights.documentation) +
      (duplications * weights.duplications);

    return Math.round(Math.max(0, Math.min(100, qualityScore)));
  }

  static calculateTechnicalDebt(metrics: CodeMetrics): {
    score: number;
    category: 'low' | 'medium' | 'high' | 'critical';
    estimatedHours: number;
  } {
    let debtScore = 0;
    let estimatedHours = 0;

    // Complexity debt
    if (metrics.cyclomaticComplexity > 10) {
      const excessComplexity = metrics.cyclomaticComplexity - 10;
      debtScore += excessComplexity * 2;
      estimatedHours += excessComplexity * 0.5; // 30 minutes per excess complexity point
    }

    // Size debt
    if (metrics.linesOfCode > 500) {
      const excessLines = (metrics.linesOfCode - 500) / 100;
      debtScore += excessLines;
      estimatedHours += excessLines * 0.25; // 15 minutes per 100 excess lines
    }

    // Nesting debt
    if (metrics.nestingDepth > 4) {
      const excessNesting = metrics.nestingDepth - 4;
      debtScore += excessNesting * 3;
      estimatedHours += excessNesting * 1; // 1 hour per excess nesting level
    }

    // Function count debt
    if (metrics.functionCount === 0 && metrics.linesOfCode > 50) {
      debtScore += 5; // Monolithic code penalty
      estimatedHours += 2; // 2 hours to break into functions
    }

    // Determine category
    let category: 'low' | 'medium' | 'high' | 'critical';
    if (debtScore <= 5) category = 'low';
    else if (debtScore <= 15) category = 'medium';
    else if (debtScore <= 30) category = 'high';
    else category = 'critical';

    return {
      score: Math.round(debtScore),
      category,
      estimatedHours: Math.round(estimatedHours * 10) / 10 // Round to 1 decimal
    };
  }

  static calculateRiskScore(
    codeMetrics: CodeMetrics,
    securityIssues: number = 0,
    performanceIssues: number = 0
  ): number {
    let riskScore = 0;

    // Complexity risk (0-40 points)
    const complexityRisk = Math.min(40, (codeMetrics.cyclomaticComplexity / 20) * 40);
    riskScore += complexityRisk;

    // Size risk (0-20 points)
    const sizeRisk = Math.min(20, (codeMetrics.linesOfCode / 1000) * 20);
    riskScore += sizeRisk;

    // Maintainability risk (0-20 points)
    const maintainabilityRisk = Math.max(0, 20 - (codeMetrics.maintainabilityIndex / 5));
    riskScore += maintainabilityRisk;

    // Security risk (0-10 points)
    const securityRisk = Math.min(10, securityIssues * 2);
    riskScore += securityRisk;

    // Performance risk (0-10 points)
    const performanceRisk = Math.min(10, performanceIssues * 1.5);
    riskScore += performanceRisk;

    return Math.round(Math.max(0, Math.min(100, riskScore)));
  }

  static calculateComplexityLevel(cyclomaticComplexity: number): 'low' | 'medium' | 'high' | 'critical' {
    if (cyclomaticComplexity <= 5) return 'low';
    if (cyclomaticComplexity <= 10) return 'medium';
    if (cyclomaticComplexity <= 20) return 'high';
    return 'critical';
  }

  static calculateMaintainabilityCategory(index: number): 'excellent' | 'good' | 'moderate' | 'difficult' | 'unmaintainable' {
    if (index >= 85) return 'excellent';
    if (index >= 70) return 'good';
    if (index >= 50) return 'moderate';
    if (index >= 25) return 'difficult';
    return 'unmaintainable';
  }

  static aggregateMetricsAcrossFiles(fileMetrics: CodeMetrics[]): {
    totals: CodeMetrics;
    averages: CodeMetrics;
    maximums: CodeMetrics;
    minimums: CodeMetrics;
  } {
    if (fileMetrics.length === 0) {
      const emptyMetrics: CodeMetrics = {
        linesOfCode: 0,
        codeLines: 0,
        commentLines: 0,
        blankLines: 0,
        cyclomaticComplexity: 0,
        cognitiveComplexity: 0,
        nestingDepth: 0,
        halsteadVolume: 0,
        maintainabilityIndex: 0,
        functionCount: 0,
        classCount: 0,
        loopCount: 0,
        conditionalCount: 0,
        sqlJoinCount: 0,
        dependencyCount: 0
      };
      
      return {
        totals: emptyMetrics,
        averages: emptyMetrics,
        maximums: emptyMetrics,
        minimums: emptyMetrics
      };
    }

    const totals = fileMetrics.reduce((acc, metrics) => ({
      linesOfCode: acc.linesOfCode + metrics.linesOfCode,
      codeLines: acc.codeLines + metrics.codeLines,
      commentLines: acc.commentLines + metrics.commentLines,
      blankLines: acc.blankLines + metrics.blankLines,
      cyclomaticComplexity: acc.cyclomaticComplexity + metrics.cyclomaticComplexity,
      cognitiveComplexity: acc.cognitiveComplexity + metrics.cognitiveComplexity,
      nestingDepth: acc.nestingDepth + metrics.nestingDepth,
      halsteadVolume: acc.halsteadVolume + metrics.halsteadVolume,
      maintainabilityIndex: acc.maintainabilityIndex + metrics.maintainabilityIndex,
      functionCount: acc.functionCount + metrics.functionCount,
      classCount: acc.classCount + metrics.classCount,
      loopCount: acc.loopCount + metrics.loopCount,
      conditionalCount: acc.conditionalCount + metrics.conditionalCount,
      sqlJoinCount: acc.sqlJoinCount + metrics.sqlJoinCount,
      dependencyCount: acc.dependencyCount + metrics.dependencyCount
    }));

    const count = fileMetrics.length;
    const averages: CodeMetrics = {
      linesOfCode: Math.round(totals.linesOfCode / count),
      codeLines: Math.round(totals.codeLines / count),
      commentLines: Math.round(totals.commentLines / count),
      blankLines: Math.round(totals.blankLines / count),
      cyclomaticComplexity: Math.round(totals.cyclomaticComplexity / count),
      cognitiveComplexity: Math.round(totals.cognitiveComplexity / count),
      nestingDepth: Math.round(totals.nestingDepth / count),
      halsteadVolume: Math.round(totals.halsteadVolume / count),
      maintainabilityIndex: Math.round((totals.maintainabilityIndex / count) * 100) / 100,
      functionCount: Math.round(totals.functionCount / count),
      classCount: Math.round(totals.classCount / count),
      loopCount: Math.round(totals.loopCount / count),
      conditionalCount: Math.round(totals.conditionalCount / count),
      sqlJoinCount: Math.round(totals.sqlJoinCount / count),
      dependencyCount: Math.round(totals.dependencyCount / count)
    };

    const maximums = fileMetrics.reduce((acc, metrics) => ({
      linesOfCode: Math.max(acc.linesOfCode, metrics.linesOfCode),
      codeLines: Math.max(acc.codeLines, metrics.codeLines),
      commentLines: Math.max(acc.commentLines, metrics.commentLines),
      blankLines: Math.max(acc.blankLines, metrics.blankLines),
      cyclomaticComplexity: Math.max(acc.cyclomaticComplexity, metrics.cyclomaticComplexity),
      cognitiveComplexity: Math.max(acc.cognitiveComplexity, metrics.cognitiveComplexity),
      nestingDepth: Math.max(acc.nestingDepth, metrics.nestingDepth),
      halsteadVolume: Math.max(acc.halsteadVolume, metrics.halsteadVolume),
      maintainabilityIndex: Math.max(acc.maintainabilityIndex, metrics.maintainabilityIndex),
      functionCount: Math.max(acc.functionCount, metrics.functionCount),
      classCount: Math.max(acc.classCount, metrics.classCount),
      loopCount: Math.max(acc.loopCount, metrics.loopCount),
      conditionalCount: Math.max(acc.conditionalCount, metrics.conditionalCount),
      sqlJoinCount: Math.max(acc.sqlJoinCount, metrics.sqlJoinCount),
      dependencyCount: Math.max(acc.dependencyCount, metrics.dependencyCount)
    }));

    const minimums = fileMetrics.reduce((acc, metrics) => ({
      linesOfCode: Math.min(acc.linesOfCode, metrics.linesOfCode),
      codeLines: Math.min(acc.codeLines, metrics.codeLines),
      commentLines: Math.min(acc.commentLines, metrics.commentLines),
      blankLines: Math.min(acc.blankLines, metrics.blankLines),
      cyclomaticComplexity: Math.min(acc.cyclomaticComplexity, metrics.cyclomaticComplexity),
      cognitiveComplexity: Math.min(acc.cognitiveComplexity, metrics.cognitiveComplexity),
      nestingDepth: Math.min(acc.nestingDepth, metrics.nestingDepth),
      halsteadVolume: Math.min(acc.halsteadVolume, metrics.halsteadVolume),
      maintainabilityIndex: Math.min(acc.maintainabilityIndex, metrics.maintainabilityIndex),
      functionCount: Math.min(acc.functionCount, metrics.functionCount),
      classCount: Math.min(acc.classCount, metrics.classCount),
      loopCount: Math.min(acc.loopCount, metrics.loopCount),
      conditionalCount: Math.min(acc.conditionalCount, metrics.conditionalCount),
      sqlJoinCount: Math.min(acc.sqlJoinCount, metrics.sqlJoinCount),
      dependencyCount: Math.min(acc.dependencyCount, metrics.dependencyCount)
    }));

    return { totals, averages, maximums, minimums };
  }

  private static estimateDocumentationScore(metrics: CodeMetrics): number {
    // Estimate documentation based on comment ratio
    const commentRatio = metrics.commentLines / (metrics.codeLines || 1);
    
    // Good documentation is typically 10-30% comments
    if (commentRatio >= 0.1 && commentRatio <= 0.3) {
      return 100;
    } else if (commentRatio >= 0.05 && commentRatio <= 0.5) {
      return 70;
    } else if (commentRatio > 0) {
      return 40;
    }
    
    return 0;
  }

  private static estimateDuplicationScore(metrics: CodeMetrics): number {
    // Estimate duplication penalty based on function density
    const functionDensity = metrics.functionCount / (metrics.linesOfCode || 1) * 1000;
    
    // Higher function density typically means less duplication
    if (functionDensity >= 5) return 100;
    if (functionDensity >= 3) return 80;
    if (functionDensity >= 1) return 60;
    return 40;
  }
}