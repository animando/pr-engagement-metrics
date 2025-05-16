import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { URL } from 'url';
import { Config, Comment, PR, Review } from './types';
import { utils } from './utils';

interface GitHubResponse<T> {
  data: T;
  nextPage: string | null;
  rateLimitRemaining?: number;
}

const github = {
  // Track overall rate limit status
  rateLimitInfo: {
    remaining: 5000,
    resetTime: 0,
    lastChecked: 0
  },

  /**
   * Make a GitHub API request with pagination support
   */
  makeGitHubRequest<T>(endpoint: string, params: Record<string, string>, config: Config): Promise<GitHubResponse<T>> {
    return new Promise((resolve, reject) => {
      const url = new URL(
        endpoint.startsWith('http') 
          ? endpoint 
          : `${config.apiUrl}${endpoint}`
      );
      
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
      
      const options = {
        headers: {
          'User-Agent': 'GitHub-Engagement-Analyzer',
          'Authorization': `token ${config.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      };
      
      https.get(url, options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          // Update rate limit info
          const rateLimitRemaining = parseInt(res.headers['x-ratelimit-remaining'] as string, 10);
          const rateLimitReset = parseInt(res.headers['x-ratelimit-reset'] as string, 10);
          
          if (!isNaN(rateLimitRemaining)) {
            github.rateLimitInfo.remaining = rateLimitRemaining;
          }
          
          if (!isNaN(rateLimitReset)) {
            github.rateLimitInfo.resetTime = rateLimitReset * 1000;
          }
          
          github.rateLimitInfo.lastChecked = Date.now();
          
          if (res.statusCode === 429) {
            reject(new Error(`API request failed with status code 429: Rate limit exceeded`));
            return;
          }
          
          if (res.statusCode !== 200) {
            reject(new Error(`API request failed with status code ${res.statusCode}: ${data}`));
            return;
          }
          
          try {
            const parsedData = JSON.parse(data);
            const linkHeader = res.headers.link as string;
            const nextPage = github.extractNextPageUrl(linkHeader);
            
            resolve({
              data: parsedData,
              nextPage,
              rateLimitRemaining
            });
          } catch (err) {
            reject(new Error(`Failed to parse API response: ${err instanceof Error ? err.message : String(err)}`));
          }
        });
      }).on('error', (err) => {
        reject(new Error(`API request failed: ${err.message}`));
      });
    });
  },

  /**
   * Extract next page URL from Link header
   */
  extractNextPageUrl(linkHeader: string | undefined): string | null {
    if (!linkHeader) {
      return null;
    }
    
    const links = linkHeader.split(',');
    for (const link of links) {
      const [url, rel] = link.split(';');
      if (rel.trim() === 'rel="next"') {
        return url.trim().slice(1, -1); // Remove < and > characters
      }
    }
    
    return null;
  },
  
  /**
   * Fetch all pages of data with early termination option
   */
  async fetchAllPages<T>(
    endpoint: string, 
    params: Record<string, string>, 
    config: Config, 
    shouldContinue?: (data: T[]) => boolean
  ): Promise<T[]> {
    let allData: T[] = [];
    let nextPage: string | null = null;
    let currentEndpoint = endpoint;
    let currentParams = { ...params };
    
    do {
      try {
        // Check if we're close to rate limit and need to wait
        if (github.rateLimitInfo.remaining < 10 && 
            github.rateLimitInfo.resetTime > Date.now() &&
            github.rateLimitInfo.lastChecked > Date.now() - 60000) { // Only if checked in last minute
          
          const waitTime = Math.max(1000, github.rateLimitInfo.resetTime - Date.now() + 1000);
          await utils.rateLimitSleep(waitTime);
        }
        
        const response = await github.makeGitHubRequest<T[]>(currentEndpoint, currentParams, config);
        allData = allData.concat(response.data);
        nextPage = response.nextPage;
        
        // Check if we should continue to the next page
        if (shouldContinue && !shouldContinue(response.data)) {
          break;
        }
        
        if (nextPage) {
          currentEndpoint = nextPage;
          currentParams = {}; // URL already contains the parameters
          
          // Only add minimal delay between pages to avoid overwhelming the API
          await utils.rateLimitSleep(50);
        }
      } catch (error) {
        // If we hit a rate limit, wait and retry
        if (error instanceof Error && error.message.includes('status code 429')) {
          const retryDelay = 5000; // 5 seconds
          await utils.rateLimitSleep(retryDelay);
          
          // Don't advance to next page, retry the current one
          continue;
        }
        
        // For other errors, re-throw
        throw error;
      }
    } while (nextPage);
    
    return allData;
  },
  
  /**
   * Fetch PR reviews with pagination
   */
  async fetchPRReviews(prNumber: number, config: Config): Promise<void> {
    const reviews = await github.fetchAllPages<Review>(
      `/pulls/${prNumber}/reviews`,
      { per_page: '100' },
      config
    );
    
    fs.writeFileSync(
      path.join(config.tempDir, `reviews_${prNumber}.json`),
      JSON.stringify(reviews)
    );
  },
  
  /**
   * Fetch PR comments with pagination
   */
  async fetchPRComments(prNumber: number, config: Config): Promise<void> {
    const comments = await github.fetchAllPages<Comment>(
      `/pulls/${prNumber}/comments`,
      { 
        per_page: '100',
        since: config.startDate 
      },
      config
    );
    
    fs.writeFileSync(
      path.join(config.tempDir, `pr_comments_${prNumber}.json`),
      JSON.stringify(comments)
    );
  },
  
  /**
   * Fetch issue comments with pagination
   */
  async fetchIssueComments(config: Config): Promise<void> {
    const comments = await github.fetchAllPages<Comment>(
      '/issues/comments',
      {
        sort: 'created',
        direction: 'desc',
        since: config.startDate,
        per_page: '100'
      },
      config
    );
    
    fs.writeFileSync(
      path.join(config.tempDir, 'comments.json'),
      JSON.stringify(comments)
    );
  },
  
  /**
   * Fetch all GitHub data
   */
  async fetchGitHubData(config: Config): Promise<{tempDir: string}> {
    const startDateObj = new Date(config.startDate);
    const endDateObj = new Date(config.endDate);
    
    const batchSize = 5; // Process PRs in batches for better performance
    
    try {
      // GitHub Pull Request API doesn't support direct 'since' filtering on updated_at
      // We need to get recent PRs and filter them, with early termination
      const allPulls = await github.fetchAllPages<PR>(
        '/pulls',
        {
          state: 'all',
          sort: 'updated',
          direction: 'desc',
          per_page: '100'
        },
        config,
        // Stop fetching more pages once we find PRs older than our start date
        (pageData) => {
          const oldestPRInPage = pageData[pageData.length - 1];
          return oldestPRInPage && new Date(oldestPRInPage.updated_at) >= startDateObj;
        }
      );
      
      // Filter by date range in code
      const updatedPulls = allPulls.filter(pr => {
        const prDate = new Date(pr.updated_at);
        return prDate >= startDateObj && prDate <= endDateObj;
      });
      
      if (updatedPulls.length === 0) {
        console.log(`No PRs found within date range: ${config.startDate} to ${config.endDate}`);
      }
      
      fs.writeFileSync(
        path.join(config.tempDir, 'pulls.json'), 
        JSON.stringify(updatedPulls)
      );
      
      // Filter merged pulls using both start and end dates
      const mergedPulls = updatedPulls.filter(pr => {
        if (!pr.merged_at) return false;
        const mergedDate = new Date(pr.merged_at);
        return mergedDate >= startDateObj && mergedDate <= endDateObj;
      });
      
      fs.writeFileSync(
        path.join(config.tempDir, 'merged_pulls.json'), 
        JSON.stringify(mergedPulls)
      );
      
      // Process PRs in batches to improve performance
      for (let i = 0; i < updatedPulls.length; i += batchSize) {
        const batch = updatedPulls.slice(i, i + batchSize);
        await Promise.all(batch.map(async (pr) => {
          await Promise.all([
            github.fetchPRReviews(pr.number, config),
            github.fetchPRComments(pr.number, config)
          ]);
        }));
      }
      
      // Use date range for issue comments too
      await github.fetchIssueComments(config);
      
      return { tempDir: config.tempDir };
    } catch (err) {
      throw new Error(`Failed to fetch GitHub data: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
};

export { github };