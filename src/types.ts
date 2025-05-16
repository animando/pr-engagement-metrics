
// Type definitions
interface Config {
  org: string;
  repo: string;
  startDate: string;
  endDate: string;
  nDays: number;
  breadthWeight: number;
  depthDiminishingFactor: number;
  debug: boolean;
  token: string;
  apiUrl: string;
  webUrl: string;
  tempDir: string;
  withNames: boolean;
}

interface PR {
  number: number;
  user: {
    login: string;
    type: string;
  };
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  draft: boolean;
}

interface Review {
  id: number;
  user: {
    login: string;
    type: string;
  };
  state: string;
  submitted_at: string;
}

interface Comment {
  id: number;
  user: {
    login: string;
    type: string;
  };
  created_at: string;
  issue_url?: string;
}

interface ActivityItem {
  user: string;
  type: string;
  count: number;
  prId: number;
  itemId: number | null;
  prAuthor: string | null;
}

interface PRCreator {
  user: string;
  prNumber: number;
}

interface ProcessedData {
  activityData: ActivityItem[];
  prCreators: PRCreator[];
  prAuthors: Record<string, string>;
}

interface UserProcessedData {
  displayName: string;
  comments: number;
  approvals: number;
  depth: number;
  breadth: number;
  formattedDepth: string;
  formattedBreadth: string;
  combinedScore: number;
}

export type {
  ActivityItem, Comment, Config, PR, PRCreator, ProcessedData, Review, UserProcessedData, 
}