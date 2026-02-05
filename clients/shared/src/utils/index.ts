// form validation, date formatting, etc.

export function buildQueryString(params: Record<string, unknown>): string {
  const parts: string[] = [];

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      // for handling arrays formated like: ?ids=1&ids=2&ids=3
      for (const item of value) {
        if (item !== undefined && item !== null) {
          parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
        }
      }
    } else if (typeof value === 'object') {
      // Handle nested objects: ?filter[name]=foo&filter[age]=25
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        if (nestedValue !== undefined && nestedValue !== null) {
          parts.push(`${encodeURIComponent(`${key}[${nestedKey}]`)}=${encodeURIComponent(String(nestedValue))}`);
        }
      }
    } else {
      // Handle primitives (string, number, boolean)
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }

  return parts.join('&');
}