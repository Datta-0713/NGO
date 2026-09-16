/**
 * Mobile app type definitions — aligned to the Asian News Bureau backend API response shapes.
 * All fields match the Mongoose model output (after toJSON transform).
 */

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
}

export interface NewsItem {
  _id: string;
  title: string;
  description: string;
  media: MediaItem[];
  location: string;
  date: string;
  category: 'Community' | 'Education' | 'Environment' | 'Health' | 'Events';
  status: 'pending' | 'published' | 'rejected';
  submittedBy?: User | null;
  createdByAdmin: boolean;
  reviewedBy?: User | null;
  rejectionMessage?: string;
  likes: string[];           // array of User._id strings
  liked?: boolean;            // computed by client optimistic state
  comments?: Comment[];
  commentsCount?: number;
  views: number;
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
  createdAt: string;
}

export interface Notification {
  _id: string;
  user: string;
  type: 'news_approved' | 'news_rejected' | 'credit_received' | 'news_liked' | 'system' | 'top_contributor';
  title: string;
  message: string;
  relatedEntity?: { entityId: string; entityType: string };
  read: boolean;
  createdAt: string;
}

export interface ContributorHighlight {
  _id: string;
  period: 'weekly' | 'monthly';
  user: User;              // populated
  count: number;
  periodStart: string;
  periodEnd: string;
  shownToUsers: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
