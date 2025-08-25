import { UPLOAD_CONFIG } from '../config/upload';
import { FileMetadata, FileValidation } from '../types/file';

export class FileUtils {
  static validateFile(file: File): FileValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file size
    if (file.size > UPLOAD_CONFIG.storage.maxFileSize) {
      errors.push(`File size (${this.formatBytes(file.size)}) exceeds maximum allowed size (${this.formatBytes(UPLOAD_CONFIG.storage.maxFileSize)})`);
    }

    // Check file type
    const extension = this.getFileExtension(file.name);
    if (!UPLOAD_CONFIG.storage.allowedTypes.includes(extension)) {
      errors.push(`File type '.${extension}' is not supported. Allowed types: ${UPLOAD_CONFIG.storage.allowedTypes.join(', ')}`);
    }

    // Check filename length
    if (file.name.length > 255) {
      errors.push('Filename is too long (maximum 255 characters)');
    }

    // Check for suspicious patterns
    if (this.hasSuspiciousPatterns(file.name)) {
      warnings.push('Filename contains potentially suspicious characters');
    }

    // Detect technology type
    const detectedType = this.detectTechnology(file.name, extension);
    
    // Estimate analysis time
    const estimatedTime = this.estimateAnalysisTime(file.size, detectedType);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        detectedType,
        encoding: 'utf-8', // Default assumption
        hasSecurityIssues: false, // Will be determined during analysis
        estimatedAnalysisTime: estimatedTime
      }
    };
  }

  static async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        resolve(event.target?.result as string);
      };
      
      reader.onerror = (error) => {
        reject(new Error('Failed to read file content'));
      };
      
      reader.readAsText(file, 'utf-8');
    });
  }

  static getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
  }

  static detectTechnology(filename: string, extension: string): string {
    const techMap: Record<string, string> = {
      'pl': 'perl',
      'pm': 'perl',
      'xml': this.detectXmlTechnology(filename),
      'ktr': 'pentaho',
      'kjb': 'pentaho',
      'txt': 'generic',
      'log': 'generic'
    };

    return techMap[extension] || 'unknown';
  }

  private static detectXmlTechnology(filename: string): string {
    // Try to determine if XML is TIBCO or generic
    const lowerName = filename.toLowerCase();
    
    if (lowerName.includes('tibco') || lowerName.includes('bw') || lowerName.includes('process')) {
      return 'tibco';
    }
    
    return 'xml';
  }

  static formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  static generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = this.getFileExtension(originalName);
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    
    return `${timestamp}_${random}_${this.sanitizeFilename(nameWithoutExt)}.${extension}`;
  }

  static sanitizeFilename(filename: string): string {
    // Remove or replace problematic characters
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  static calculateContentHash(content: string): string {
    // Simple hash function (in production, use crypto library)
    let hash = 0;
    if (content.length === 0) return hash.toString();
    
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(16);
  }

  static detectEncoding(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    
    // Check for BOM
    if (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
      return 'utf-8';
    }
    
    if (bytes.length >= 2 && bytes[0] === 0xFF && bytes[1] === 0xFE) {
      return 'utf-16le';
    }
    
    if (bytes.length >= 2 && bytes[0] === 0xFE && bytes[1] === 0xFF) {
      return 'utf-16be';
    }
    
    // Default assumption
    return 'utf-8';
  }

  static isTextFile(filename: string, mimeType?: string): boolean {
    const textExtensions = ['txt', 'pl', 'pm', 'xml', 'ktr', 'kjb', 'log', 'md', 'json'];
    const extension = this.getFileExtension(filename);
    
    if (textExtensions.includes(extension)) {
      return true;
    }
    
    if (mimeType && mimeType.startsWith('text/')) {
      return true;
    }
    
    return false;
  }

  static createFileMetadata(
    file: File,
    uploadedBy: string,
    uniqueFilename: string,
    contentHash: string
  ): Omit<FileMetadata, 'id'> {
    const extension = this.getFileExtension(file.name);
    const technology = this.detectTechnology(file.name, extension);
    
    return {
      filename: file.name,
      originalPath: file.name,
      relativePath: uniqueFilename,
      fileSize: file.size,
      fileType: extension,
      mimeType: file.type || 'application/octet-stream',
      encoding: 'utf-8',
      contentHash,
      technology: technology as any,
      uploadedBy,
      uploadedAt: new Date(),
      tags: [],
      isArchived: false
    };
  }

  private static hasSuspiciousPatterns(filename: string): boolean {
    const suspiciousPatterns = [
      /\\.exe$/i,
      /\\.bat$/i,
      /\\.cmd$/i,
      /\\.sh$/i,
      /\\.php$/i,
      /\\.jsp$/i,
      /\\.asp$/i,
      /<script/i,
      /javascript:/i,
      /\\x00/,
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(filename));
  }

  private static estimateAnalysisTime(fileSize: number, technology: string): number {
    // Base time in milliseconds
    const baseTime = 1000; // 1 second
    
    // Time per KB
    const timePerKB = {
      'perl': 50,
      'tibco': 30,
      'pentaho': 40,
      'xml': 20,
      'generic': 10
    };
    
    const sizeKB = fileSize / 1024;
    const techMultiplier = timePerKB[technology as keyof typeof timePerKB] || timePerKB.generic;
    
    return Math.max(baseTime, sizeKB * techMultiplier);
  }

  static groupFilesByTechnology(files: FileMetadata[]): Record<string, FileMetadata[]> {
    return files.reduce((groups, file) => {
      const tech = file.technology || 'unknown';
      if (!groups[tech]) {
        groups[tech] = [];
      }
      groups[tech].push(file);
      return groups;
    }, {} as Record<string, FileMetadata[]>);
  }

  static getFileIcon(extension: string): string {
    const iconMap: Record<string, string> = {
      'pl': '🐪', // Perl camel
      'pm': '🐪',
      'xml': '🔧', // TIBCO/XML
      'ktr': '🔄', // Pentaho transformation
      'kjb': '🔄', // Pentaho job
      'txt': '📄',
      'log': '📋',
      'md': '📝',
      'json': '📊'
    };
    
    return iconMap[extension] || '📄';
  }

  static async compressFile(content: string): Promise<string> {
    // Simple compression (in production, use a proper compression library)
    try {
      return btoa(content);
    } catch (error) {
      console.warn('Compression failed, returning original content');
      return content;
    }
  }

  static async decompressFile(compressed: string): Promise<string> {
    try {
      return atob(compressed);
    } catch (error) {
      console.warn('Decompression failed, returning as-is');
      return compressed;
    }
  }

  static validateFileContent(content: string, expectedType: string): boolean {
    switch (expectedType) {
      case 'perl':
        return this.validatePerlContent(content);
      case 'xml':
      case 'tibco':
        return this.validateXmlContent(content);
      case 'pentaho':
        return this.validatePentahoContent(content);
      default:
        return true; // Accept any content for generic files
    }
  }

  private static validatePerlContent(content: string): boolean {
    // Basic Perl validation
    const perlPatterns = [
      /^\\s*#!.*perl/m,  // Shebang
      /^\\s*use\\s+/m,   // Use statements
      /^\\s*package\\s+/m, // Package declarations
      /sub\\s+\\w+/,     // Subroutines
    ];
    
    return perlPatterns.some(pattern => pattern.test(content));
  }

  private static validateXmlContent(content: string): boolean {
    // Basic XML validation
    return content.trim().startsWith('<') && content.includes('>');
  }

  private static validatePentahoContent(content: string): boolean {
    // Basic Pentaho validation
    const pentahoPatterns = [
      /<transformation>/,
      /<job>/,
      /<step>/,
      /<entry>/
    ];
    
    return pentahoPatterns.some(pattern => pattern.test(content));
  }
}