import * as fs from 'fs';
import * as path from 'path';

export const utils = {
  /**
   * Get date N days ago in ISO format
   */
  getDateNDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
  },

  /**
   * Get end date based on days back (0 = today)
   */
  getEndDate(daysBack: number): string {
    return daysBack === 0 ? 
      this.getCurrentDate() : 
      this.getDateNDaysAgo(daysBack);
  },

  /**
   * Get current date in ISO format
   */
  getCurrentDate(): string {
    return new Date().toISOString();
  },

  /**
   * Sleep for a specified duration to avoid rate limiting
   */
  rateLimitSleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Ensure directory exists
   */
  ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  },

  /**
   * Implement exponential backoff for rate limit handling
   * Only used when a rate limit error is encountered
   */
  async exponentialBackoff(
    fn: () => Promise<any>,
    maxRetries: number = 3,
    initialDelayMs: number = 1000
  ): Promise<any> {
    let retries = 0;
    
    while (true) {
      try {
        return await fn();
      } catch (error) {
        const isRateLimitError = 
          error instanceof Error && 
          error.message.includes('API request failed with status code 429');
        
        retries++;
        
        if (!isRateLimitError || retries > maxRetries) {
          throw error;
        }
        
        const delayMs = initialDelayMs * Math.pow(2, retries - 1);
        await utils.rateLimitSleep(delayMs);
      }
    }
  }
};