import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { URL } from 'url';
import { Config, Comment, PR, Review } from './types';
import {utils } from './utils'


const github = {
  /**
   * Make a GitHub API request
   */
  makeGitHubRequest<T>(endpoint: string, params: Record<string, string>, config: Config): Promise<T> {
    return new Promise((resolve, reject) => {
      const url = new URL(
        endpoint.startsWith('http') 
          ? endpoint 
          : `${config.apiUrl}${endpoint}`
      );
      
      // Add query parameters
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
          if (res.statusCode !== 200) {
            reject(new Error(`API request failed with status code ${res.statusCode}: ${data}`));
            return;
          }
          
          try {
            resolve(JSON.parse(data));
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
   * Fetch PR reviews
   */
  async fetchPRReviews(prNumber: number, config: Config): Promise<void> {
    const reviews = await github.makeGitHubRequest<Review[]>(`/pulls/${prNumber}/reviews`, {
      per_page: '100'
    }, config);
    
    fs.writeFileSync(
      path.join(config.tempDir, `reviews_${prNumber}.json`),
      JSON.stringify(reviews)
    );
  },
  
  /**
   * Fetch PR comments
   */
  async fetchPRComments(prNumber: number, config: Config): Promise<void> {
    const comments = await github.makeGitHubRequest<Comment[]>(`/pulls/${prNumber}/comments`, {
      per_page: '100'
    }, config);
    
    fs.writeFileSync(
      path.join(config.tempDir, `pr_comments_${prNumber}.json`),
      JSON.stringify(comments)
    );
  },
  
  /**
   * Fetch issue comments
   */
  async fetchIssueComments(sinceDate: string, config: Config): Promise<void> {
    const comments = await github.makeGitHubRequest<Comment[]>('/issues/comments', {
      sort: 'created',
      direction: 'desc',
      since: sinceDate,
      per_page: '100'
    }, config);
    
    fs.writeFileSync(
      path.join(config.tempDir, 'comments.json'),
      JSON.stringify(comments)
    );
  },
  
  /**
   * Fetch all GitHub data
   */
  async fetchGitHubData(config: Config): Promise<{tempDir: string}> {
    const sinceDate = utils.getDateNDaysAgo(config.days);
    
    try {
      // Get pulls
      const allPulls = await github.makeGitHubRequest<PR[]>('/pulls', {
        state: 'all',
        sort: 'updated',
        direction: 'desc',
        per_page: '100'
      }, config);
      
      // Filter pulls by date
      const updatedPulls = allPulls.filter(pr => 
        new Date(pr.updated_at) >= new Date(sinceDate)
      );
      
      // Save pulls to temp file
      fs.writeFileSync(
        path.join(config.tempDir, 'pulls.json'), 
        JSON.stringify(updatedPulls)
      );
      
      // Get merged pulls
      const mergedPulls = updatedPulls.filter(pr => 
        pr.merged_at && new Date(pr.merged_at) >= new Date(sinceDate)
      );
      
      // Save merged pulls
      fs.writeFileSync(
        path.join(config.tempDir, 'merged_pulls.json'), 
        JSON.stringify(mergedPulls)
      );
      
      // Get reviews and comments for each PR
      for (const pr of updatedPulls) {
        await github.fetchPRReviews(pr.number, config);
        await github.fetchPRComments(pr.number, config);
        // Slight delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Get issue comments
      await github.fetchIssueComments(sinceDate, config);
      
      return { tempDir: config.tempDir };
    } catch (err) {
      throw new Error(`Failed to fetch GitHub data: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
};

export { github }