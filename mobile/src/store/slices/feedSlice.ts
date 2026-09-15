import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { feedApi } from '../../api/feedApi';
import type { NewsItem } from '../../types';

interface FeedState {
  items: NewsItem[];
  total: number;
  page: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
}

const initialState: FeedState = {
  items: [],
  total: 0,
  page: 1,
  loading: false,
  error: null,
  hasMore: true,
};

export const fetchFeed = createAsyncThunk(
  'feed/fetchFeed',
  async (params: { page: number; limit: number; category?: string; search?: string }, { rejectWithValue }) => {
    try {
      // feedApi.getFeed now returns { news, total, page, totalPages } directly
      return await feedApi.getFeed(params);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load feed');
    }
  }
);

export const toggleLike = createAsyncThunk(
  'feed/toggleLike',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await feedApi.likeNews(id);
      return { id, likesCount: data?.likesCount ?? 0, liked: data?.liked ?? false };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to like');
    }
  }
);

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload = { news, total, page, totalPages }
        const { news, total, page, totalPages } = action.payload!;
        if (page === 1) {
          state.items = news;
        } else {
          state.items = [...state.items, ...news];
        }
        state.page = page;
        state.total = total;
        state.hasMore = page < totalPages;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Optimistic like toggle using server-returned likesCount
      .addCase(toggleLike.pending, (state, action) => {
        // Optimistically flip the like in UI immediately
        const item = state.items.find(i => i._id === action.meta.arg);
        if (item) {
          const currentUserId = 'optimistic';
          const isLiked = item.likes.includes(currentUserId);
          if (isLiked) {
            item.likes = item.likes.filter(id => id !== currentUserId);
          } else {
            item.likes = [...item.likes, currentUserId];
          }
        }
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        // Sync with confirmed server count
        const item = state.items.find(i => i._id === action.payload.id);
        if (item) {
          // Trim or extend likes array to match server's confirmed count
          const confirmed = action.payload.likesCount;
          if (item.likes.length > confirmed) {
            item.likes = item.likes.slice(0, confirmed);
          }
        }
      });
  },
});

export default feedSlice.reducer;
