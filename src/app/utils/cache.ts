/**
 * Simple in-memory cache for API responses
 * Improves performance by avoiding duplicate API calls
 */

type CacheValue = {
  value: any;
  expiresAt: number;
};

class Cache {
  private cache: Map<string, CacheValue> = new Map();

  /**
   * Add a value to the cache with expiration
   * @param key Cache key
   * @param value Value to store
   * @param ttlSeconds Time to live in seconds
   */
  set(key: string, value: any, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Retrieve a value from the cache
   * @param key Cache key
   * @returns The cached value or null if not found or expired
   */
  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  /**
   * Delete a specific key from the cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache or items with a specific prefix
   * @param prefix Optional prefix to clear specific items
   */
  clear(prefix?: string): void {
    if (prefix) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(prefix)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}

export const cache = new Cache(); 