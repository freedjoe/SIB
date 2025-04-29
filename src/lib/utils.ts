import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null): string {
  if (!date) return "-";

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  return new Date(date).toLocaleDateString("fr-FR", options);
}

export function formatCurrency(amount: number | null): string {
  if (amount === null) return "-";

  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency: "DZD",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Local storage utilities for caching API responses
 */
export const localStorageCache = {
  /**
   * Generate a cache key for Supabase queries
   */
  getCacheKey(table: string, queryKey: string[]): string {
    return `sib_cache_${table}_${queryKey.join("_")}`;
  },

  /**
   * Save data to local storage with timestamp
   */
  saveToCache<T>(key: string, data: T): void {
    try {
      const item = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error("Error storing data in cache:", error);
    }
  },

  /**
   * Get data from local storage cache
   */
  getFromCache<T>(key: string): { data: T; timestamp: number } | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(item) as { data: T; timestamp: number };
    } catch (error) {
      console.error("Error retrieving data from cache:", error);
      return null;
    }
  },

  /**
   * Check if cached data is stale
   */
  isStale(timestamp: number, staleTime: number = 1000 * 60 * 5): boolean {
    return Date.now() - timestamp > staleTime;
  },

  /**
   * Clear cache items for a table
   */
  clearTableCache(table: string): void {
    try {
      const keysToRemove: string[] = [];

      // Find all keys related to this table
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`sib_cache_${table}`)) {
          keysToRemove.push(key);
        }
      }

      // Remove the keys
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error("Error clearing cache for table:", error);
    }
  },
};
