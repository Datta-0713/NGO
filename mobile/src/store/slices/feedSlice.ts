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
      // Optimistically flip the liked state in UI immediately
      .addCase(toggleLike.pending, (state, action) => {
        const item = state.items.find(i => i._id === action.meta.arg);
        if (item) {
          // Use the array length as a proxy — we'll sync properly on fulfilled
          // Just flip the count so UI feels instant
          if (item.liked) {
            item.liked = false;
            item.likes = item.likes.filter((_, i) => i < item.likes.length - 1);
          } else {
            item.liked = true;
            item.likes = [...(item.likes || []), 'optimistic_temp'];
          }
        }
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        // Sync with confirmed server values — replace optimistic state
        const item = state.items.find(i => i._id === action.payload.id);
        if (item) {
          item.liked = action.payload.liked;
          // Build a clean likes array of the correct length using real count
          const confirmed = action.payload.likesCount;
          // Remove optimistic entry and set correct length
          const filtered = (item.likes || []).filter(id => id !== 'optimistic_temp');
          if (action.payload.liked) {
            item.likes = [...filtered.slice(0, confirmed - 1), 'confirmed'];
          } else {
            item.likes = filtered.slice(0, confirmed);
          }
        }
      });
  },
});

export default feedSlice.reducer;
