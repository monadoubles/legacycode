export const AI_CONFIG = {
  ollama: {
    baseUrl: process.env.OLLAMA_API_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'codellama:7b',
    timeout: parseInt(process.env.AI_TIMEOUT || '30000'),
    maxRetries: 3,
    temperature: 0.7,
    maxTokens: 1000,
  },
  
  features: {
    enableSecurityAnalysis: process.env.ENABLE_SECURITY_ANALYSIS !== 'false',
    enableRefactoringSuggestions: process.env.ENABLE_REFACTORING !== 'false',
    enablePerformanceAnalysis: process.env.ENABLE_PERFORMANCE_ANALYSIS !== 'false',
    enableModernizationSuggestions: process.env.ENABLE_MODERNIZATION !== 'false',
  },
  
  analysis: {
    maxCodeLength: parseInt(process.env.MAX_CODE_LENGTH || '10000'),
    batchSize: parseInt(process.env.AI_BATCH_SIZE || '5'),
    cacheResults: process.env.CACHE_AI_RESULTS !== 'false',
    cacheTtl: parseInt(process.env.AI_CACHE_TTL || '3600000'), // 1 hour
  },
  
  prompts: {
    maxPromptLength: 4000,
    includeContext: true,
    includeMetrics: true,
    customPrompts: {
      security: process.env.CUSTOM_SECURITY_PROMPT,
      refactoring: process.env.CUSTOM_REFACTORING_PROMPT,
      performance: process.env.CUSTOM_PERFORMANCE_PROMPT,
    }
  }
};

export const validateAIConfig = () => {
  const requiredEnvVars = ['OLLAMA_API_URL'];
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.warn(`Missing AI configuration: ${missing.join(', ')}`);
  }
  
  return missing.length === 0;
};
