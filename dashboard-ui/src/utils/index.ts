/**
 * Utility Functions for Digital Twin Dashboard
 */

import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { DATE_FORMATS } from '../constants';

// ==================== Date Utilities ====================

/**
 * Format a date string for display
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return 'Invalid date';
  
  return format(parsed, DATE_FORMATS.DISPLAY);
}

/**
 * Format a date string with time
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return 'Invalid date';
  
  return format(parsed, DATE_FORMATS.DISPLAY_WITH_TIME);
}

/**
 * Format a date as relative time (e.g., "5 minutes ago")
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return 'Invalid date';
  
  return formatDistanceToNow(parsed, { addSuffix: true });
}

/**
 * Format time only (HH:mm:ss)
 */
export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsed)) return 'Invalid date';
  
  return format(parsed, DATE_FORMATS.TIME_ONLY);
}

// ==================== Number Utilities ====================

/**
 * Format a number with thousands separators
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat().format(value);
}

/**
 * Format a percentage value
 */
export function formatPercentage(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined) return 'N/A';
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Format duration in milliseconds to human readable string
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`;
}

// ==================== String Utilities ====================

/**
 * Truncate a string to a maximum length
 */
export function truncate(str: string, maxLength: number): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert snake_case or SCREAMING_SNAKE_CASE to Title Case
 */
export function snakeToTitle(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ==================== Color Utilities ====================

/**
 * Get severity color class
 */
export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    CRITICAL: 'text-red-500',
    HIGH: 'text-orange-500',
    MEDIUM: 'text-yellow-500',
    LOW: 'text-blue-500',
    INFO: 'text-gray-500',
  };
  return colors[severity] || colors.INFO;
}

/**
 * Get severity background color class
 */
export function getSeverityBgColor(severity: string): string {
  const colors: Record<string, string> = {
    CRITICAL: 'bg-red-500/20',
    HIGH: 'bg-orange-500/20',
    MEDIUM: 'bg-yellow-500/20',
    LOW: 'bg-blue-500/20',
    INFO: 'bg-gray-500/20',
  };
  return colors[severity] || colors.INFO;
}

/**
 * Get status color class
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    HEALTHY: 'text-green-500',
    ACTIVE: 'text-green-500',
    COMPLETED: 'text-green-500',
    WARNING: 'text-yellow-500',
    PENDING: 'text-yellow-500',
    IN_PROGRESS: 'text-blue-500',
    CRITICAL: 'text-red-500',
    FAILED: 'text-red-500',
    UNKNOWN: 'text-gray-500',
    OFFLINE: 'text-gray-500',
  };
  return colors[status] || colors.UNKNOWN;
}

// ==================== Validation Utilities ====================

/**
 * Check if a value is empty (null, undefined, or empty string/array)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Safely parse JSON with a fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

// ==================== Array Utilities ====================

/**
 * Group an array by a key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    return {
      ...groups,
      [groupKey]: [...(groups[groupKey] || []), item],
    };
  }, {} as Record<string, T[]>);
}

/**
 * Sort array by multiple keys
 */
export function sortBy<T>(array: T[], ...keys: (keyof T)[]): T[] {
  return [...array].sort((a, b) => {
    for (const key of keys) {
      if (a[key] < b[key]) return -1;
      if (a[key] > b[key]) return 1;
    }
    return 0;
  });
}

// ==================== Debounce & Throttle ====================

/**
 * Debounce a function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle a function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
