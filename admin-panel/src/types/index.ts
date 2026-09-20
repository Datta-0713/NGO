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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface UserActivityNews {
  _id: string;
  title: string;
  status: NewsItem['status'];
  category?: string;
  location?: string;
  media?: NewsMedia[];
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
  views?: number;
}

export interface UserActivityComment {
  _id: string;
  news?: { _id: string; title?: string; status?: NewsItem['status'] } | null;
  text: string;
  createdAt: string;
  deletedAt?: string | null;
}

export interface UserActivityLike {
  _id: string;
  news?: { _id: string; title?: string; status?: NewsItem['status'] } | null;
  createdAt: string;
}

export interface UserActivitySave {
  _id: string;
  news?: { _id: string; title?: string; status?: NewsItem['status'] } | null;
  createdAt: string;
}

export interface UserActivityCreditTransaction {
  _id: string;
  amount: number;
  type: 'credit' | 'debit';
  reason: string;
  relatedNews?: { _id: string; title?: string; status?: NewsItem['status'] } | null;
  performedBy?: { _id: string; name?: string; email?: string; profilePhoto?: string } | null;
  createdAt: string;
}

export interface UserActivityNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  relatedEntity?: { entityId?: string; entityType?: string };
  createdAt: string;
}

export interface UserDetailActivity {
  counts: {
    submittedNews: number;
    comments: number;
    likes: number;
    saves: number;
    creditTransactions: number;
    notifications: number;
    unreadNotifications: number;
  };
  recent: {
    submittedNews: UserActivityNews[];
    comments: UserActivityComment[];
    likes: UserActivityLike[];
    saves: UserActivitySave[];
    creditTransactions: UserActivityCreditTransaction[];
    notifications: UserActivityNotification[];
  };
}

export interface UserDetailResponse {
  user: User;
  notes: { adminNotes: string };
  activity: UserDetailActivity;
}

export interface NewsMedia {
  url: string;
  type: 'image' | 'video';
  publicId: string;
  resourceType?: string;
  thumbnailUrl?: string;
}

export interface NewsItem {
  _id: string;
  title: string;
  description: string;
  media: NewsMedia[];
  location: string;
  date: string;
  category: 'Community' | 'Education' | 'Environment' | 'Health' | 'Events';
  status: 'pending' | 'under_review' | 'needs_changes' | 'published' | 'rejected' | 'archived';
  archivedFromStatus?: 'pending' | 'under_review' | 'needs_changes' | 'published' | 'rejected';
  submittedBy?: User | null;
  createdByAdmin: boolean;
  reviewedBy?: User | null;
  rejectionMessage?: string;
  sourceUrl?: string;
  geo?: { lat?: number; lng?: number };
  likesCount: number;
  commentsCount?: number;
  liked?: boolean;
  saved?: boolean;
  claimedBy?: User | null;
  views: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
  evidenceNotes?: string;
}

export interface NewsComment {
  _id: string;
  news: string;
  user?: { _id: string; name: string; email?: string; profilePhoto?: string };
  text: string;
  createdAt: string;
  deletedAt?: string | null;
}

export interface SubmissionRevision {
  _id: string;
  revisionNumber: number;
  title: string;
  description: string;
  location: string;
  date: string;
  category: string;
  media?: NewsMedia[];
  changeNote?: string;
  author?: User;
  createdAt: string;
}

export interface CreditTransaction {
  _id: string;
  user: User | string;
  amount: number;
  type: 'credit' | 'debit';
  reason: string;
  relatedNews?: NewsItem | string | null;
  performedBy?: User | string;
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
  metricsChange?: { publishedNews?: number; submissions?: number; contributors?: number; monthOverMonthSubmissions?: number };
  recentSubmissions: NewsItem[];
  submissionsLast30Days: Array<{ _id: string; count: number }>;
  needsAttentionData: { pendingSubmissions: number; newContributorsThisMonth: number; creditsToBeAwarded: number };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
