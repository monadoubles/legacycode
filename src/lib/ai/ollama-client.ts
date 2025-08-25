import { Ollama } from 'ollama';

export class OllamaClient {
  private client: Ollama;
  private model: string;

  constructor() {
    this.client = new Ollama({
      host: process.env.OLLAMA_API_URL || 'http://localhost:11434'
    });
    this.model = process.env.OLLAMA_MODEL || 'codellama:7b-instruct';
  }

  async generateSuggestion(prompt: string, code: string): Promise<string> {
    try {
      const fullPrompt = `${prompt}

Code to analyze:
\`\`\`
${code}
\`\`\`

Please provide specific, actionable suggestions for improvement.`;

      const response = await this.client.generate({
        model: this.model,
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9
        }
      });

      return response.response;
    } catch (error) {
      console.error('Ollama generation error:', error);
      return 'AI suggestion generation temporarily unavailable.';
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const models = await this.client.list();
      return models.models.some(m => m.name.includes('codellama'));
    } catch (error) {
      return false;
    }
  }

   /**
   * Generate report recommendations based on analysis data
   * @param summary Summary of analysis metrics
   * @param complexityDistribution Distribution of complexity levels
   * @returns Array of recommendation objects
   */
   async generateReportRecommendations(
    summary: any,
    complexityDistribution: any
  ): Promise<any[]> {
    try {
      const prompt = `Generate actionable recommendations for a legacy code analysis report with the following metrics:

Summary:
${JSON.stringify(summary, null, 2)}

Complexity Distribution:
${JSON.stringify(complexityDistribution, null, 2)}

Provide recommendations in JSON format as an array of objects with the following structure:
[{
  "type": "category of recommendation (complexity, coverage, modernization, etc.)",
  "priority": "high, medium, or low",
  "title": "short, actionable title",
  "description": "detailed explanation of the issue",
  "actions": ["list", "of", "specific", "actions", "to", "take"]
}]

Return ONLY valid JSON without any explanation or additional text.`;

      const response = await this.generateSuggestion(prompt, '');
      
      try {
        // Extract JSON from the response (in case AI added extra text)
        const jsonMatch = response.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (!jsonMatch) {
          throw new Error('No valid JSON found in AI response');
        }
        
        const jsonStr = jsonMatch[0];
        const recommendations = JSON.parse(jsonStr);
        return recommendations;
      } catch (parseError) {
        console.error('Failed to parse AI recommendations:', parseError);
        // Fallback to static recommendations if parsing fails
        // return this.generateStaticRecommendations(summary, complexityDistribution);
      }
    } catch (error) {
      console.error('Failed to generate AI recommendations:', error);
      // return this.generateStaticRecommendations(summary, complexityDistribution);
    }
    // Ensure we always return something even if all code paths fail
    return [];
  }



  async analyzeSecurity(code: string): Promise<Array<{line: number; issue: string}>> {
    const prompt = `Analyze this code for security vulnerabilities. Focus on:
- SQL injection risks
- Command injection
- Authentication issues
- Data validation problems
- Hardcoded credentials

For each issue found, provide the line number and description in this format:
"Line X: Description of the issue"
where X is the line number. If you can't determine the exact line, use "Line 0".
`;

    const response = await this.generateSuggestion(prompt, code);
    const lines = response.split('\n').filter(line => line.trim().length > 0);
    
    return this.parseIssuesWithLineNumbers(lines);
  }

  async suggestRefactoring(code: string, complexity: number): Promise<Array<{line: number; issue: string}>> {
    const prompt = `This code has a cyclomatic complexity of ${complexity}. Suggest specific refactoring approaches to reduce complexity and improve maintainability.

For each suggestion, provide the line number and description in this format:
"Line X: Description of the refactoring suggestion"
where X is the line number. If you can't determine the exact line, use "Line 0".
`;

    const response = await this.generateSuggestion(prompt, code);
    const lines = response.split('\n').filter(line => line.trim().length > 0);
    
    return this.parseIssuesWithLineNumbers(lines);
  }
  
  /**
   * Parse issues with line numbers from the AI response
   * @param lines Lines from the AI response
   * @returns Array of issues with line numbers
   */
  private parseIssuesWithLineNumbers(lines: string[]): Array<{line: number; issue: string}> {
    const result: Array<{line: number; issue: string}> = [];
    
    for (const line of lines) {
      // Try to match "Line X: Description" pattern
      const match = line.match(/^Line\s+(\d+):\s+(.+)$/i);
      
      if (match) {
        const lineNumber = parseInt(match[1], 10);
        const description = match[2].trim();
        result.push({ line: lineNumber, issue: description });
      } else {
        // If no match, assume it's just a description with no line number
        result.push({ line: 0, issue: line.trim() });
      }
    }
    
    return result;
  }
}

export const ollamaClient = new OllamaClient();
