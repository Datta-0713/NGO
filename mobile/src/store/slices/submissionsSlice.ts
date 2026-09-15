import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { submissionsApi } from '../../api/submissionsApi';
import type { NewsItem } from '../../types';

interface SubmissionsState {
  mySubmissions: NewsItem[];
  total: number;
  page: number;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  hasMore: boolean;
}

const initialState: SubmissionsState = {
  mySubmissions: [],
  total: 0,
  page: 1,
  loading: false,
  submitting: false,
  error: null,
  hasMore: true,
};

export const fetchMySubmissions = createAsyncThunk(
  'submissions/fetchMySubmissions',
  async (params: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      const response = await submissionsApi.getMySubmissions(params);
      // Backend: sendSuccess → response.data.data = { submissions, total, page, totalPages }
      return response.data as { submissions: NewsItem[]; total: number; page: number; totalPages: number };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load submissions');
    }
  }
);

export const submitNewsThunk = createAsyncThunk(
  'submissions/submitNews',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await submissionsApi.submitNews(formData);
      // Backend: sendSuccess → response.data.data = { news: NewsItem }
      return response.data as { news: NewsItem };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Submission failed');
    }
  }
);

const submissionsSlice = createSlice({
  name: 'submissions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMySubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMySubmissions.fulfilled, (state, action) => {
        state.loading = false;
        if (action.meta.arg.page === 1) {
          state.mySubmissions = action.payload.submissions;
        } else {
          state.mySubmissions = [...state.mySubmissions, ...action.payload.submissions];
        }
        state.page = action.payload.page;
        state.total = action.payload.total;
        state.hasMore = action.payload.page < action.payload.totalPages;
      })
      .addCase(fetchMySubmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(submitNewsThunk.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitNewsThunk.fulfilled, (state, action) => {
        state.submitting = false;
        if (action.payload?.news) {
          state.mySubmissions.unshift(action.payload.news);
          state.total += 1;
        }
      })
      .addCase(submitNewsThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });
  },
});

export default submissionsSlice.reducer;
