import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { creditsApi } from '../../api/creditsApi';
import type { CreditTransaction } from '../../types';

interface ProfileState {
  creditHistory: CreditTransaction[];
  total: number;
  page: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
}

const initialState: ProfileState = {
  creditHistory: [],
  total: 0,
  page: 1,
  loading: false,
  error: null,
  hasMore: true,
};

export const fetchCreditHistory = createAsyncThunk(
  'profile/fetchCreditHistory',
  async (params: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      // creditsApi.getCreditHistory now returns { transactions, total, page, totalPages } directly
      return await creditsApi.getCreditHistory(params);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load credit history');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCreditHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCreditHistory.fulfilled, (state, action) => {
        state.loading = false;
        const { transactions, total, page, totalPages } = action.payload!;
        if (page === 1) {
          state.creditHistory = transactions;
        } else {
          state.creditHistory = [...state.creditHistory, ...transactions];
        }
        state.page = page;
        state.total = total;
        state.hasMore = page < totalPages;
      })
      .addCase(fetchCreditHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default profileSlice.reducer;
