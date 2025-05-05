/**
 * Advanced search utility that can be used across all application modules
 * Supports:
 * - Multi-word searches (words can be in any order)
 * - Case insensitive matching
 * - Accented characters (French, Arabic, etc.)
 * - Customizable search fields
 * - Various search options
 */

/**
 * Interface for configuring search options
 */
export interface SearchOptions {
  /** Whether to match all words (AND logic) or any word (OR logic) */
  matchAllWords?: boolean;
  /** Whether to match whole words only */
  wholeWordsOnly?: boolean;
  /** Whether to normalize text by removing diacritics (accents) */
  normalizeText?: boolean;
  /** Whether to perform exact matching (case sensitive, with accents) */
  exactMatch?: boolean;
}

/**
 * Default search options
 */
const DEFAULT_SEARCH_OPTIONS: SearchOptions = {
  matchAllWords: false, // Default to OR logic (match any word)
  wholeWordsOnly: false, // Default to partial word matching
  normalizeText: true, // Default to normalizing text (removing accents)
  exactMatch: false, // Default to non-exact matching
};

/**
 * Normalize text by removing diacritics (accent marks) and converting to lowercase
 * This helps with searching text with accented characters (é, è, ë, etc.)
 *
 * @param text - The text to normalize
 * @returns Normalized text
 */
export function normalizeText(text: string | null | undefined): string {
  if (!text) return "";

  // Convert to string if it's not already
  const str = String(text);

  // Normalize and remove diacritics
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove combining diacritics
    .toLowerCase();
}

/**
 * Check if a value contains the search term
 *
 * @param value - The value to check
 * @param searchTerm - The search term
 * @param options - Search options
 * @returns Whether the value contains the search term
 */
export function valueContainsSearchTerm(value: any, searchTerm: string, options: SearchOptions = DEFAULT_SEARCH_OPTIONS): boolean {
  // Handle null, undefined, or non-string values
  if (value === null || value === undefined) {
    return false;
  }

  // Convert value to string if it's not already
  const valueStr = String(value);

  // Choose how to process the strings based on options
  let processedValue = options.exactMatch ? valueStr : options.normalizeText ? normalizeText(valueStr) : valueStr.toLowerCase();

  let processedSearchTerm = options.exactMatch ? searchTerm : options.normalizeText ? normalizeText(searchTerm) : searchTerm.toLowerCase();

  // For whole words only, use word boundary check
  if (options.wholeWordsOnly) {
    const regex = new RegExp(`\\b${processedSearchTerm}\\b`, "i");
    return regex.test(processedValue);
  }

  // Otherwise simple inclusion check
  return processedValue.includes(processedSearchTerm);
}

/**
 * Advanced search function that can search across multiple fields with various options
 *
 * @param items - Array of items to search
 * @param searchTerms - Search terms (string or array of strings)
 * @param fields - Array of field names to search within each item
 * @param options - Search options
 * @returns Filtered array of items that match the search criteria
 */
export function advancedSearch<T>(
  items: T[],
  searchTerms: string | string[],
  fields: (keyof T | string)[],
  options: SearchOptions = DEFAULT_SEARCH_OPTIONS
): T[] {
  // If no search terms or empty search, return all items
  if (!searchTerms || (typeof searchTerms === "string" && searchTerms.trim() === "") || (Array.isArray(searchTerms) && searchTerms.length === 0)) {
    return items;
  }

  // Convert single search term to array for consistent processing
  const terms =
    typeof searchTerms === "string"
      ? searchTerms
          .trim()
          .split(/\s+/)
          .filter((term) => term.length > 0)
      : searchTerms;

  // No terms after splitting (e.g., only spaces)
  if (terms.length === 0) {
    return items;
  }

  return items.filter((item) => {
    // For each search term, check if it matches any field
    const termResults = terms.map((term) => {
      // Check each field for a match
      return fields.some((fieldPath) => {
        // Handle nested fields with dot notation (e.g., "wilaya.name")
        const fieldParts = String(fieldPath).split(".");
        let value = item as any;

        // Navigate through nested objects
        for (const part of fieldParts) {
          if (value === null || value === undefined) return false;
          value = value[part];
        }

        // Check if the field value contains the search term
        return valueContainsSearchTerm(value, term, options);
      });
    });

    // Apply AND/OR logic based on options
    return options.matchAllWords
      ? termResults.every(Boolean) // AND logic - all terms must match some field
      : termResults.some(Boolean); // OR logic - at least one term must match some field
  });
}

/**
 * Quick search function with sensible defaults
 *
 * @param items - Array of items to search
 * @param searchTerm - Search term
 * @param fields - Array of field names to search within each item
 * @returns Filtered array of items that match the search criteria
 */
export function quickSearch<T>(items: T[], searchTerm: string, fields: (keyof T | string)[]): T[] {
  return advancedSearch(items, searchTerm, fields, {
    matchAllWords: false,
    wholeWordsOnly: false,
    normalizeText: true,
    exactMatch: false,
  });
}
