/**
 * Utility functions to sanitize data from API responses
 * Prevents XSS attacks by stripping HTML tags from string fields
 */

/**
 * Strips HTML tags from a string to prevent XSS
 */
export function stripHtml(value: string): string {
  if (!value || typeof value !== 'string') {
    return value;
  }
  // Remove HTML tags and decode common HTML entities
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}

/**
 * Recursively sanitizes all string properties in an object
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return stripHtml(obj) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as T;
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      const value = (obj as Record<string, unknown>)[key];
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized as T;
  }

  return obj;
}
