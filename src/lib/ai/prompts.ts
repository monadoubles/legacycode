// AI prompts for different types of analysis

export const ANALYSIS_PROMPTS = {
  SECURITY: `Analyze this code for security vulnerabilities. Look for:
- SQL injection vulnerabilities
- Command injection risks
- Authentication bypass possibilities
- Input validation issues
- Hardcoded credentials or secrets
- Unsafe file operations
- Cross-site scripting (XSS) risks
- Insecure cryptographic practices

Provide specific line-by-line recommendations.`,

  REFACTORING: `Analyze this code for refactoring opportunities. Focus on:
- Reducing cyclomatic complexity
- Eliminating code duplication
- Improving function/method structure
- Enhancing readability and maintainability
- Applying design patterns where appropriate
- Breaking down large functions
- Improving variable and function naming

Suggest specific code improvements.`,

  PERFORMANCE: `Analyze this code for performance issues. Look for:
- Inefficient algorithms or data structures
- Unnecessary loops or iterations
- Memory leaks or excessive memory usage
- Database query optimization opportunities
- Caching opportunities
- I/O operation improvements
- Concurrency issues

Provide actionable performance optimization suggestions.`,

  MODERNIZATION: `Suggest modernization approaches for this legacy code:
- Migration to modern frameworks/libraries
- Adoption of current best practices
- Improved error handling
- Better logging and monitoring
- Code organization improvements
- Testing strategy enhancements
- Documentation improvements

Focus on practical migration steps.`,

  CODE_STYLE: `Review this code for style and best practice improvements:
- Code formatting and consistency
- Naming conventions
- Comment quality and documentation
- Function/method organization
- Error handling patterns
- Logging practices
- Code organization

Suggest specific style improvements.`
};

export const TECHNOLOGY_SPECIFIC_PROMPTS = {
  perl: {
    modernization: `This is Perl code. Suggest modernization approaches including:
- Migration to modern Perl practices
- Use of modern Perl modules (Moose, Moo, etc.)
- Improved error handling with Try::Tiny
- Better testing with Test::More
- Migration to Python/Node.js considerations
- Package management improvements
- Security enhancements`,

    refactoring: `This is Perl code. Suggest refactoring improvements:
- Subroutine organization and naming
- Use of references vs. direct variables
- Hash and array handling improvements
- Regular expression optimizations
- Module organization
- Scope and variable declaration improvements`
  },

  tibco: {
    modernization: `This is TIBCO BusinessWorks XML. Suggest modernization approaches:
- Migration to TIBCO BusinessWorks 6.x
- Process optimization strategies  
- Error handling improvements
- Integration pattern enhancements
- Performance optimization
- Monitoring and logging improvements
- Service-oriented architecture adoption`,

    refactoring: `This is TIBCO BusinessWorks XML. Suggest improvements:
- Process flow optimization
- Activity configuration enhancements
- Variable and parameter management
- Error handling and retry logic
- Transaction management
- Resource connection optimization`
  },

  pentaho: {
    modernization: `This is Pentaho ETL (Kettle). Suggest modernization approaches:
- Migration to modern ETL tools
- Performance optimization strategies
- Data pipeline improvements
- Error handling enhancements
- Monitoring and logging
- Cloud migration considerations
- Real-time processing adoption`,

    refactoring: `This is Pentaho ETL code. Suggest improvements:
- Step optimization and configuration
- Variable and parameter usage
- Transformation flow improvements
- Error handling and logging
- Performance tuning
- Database connection optimization`
  }
};

export function getPromptForAnalysis(
  type: keyof typeof ANALYSIS_PROMPTS,
  technology?: keyof typeof TECHNOLOGY_SPECIFIC_PROMPTS,
  context?: string
): string {
  let basePrompt = ANALYSIS_PROMPTS[type];
  
  // Only use technology-specific prompt if the technology has a prompt for this analysis type
  if (technology) {
    const techPrompts = TECHNOLOGY_SPECIFIC_PROMPTS[technology];
    const techSpecificPrompt = techPrompts[type as keyof typeof techPrompts];
    if (techSpecificPrompt) {
      basePrompt = techSpecificPrompt;
    }
  }
  
  if (context) {
    basePrompt += `

Additional context: ${context}`;
  }
  
  return basePrompt;
}
