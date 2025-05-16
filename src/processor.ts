import * as fs from 'fs';
import * as path from 'path';
import { Config, ActivityItem, Comment, PR, PRCreator, ProcessedData, Review } from './types';

const processor = {
  /**
   * Process all GitHub activity data
   */
  processActivityData(data: {tempDir: string}, config: Config): ProcessedData {
    const activityData: ActivityItem[] = [];
    const prCreators: PRCreator[] = [];
    const prAuthors: Record<string, string> = {};
    
    // Process pull requests
    processor.processPullRequests(activityData, prCreators, prAuthors, config);
    
    // Process merged pulls
    processor.processMergedPulls(activityData, config);
    
    // Process reviews
    processor.processReviews(activityData, prAuthors, config);
    
    // Process review comments
    processor.processReviewComments(activityData, prAuthors, config);
    
    // Process issue comments
    processor.processComments(activityData, prAuthors, config);
    
    return {
      activityData,
      prCreators,
      prAuthors
    };
  },
  
  /**
   * Process pull request data
   */
  processPullRequests(
    activityData: ActivityItem[], 
    prCreators: PRCreator[], 
    prAuthors: Record<string, string>, 
    config: Config
  ): void {
    const pulls: PR[] = JSON.parse(
      fs.readFileSync(path.join(config.tempDir, 'pulls.json'), 'utf8')
    );
    
    pulls
      .filter(pr => pr.user.type !== 'Bot')
      .forEach(pr => {
        const user = pr.user.login;
        const prNumber = pr.number;
        
        // Record PR created activity
        activityData.push({
          user,
          type: 'pr_created',
          count: 1,
          prId: prNumber,
          itemId: null,
          prAuthor: null
        });
        
        // Record PR creator
        prCreators.push({
          user,
          prNumber
        });
        
        // Record PR author mapping
        prAuthors[prNumber] = user;
      });
  },
  
  /**
   * Process merged pull requests
   */
  processMergedPulls(activityData: ActivityItem[], config: Config): void {
    const mergedPulls: PR[] = JSON.parse(
      fs.readFileSync(path.join(config.tempDir, 'merged_pulls.json'), 'utf8')
    );
    
    mergedPulls
      .filter(pr => pr.user.type !== 'Bot')
      .forEach(pr => {
        activityData.push({
          user: pr.user.login,
          type: 'pr_merged',
          count: 1,
          prId: pr.number,
          itemId: null,
          prAuthor: null
        });
      });
  },
  
  /**
   * Process PR reviews
   */
  processReviews(
    activityData: ActivityItem[], 
    prAuthors: Record<string, string>, 
    config: Config
  ): void {
    const reviewFiles = fs.readdirSync(config.tempDir)
      .filter(file => file.startsWith('reviews_'))
      .map(file => path.join(config.tempDir, file));
    
    reviewFiles.forEach(file => {
      const prId = parseInt(
        path.basename(file)
          .replace('reviews_', '')
          .replace('.json', '')
      );
        
      const reviews: Review[] = JSON.parse(fs.readFileSync(file, 'utf8'));
      
      reviews
        .filter(review => review.user.type !== 'Bot')
        .forEach(review => {
          activityData.push({
            user: review.user.login,
            type: review.state === 'APPROVED' ? 'approvals' : 'reviews',
            count: 1,
            prId,
            itemId: review.id,
            prAuthor: prAuthors[prId] || null
          });
        });
    });
  },
  
  /**
   * Process review comments
   */
  processReviewComments(
    activityData: ActivityItem[], 
    prAuthors: Record<string, string>, 
    config: Config
  ): void {
    const commentFiles = fs.readdirSync(config.tempDir)
      .filter(file => file.startsWith('pr_comments_'))
      .map(file => path.join(config.tempDir, file));
    
    commentFiles.forEach(file => {
      const prId = parseInt(
        path.basename(file)
          .replace('pr_comments_', '')
          .replace('.json', '')
      );
        
      const comments: Comment[] = JSON.parse(fs.readFileSync(file, 'utf8'));
      
      comments
        .filter(comment => comment.user.type !== 'Bot')
        .forEach(comment => {
          activityData.push({
            user: comment.user.login,
            type: 'review_comments',
            count: 1,
            prId,
            itemId: comment.id,
            prAuthor: prAuthors[prId] || null
          });
        });
    });
  },
  
  /**
   * Process issue comments
   */
  processComments(
    activityData: ActivityItem[], 
    prAuthors: Record<string, string>, 
    config: Config
  ): void {
    const comments: Comment[] = JSON.parse(
      fs.readFileSync(path.join(config.tempDir, 'comments.json'), 'utf8')
    );
    
    comments
      .filter(comment => comment.user.type !== 'Bot')
      .forEach(comment => {
        if (!comment.issue_url) return;
        const prId = parseInt(comment.issue_url.split('/').pop() || '0');
        
        activityData.push({
          user: comment.user.login,
          type: 'comments',
          count: 1,
          prId,
          itemId: comment.id,
          prAuthor: prAuthors[prId] || null
        });
      });
  }
};

export { processor }