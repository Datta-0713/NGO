export interface User {
  _id: string;
  name: string;
  email: string;
  profilePhoto: string;
  bio: string;
  location: string;
  role: 'user' | 'admin';
  credits: number;
  storiesCount: number;
  likesReceived: number;
  createdAt: string;
}

export interface NewsItem {
  _id: string;
  title: string;
  description: string;
  media: Array<{ url: string; type: 'image' | 'video'; publicId: string }>;
  location: string;
  date: string;
  category: 'Community' | 'Education' | 'Environment' | 'Health' | 'Events';
  status: 'pending' | 'under_review' | 'needs_changes' | 'published' | 'rejected' | 'archived';
  submittedBy?: User;
  createdByAdmin: boolean;
  reviewedBy?: User;
  rejectionMessage?: string;
  likesCount: number;
  commentsCount?: number;
  liked?: boolean;
  saved?: boolean;
  claimedBy?: User;
  views: number;
  publishedAt?: string;
  createdAt: string;
}

export interface CreditTransaction {
  _id: string;
  user: User | string;
  amount: number;
  type: 'credit' | 'debit';
  reason: string;
  relatedNews?: NewsItem | string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  user: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  publishedNewsCount: number;
  pendingCount: number;
  totalContributors: number;
  totalCreditsAwarded: number;
  totalUsers?: number;
  underReviewCount?: number;
  currentMonthSubmissions?: number;
  previousMonthSubmissions?: number;
  metricsChange?: { publishedNews?: number; submissions?: number; contributors?: number; monthOverMonthSubmissions?: number; };
  recentSubmissions: NewsItem[];
  submissionsLast30Days: Array<{ _id: string; count: number }>;
  needsAttentionData: {
    pendingSubmissions: number;
    newContributorsThisMonth: number;
    creditsToBeAwarded: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}