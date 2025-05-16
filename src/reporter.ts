import chalk from 'chalk';
import Table from 'cli-table3';
import { Config, ActivityItem,  ProcessedData, UserProcessedData } from './types';
import { computeScore } from './metric';

const reporter = {
  /**
   * Generate summary report
   */
  generateSummaryReport(data: ProcessedData, config: Config): void {
    const { activityData, prCreators } = data;
    const totalPrs = new Set(prCreators.map(pc => pc.prNumber)).size;
    
    console.log('\n==========================================================================');
    console.log(`        REPORT FOR LAST ${config.days} DAYS`);
    console.log('==========================================================================');
    
    // Create table
    const table = new Table({
      head: [
        chalk.white('User'),
        chalk.white('Comments'),
        chalk.white('Approvals'),
        chalk.white('Depth'),
        chalk.white(`Breadth (w=${config.breadthWeight})`),
        chalk.white(`Combined`)
      ],
      colWidths: [22, 10, 11, 24, 20, 16]
    });
    
    // Process data for each user
    const userData = reporter.processUserData(activityData, totalPrs, config.breadthWeight, config.depthDiminishingFactor);
    
    // Sort by combined score (descending)
    userData.sort((a, b) => b.combinedScore - a.combinedScore);
    
    // Add rows to table
    userData.forEach(user => {
      table.push([
        user.displayName,
        user.comments,
        user.approvals,
        user.formattedDepth,
        user.formattedBreadth,
        user.combinedScore.toFixed(2)
      ]);
    });
    
    // Display table
    console.log(table.toString());
  },
  
  /**
   * Generate detailed report
   */
  generateDetailedReport(data: ProcessedData, config: Config): void {
    const { activityData, prAuthors } = data;
    
    console.log('\n==========================================================================');
    console.log(`        DETAILED ACTIVITY REPORT FOR LAST ${config.days} DAYS`);
    console.log('==========================================================================');
    
    // Organize data by user
    type UserData = { isApprover: boolean; isCommenter: boolean };
    const users: Record<string, UserData> = {};
    const approvals: Record<string, number> = {};
    const comments: Record<string, { prId: number; itemId: number }> = {};
    const commentCounts: Record<string, number> = {};
    
    activityData.forEach(entry => {
      const { user, type, prId, itemId, prAuthor } = entry;
      
      // Skip comments where user is PR author
      if ((type === 'comments' || type === 'review_comments') && user === prAuthor) {
        return;
      }
      
      // Initialize user data
      if (!users[user]) {
        users[user] = { isApprover: false, isCommenter: false };
      }
      
      if (type === 'approvals') {
        users[user].isApprover = true;
        
        // Record approval
        const key = `${user}:${prId}`;
        approvals[key] = prId;
      } else if (type === 'comments' || type === 'review_comments') {
        users[user].isCommenter = true;
        
        // Record comment
        const key = `${user}:${prId}:${itemId}`;
        comments[key] = { prId, itemId: itemId || 0 };
        
        // Track comment counts per PR
        const countKey = `${user}:${prId}`;
        if (!commentCounts[countKey]) {
          commentCounts[countKey] = 0;
        }
        commentCounts[countKey]++;
      }
    });
    
    // Generate report for each user
    Object.keys(users).forEach(user => {
      const userData = users[user];
      console.log(`\n>> User: ${user}`);
      
      // Show approvals
      if (userData.isApprover) {
        console.log('   === APPROVED PRs ===');
        
        // Find all approvals for this user
        Object.keys(approvals).forEach(key => {
          const [approvalUser, prIdStr] = key.split(':');
          const prId = parseInt(prIdStr);
          
          if (approvalUser === user) {
            const author = prAuthors[prId] || 'unknown';
            console.log(`   - PR #${prId} (author=${author}): ${config.webUrl}/pull/${prId}`);
          }
        });
      }
      
      // Show comments
      if (userData.isCommenter) {
        console.log('   === COMMENTS ===');
        
        // Track which PRs we've already processed
        const processedPrs = new Set<number>();
        
        // Find unique PRs this user commented on
        Object.keys(comments).forEach(key => {
          const [commentUser, prIdStr] = key.split(':');
          const prId = parseInt(prIdStr);
          
          if (commentUser === user && !processedPrs.has(prId)) {
            processedPrs.add(prId);
            
            const author = prAuthors[prId] || 'unknown';
            const count = commentCounts[`${user}:${prId}`] || 0;
            
            console.log(`   - PR #${prId} (author=${author}): ${count} comments - ${config.webUrl}/pull/${prId}`);
          }
        });
      }
    });
    
    console.log('\n==========================================================================');
  },
  
  /**
   * Process user data for reporting
   */
  processUserData(
    activityData: ActivityItem[], 
    totalPrs: number, 
    breadthWeight: number,
    depthDiminishingFactor: number
  ): UserProcessedData[] {
    // User engagement data
    interface UserData {
      prCreated: number;
      comments: number;
      approvals: number;
      uniquePrs: Set<number>;
    }
    
    const userData: Record<string, UserData> = {};
    
    // Calculate PR counts per user
    const prCreatedByUser: Record<string, number> = {};
    activityData.filter(entry => entry.type === 'pr_created').forEach(entry => {
      if (!prCreatedByUser[entry.user]) {
        prCreatedByUser[entry.user] = 0;
      }
      prCreatedByUser[entry.user]++;
    });
    
    // Process all other activity types
    activityData.forEach(entry => {
      const { user, type, count, prId, prAuthor } = entry;
      
      // Skip comments where user is PR author
      if ((type === 'comments' || type === 'review_comments') && user === prAuthor) {
        return;
      }
      
      // Initialize user data
      if (!userData[user]) {
        userData[user] = {
          prCreated: prCreatedByUser[user] || 0,
          comments: 0,
          approvals: 0,
          uniquePrs: new Set<number>()
        };
      }
      
      // Add counts for different types
      if (type === 'comments' || type === 'review_comments') {
        userData[user].comments += count;
        
        // Track unique PRs that user has interacted with
        if (user !== prAuthor) {
          userData[user].uniquePrs.add(prId);
        }
      } else if (type === 'approvals') {
        userData[user].approvals += count;
        
        // Track unique PRs that user has interacted with
        if (user !== prAuthor) {
          userData[user].uniquePrs.add(prId);
        }
      }
    });
    
    // Calculate metrics and format data
    return Object.entries(userData).map(([user, data]) => {
      const { prCreated, comments, approvals, uniquePrs } = data;
      const othersPRs = totalPrs - prCreated;
      const engagementSum = comments + approvals;
      
      // Calculate ratios
      let depth = 0;
      let breadth = 0;
      
      if (othersPRs > 0) {
        depth = engagementSum / othersPRs;
        breadth = uniquePrs.size / othersPRs;
      }
      
      // Calculate combined score with weighting
      const combinedScore = computeScore(depth, breadth, breadthWeight, depthDiminishingFactor);
      
      // Format for display
      const displayName = user.length > 20 ? user.substring(0, 20) : user;
      const formattedDepth = `${depth.toFixed(2)} (${engagementSum}/${othersPRs})`;
      const formattedBreadth = `${breadth.toFixed(2)} (${uniquePrs.size}/${othersPRs})`;
      
      return {
        displayName,
        comments,
        approvals,
        depth,
        breadth,
        formattedDepth,
        formattedBreadth,
        combinedScore
      };
    });
  }
};

export { reporter }
