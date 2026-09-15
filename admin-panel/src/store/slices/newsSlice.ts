import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '@/api/newsApi';
import type { NewsItem } from '@/types';

interface NewsState {
  items: NewsItem[];
  total: number;
  page: number;
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: NewsState = {
  items: [],
  total: 0,
  page: 1,
  loading: false,
  submitting: false,
  error: null,
};

export const fetchFeed = createAsyncThunk(
  'news/fetch',
  async (params: { page?: number; limit?: number; category?: string; search?: string }, { rejectWithValue }) => {
    try {
      return await api.getFeed(params);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load news');
    }
  }
);

export const createNews = createAsyncThunk(
  'news/create',
  async (data: FormData, { rejectWithValue }) => {
    try {
      return await api.createNews(data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to publish news');
    }
  }
);

export const deleteNews = createAsyncThunk(
  'news/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.deleteNews(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete news');
    }
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch feed
      .addCase(fetchFeed.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data ?? [];
        state.total = action.payload.total ?? 0;
        state.page = action.payload.page ?? 1;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create news
      .addCase(createNews.pending, (state) => { state.submitting = true; })
      .addCase(createNews.fulfilled, (state, action) => {
        state.submitting = false;
        // Prepend to list if published
        const created = action.payload?.data?.news as NewsItem;
        if (created) state.items = [created, ...state.items];
      })
      .addCase(createNews.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      // Delete news
      .addCase(deleteNews.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item._id !== action.payload);
        state.total = Math.max(0, state.total - 1);
      });
  },
});

export default newsSlice.reducer;