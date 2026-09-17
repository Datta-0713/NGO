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

const initialState: FeedState = { items: [], total: 0, page: 1, loading: false, error: null, hasMore: true };

export const fetchFeed = createAsyncThunk(
  'feed/fetchFeed',
  async (params: { page: number; limit: number; category?: string; search?: string }, { rejectWithValue }) => {
    try { return await feedApi.getFeed(params); }
    catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Failed to load feed'); }
  }
);

export const toggleLike = createAsyncThunk(
  'feed/toggleLike',
  async ({ id, liked }: { id: string; liked: boolean }, { rejectWithValue }) => {
    try {
      const result = liked ? await feedApi.removeLike(id) : await feedApi.setLike(id);
      return { id, ...result, previousLiked: liked };
    } catch (err: any) {
      return rejectWithValue({ message: err.response?.data?.message || 'Failed to update like', id });
    }
  }
);

export const toggleSave = createAsyncThunk(
  'feed/toggleSave',
  async ({ id, saved }: { id: string; saved: boolean }, { rejectWithValue }) => {
    try {
      const result = saved ? await feedApi.unsaveNews(id) : await feedApi.saveNews(id);
      return { id, ...result };
    } catch (err: any) { return rejectWithValue({ message: err.response?.data?.message || 'Failed to update saved story', id }); }
  }
);

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.loading = false;
        const { news, total, page, totalPages } = action.payload;
        state.items = page === 1 ? news : [...state.items, ...news];
        state.page = page;
        state.total = total;
        state.hasMore = page < totalPages;
      })
      .addCase(fetchFeed.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(toggleLike.pending, (state, action) => {
        const item = state.items.find(i => i._id === action.meta.arg.id);
        if (!item) return;
        const currentlyLiked = action.meta.arg.liked;
        item.liked = !currentlyLiked;
        item.likesCount = Math.max(0, item.likesCount + (currentlyLiked ? -1 : 1));
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const item = state.items.find(i => i._id === action.payload.id);
        if (!item) return;
        item.liked = action.payload.liked;
        item.likesCount = action.payload.likesCount;
      })
      .addCase(toggleLike.rejected, (state, action) => {
        const payload = action.payload as { id: string } | undefined;
        const id = payload?.id || action.meta.arg.id;
        const item = state.items.find(i => i._id === id);
        if (!item) return;
        item.liked = action.meta.arg.liked;
        item.likesCount = Math.max(0, item.likesCount + (action.meta.arg.liked ? 1 : -1));
      })
      .addCase(toggleSave.pending, (state, action) => {
        const item = state.items.find(i => i._id === action.meta.arg.id);
        if (item) item.saved = !action.meta.arg.saved;
      })
      .addCase(toggleSave.fulfilled, (state, action) => {
        const item = state.items.find(i => i._id === action.payload.id);
        if (item) item.saved = action.payload.saved;
      })
      .addCase(toggleSave.rejected, (state, action) => {
        const item = state.items.find(i => i._id === action.meta.arg.id);
        if (item) item.saved = action.meta.arg.saved;
      });
  },
});

export default feedSlice.reducer;
