import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as api from '@/api/submissionsApi';
import type { NewsItem } from '@/types';

interface SubmissionsState {
  items: NewsItem[];
  total: number;
  page: number;
  loading: boolean;
  error: string | null;
  selectedSubmission: NewsItem | null;
}

const initialState: SubmissionsState = {
  items: [],
  total: 0,
  page: 1,
  loading: false,
  error: null,
  selectedSubmission: null,
};

export const fetchSubmissions = createAsyncThunk(
  'submissions/fetch',
  async (params: { page?: number; limit?: number; status?: string; search?: string }, { rejectWithValue }) => {
    try {
      return await api.getSubmissions(params);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load submissions');
    }
  }
);

export const approveSubmission = createAsyncThunk(
  'submissions/approve',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.approveSubmission(id);
      return res.data as { news: NewsItem };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to approve');
    }
  }
);

export const rejectSubmission = createAsyncThunk(
  'submissions/reject',
  async ({ id, msg }: { id: string; msg: string }, { rejectWithValue }) => {
    try {
      const res = await api.rejectSubmission(id, msg);
      return res.data as { news: NewsItem };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to reject');
    }
  }
);

const submissionsSlice = createSlice({
  name: 'submissions',
  initialState,
  reducers: {
    selectSubmission: (state, action: PayloadAction<NewsItem | null>) => {
      state.selectedSubmission = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
      })
      .addCase(fetchSubmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(approveSubmission.fulfilled, (state, action) => {
        const updated = action.payload.news;
        const idx = state.items.findIndex((i) => i._id === updated._id);
        if (idx !== -1) state.items[idx] = updated;
        // Close modal after action
        state.selectedSubmission = null;
      })
      .addCase(rejectSubmission.fulfilled, (state, action) => {
        const updated = action.payload.news;
        const idx = state.items.findIndex((i) => i._id === updated._id);
        if (idx !== -1) state.items[idx] = updated;
        state.selectedSubmission = null;
      });
  },
});

export const { selectSubmission } = submissionsSlice.actions;
export default submissionsSlice.reducer;