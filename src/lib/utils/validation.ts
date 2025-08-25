export interface ValidationRule<T = any> {
  field: string;
  message: string;
  validator: (value: T, context?: any) => boolean;
  required?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
  }>;
}

export class Validator {
  static validate<T>(data: T, rules: ValidationRule[]): ValidationResult {
    const errors: Array<{ field: string; message: string }> = [];
    const warnings: Array<{ field: string; message: string }> = [];

    for (const rule of rules) {
      const value = this.getNestedValue(data, rule.field);
      
      // Check required fields
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field: rule.field,
          message: `${rule.field} is required`
        });
        continue;
      }

      // Skip validation if field is not required and empty
      if (!rule.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Run validator
      if (!rule.validator(value, data)) {
        errors.push({
          field: rule.field,
          message: rule.message
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Common validators
  static required(message = 'This field is required') {
    return (value: any) => value !== undefined && value !== null && value !== '';
  }

  static minLength(min: number, message?: string) {
    return (value: string) => {
      if (!value) return true;
      return value.length >= min;
    };
  }

  static maxLength(max: number, message?: string) {
    return (value: string) => {
      if (!value) return true;
      return value.length <= max;
    };
  }

  static email(message = 'Invalid email format') {
    return (value: string) => {
      if (!value) return true;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    };
  }

  static numeric(message = 'Must be a number') {
    return (value: any) => {
      if (value === undefined || value === null || value === '') return true;
      return !isNaN(Number(value));
    };
  }

  static min(minValue: number, message?: string) {
    return (value: any) => {
      if (value === undefined || value === null || value === '') return true;
      return Number(value) >= minValue;
    };
  }

  static max(maxValue: number, message?: string) {
    return (value: any) => {
      if (value === undefined || value === null || value === '') return true;
      return Number(value) <= maxValue;
    };
  }

  static pattern(regex: RegExp, message = 'Invalid format') {
    return (value: string) => {
      if (!value) return true;
      return regex.test(value);
    };
  }

  static oneOf(options: any[], message = 'Invalid option') {
    return (value: any) => {
      if (value === undefined || value === null || value === '') return true;
      return options.includes(value);
    };
  }

  static custom(validator: (value: any, context?: any) => boolean, message: string) {
    return validator;
  }

  // File validation
  static fileSize(maxSizeBytes: number, message?: string) {
    return (file: File) => {
      if (!file) return true;
      return file.size <= maxSizeBytes;
    };
  }

  static fileType(allowedTypes: string[], message?: string) {
    return (file: File) => {
      if (!file) return true;
      const extension = file.name.split('.').pop()?.toLowerCase();
      return allowedTypes.includes(extension || '');
    };
  }

  // Analysis validation
  static complexity(maxComplexity: number, message?: string) {
    return (value: number) => {
      if (value === undefined || value === null) return true;
      return value <= maxComplexity;
    };
  }

  static riskScore(maxRisk: number, message?: string) {
    return (value: number) => {
      if (value === undefined || value === null) return true;
      return value <= maxRisk;
    };
  }

  // Array validation
  static minItems(min: number, message?: string) {
    return (value: any[]) => {
      if (!Array.isArray(value)) return true;
      return value.length >= min;
    };
  }

  static maxItems(max: number, message?: string) {
    return (value: any[]) => {
      if (!Array.isArray(value)) return true;
      return value.length <= max;
    };
  }

  // Object validation
  static requiredKeys(keys: string[], message?: string) {
    return (value: Record<string, any>) => {
      if (!value || typeof value !== 'object') return true;
      return keys.every(key => key in value);
    };
  }

  // Date validation
  static beforeDate(date: Date, message?: string) {
    return (value: any) => {
      if (!value) return true;
      const inputDate = new Date(value);
      return inputDate < date;
    };
  }

  static afterDate(date: Date, message?: string) {
    return (value: any) => {
      if (!value) return true;
      const inputDate = new Date(value);
      return inputDate > date;
    };
  }

  static dateRange(startDate: Date, endDate: Date, message?: string) {
    return (value: any) => {
      if (!value) return true;
      const inputDate = new Date(value);
      return inputDate >= startDate && inputDate <= endDate;
    };
  }

  // Helper methods
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Validation rule builders
  static createFileValidationRules(): ValidationRule[] {
    return [
      {
        field: 'name',
        message: 'Filename is required',
        validator: this.required(),
        required: true
      },
      {
        field: 'size',
        message: 'File size must not exceed 10MB',
        validator: this.max(10 * 1024 * 1024)
      },
      {
        field: 'type',
        message: 'Unsupported file type',
        validator: this.oneOf(['pl', 'pm', 'xml', 'ktr', 'kjb', 'txt'])
      }
    ];
  }

  static createAnalysisValidationRules(): ValidationRule[] {
    return [
      {
        field: 'fileId',
        message: 'File ID is required',
        validator: this.required(),
        required: true
      },
      {
        field: 'metrics.cyclomaticComplexity',
        message: 'Cyclomatic complexity must be a positive number',
        validator: this.min(0)
      },
      {
        field: 'metrics.linesOfCode',
        message: 'Lines of code must be a positive number',
        validator: this.min(0)
      },
      {
        field: 'riskScore',
        message: 'Risk score must be between 0 and 100',
        validator: (value: number) => value >= 0 && value <= 100
      }
    ];
  }

  static createReportValidationRules(): ValidationRule[] {
    return [
      {
        field: 'name',
        message: 'Report name is required',
        validator: this.required(),
        required: true
      },
      {
        field: 'name',
        message: 'Report name must be between 3 and 100 characters',
        validator: (value: string) => value.length >= 3 && value.length <= 100
      },
      {
        field: 'templateId',
        message: 'Template ID is required',
        validator: this.required(),
        required: true
      }
    ];
  }

  static createUserValidationRules(): ValidationRule[] {
    return [
      {
        field: 'email',
        message: 'Valid email is required',
        validator: this.email(),
        required: true
      },
      {
        field: 'password',
        message: 'Password must be at least 8 characters',
        validator: this.minLength(8),
        required: true
      },
      {
        field: 'name',
        message: 'Name is required',
        validator: this.required(),
        required: true
      }
    ];
  }

  // Batch validation
  static validateBatch<T>(items: T[], rules: ValidationRule[]): ValidationResult[] {
    return items.map(item => this.validate(item, rules));
  }

  // Async validation support
  static async validateAsync<T>(
    data: T, 
    rules: ValidationRule[], 
    asyncValidators?: Array<{
      field: string;
      validator: (value: any) => Promise<boolean>;
      message: string;
    }>
  ): Promise<ValidationResult> {
    // Run synchronous validation first
    const syncResult = this.validate(data, rules);
    
    if (!asyncValidators || asyncValidators.length === 0) {
      return syncResult;
    }

    // Run async validators
    const asyncErrors: Array<{ field: string; message: string }> = [];
    
    for (const asyncRule of asyncValidators) {
      const value = this.getNestedValue(data, asyncRule.field);
      try {
        const isValid = await asyncRule.validator(value);
        if (!isValid) {
          asyncErrors.push({
            field: asyncRule.field,
            message: asyncRule.message
          });
        }
      } catch (error) {
        asyncErrors.push({
          field: asyncRule.field,
          message: 'Validation error occurred'
        });
      }
    }

    return {
      isValid: syncResult.isValid && asyncErrors.length === 0,
      errors: [...syncResult.errors, ...asyncErrors],
      warnings: syncResult.warnings
    };
  }
}
