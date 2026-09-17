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

export interface Comment {
  _id: string;
  user: { _id: string; name: string; profilePhoto: string };
  text: string;
  createdAt: string;
}

export interface MediaItem {
  url: string;
  type: 'image' | 'video';
  publicId: string;
  resourceType?: string;
  thumbnailUrl?: string;
}

export type SubmissionStatus = 'pending' | 'under_review' | 'needs_changes' | 'published' | 'rejected' | 'archived';

export interface NewsItem {
  _id: string;
  title: string;
  description: string;
  media: MediaItem[];
  location: string;
  date: string;
  category: 'Community' | 'Education' | 'Environment' | 'Health' | 'Events';
  status: SubmissionStatus;
  submittedBy?: User | null;
  createdByAdmin: boolean;
  reviewedBy?: User | null;
  claimedBy?: User | null;
  rejectionMessage?: string;
  sourceUrl?: string;
  geo?: { lat?: number; lng?: number };
  views: number;
  likesCount: number;
  commentsCount?: number;
  liked?: boolean;
  saved?: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreditTransaction {
  _id: string;
  user: string | User;
  amount: number;
  type: 'credit' | 'debit';
  reason: string;
  relatedNews?: string | NewsItem;
  performedBy?: string | User;
  createdAt: string;
}

export interface Notification {
  _id: string;
  user: string;
  type: 'news_approved' | 'news_rejected' | 'news_needs_changes' | 'credit_received' | 'news_liked' | 'system' | 'top_contributor';
  title: string;
  message: string;
  relatedEntity?: { entityId: string; entityType: 'News' | 'Submission' | 'CreditTransaction' | 'ContributorHighlight' };
  read: boolean;
  createdAt: string;
}

export interface ContributorHighlight {
  _id: string;
  period: 'weekly' | 'monthly';
  user: User;
  count: number;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
