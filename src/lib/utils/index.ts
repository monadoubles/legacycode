import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

export function truncateString(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getComplexityColor(level: string): string {
  switch (level.toLowerCase()) {
    case 'low':
      return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    case 'medium':
      return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    case 'high':
      return 'text-red-600 bg-red-50 dark:bg-red-900/20';
    case 'critical':
      return 'text-red-800 bg-red-100 dark:bg-red-800/20';
    default:
      return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
  }
}

export function getFileTypeIcon(fileType: string): string {
  switch (fileType.toLowerCase()) {
    case 'pl':
    case 'pm':
      return '🐪'; // Perl camel
    case 'xml':
      return '🔧'; // TIBCO
    case 'ktr':
    case 'kjb':
      return '🔄'; // Pentaho
    default:
      return '📄';
  }
}

export function calculateComplexityLevel(metrics: {
  cyclomaticComplexity: number;
  nestingDepth: number;
  linesOfCode: number;
}): string {
  const { cyclomaticComplexity, nestingDepth, linesOfCode } = metrics;
  
  let score = 0;
  
  // Cyclomatic complexity scoring
  if (cyclomaticComplexity > 20) score += 3;
  else if (cyclomaticComplexity > 10) score += 2;
  else if (cyclomaticComplexity > 5) score += 1;
  
  // Nesting depth scoring
  if (nestingDepth > 5) score += 3;
  else if (nestingDepth > 3) score += 2;
  else if (nestingDepth > 2) score += 1;
  
  // Lines of code scoring
  if (linesOfCode > 1000) score += 2;
  else if (linesOfCode > 500) score += 1;
  
  if (score >= 6) return 'critical';
  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function isValidFileType(filename: string): boolean {
  const validExtensions = ['pl', 'pm', 'xml', 'ktr', 'kjb', 'txt', 'log'];
  const extension = filename.split('.').pop()?.toLowerCase();
  return validExtensions.includes(extension || '');
}

// Date formatting utilities
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(d);
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(d);
}

// Relative time formatting
const MINUTE_IN_MS = 60 * 1000;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;
const DAY_IN_MS = 24 * HOUR_IN_MS;
const WEEK_IN_MS = 7 * DAY_IN_MS;
const MONTH_IN_MS = 30 * DAY_IN_MS;
const YEAR_IN_MS = 365 * DAY_IN_MS;

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const rtf = new Intl.RelativeTimeFormat('en', { 
    numeric: 'auto',
    style: 'long' 
  });

  if (diff < MINUTE_IN_MS) {
    return rtf.format(-Math.floor(diff / 1000), 'second');
  } else if (diff < HOUR_IN_MS) {
    return rtf.format(-Math.floor(diff / MINUTE_IN_MS), 'minute');
  } else if (diff < DAY_IN_MS) {
    return rtf.format(-Math.floor(diff / HOUR_IN_MS), 'hour');
  } else if (diff < WEEK_IN_MS) {
    return rtf.format(-Math.floor(diff / DAY_IN_MS), 'day');
  } else if (diff < MONTH_IN_MS) {
    return rtf.format(-Math.floor(diff / WEEK_IN_MS), 'week');
  } else if (diff < YEAR_IN_MS) {
    return rtf.format(-Math.floor(diff / MONTH_IN_MS), 'month');
  } else {
    return rtf.format(-Math.floor(diff / YEAR_IN_MS), 'year');
  }
}

export function getRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

// Status utilities
export function getStatusIcon(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'success':
      return '✅';
    case 'processing':
    case 'pending':
      return '⏳';
    case 'failed':
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    case 'archived':
      return '📁';
    default:
      return '📄';
  }
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'success':
      return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    case 'processing':
    case 'pending':
      return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    case 'failed':
    case 'error':
      return 'text-red-600 bg-red-50 dark:bg-red-900/20';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    case 'archived':
      return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    default:
      return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
  }
}

// URL and slug utilities
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

export function capitalizeFirst(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function capitalizeWords(text: string): string {
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

// Array utilities
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = (item[key] as unknown as string) || 'undefined';
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

// Validation utilities
export function isEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Color utilities
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[9], 16),
    b: parseInt(result[10], 16)
  } : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Local storage utilities (with error handling)
export function getFromStorage(key: string, defaultValue: any = null): any {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading from localStorage:`, error);
    return defaultValue;
  }
}

export function setToStorage(key: string, value: any): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Error writing to localStorage:`, error);
    return false;
  }
}

export function removeFromStorage(key: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Error removing from localStorage:`, error);
    return false;
  }
}

// Performance utilities
export function measurePerformance<T>(fn: () => T, label?: string): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  if (label) {
    console.log(`${label} took ${end - start} milliseconds`);
  }
  
  return result;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export all utilities as a default object for easier importing
export default {
  cn,
  formatBytes,
  formatNumber,
  formatDate,
  formatDateShort,
  formatTime,
  formatRelativeTime,
  getRelativeTime,
  truncateString,
  getComplexityColor,
  getFileTypeIcon,
  getStatusIcon,
  getStatusColor,
  calculateComplexityLevel,
  debounce,
  throttle,
  generateId,
  isValidFileType,
  slugify,
  capitalizeFirst,
  capitalizeWords,
  groupBy,
  sortBy,
  isEmail,
  isUrl,
  hexToRgb,
  rgbToHex,
  getFromStorage,
  setToStorage,
  removeFromStorage,
  measurePerformance,
  sleep,
};
