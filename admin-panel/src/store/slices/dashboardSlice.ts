import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as adminApi from '@/api/adminApi';
import { DashboardStats } from '@/types';

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      // adminApi.getDashboardStats already does .then(res => res.data)
      // so `res` here = ApiResponse: { success, data: { ...stats }, message }
      const res = await adminApi.getDashboardStats();
      return res.data as DashboardStats;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load stats');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: { stats: null as DashboardStats | null, loading: false, error: null as string | null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => { state.loading = false; state.stats = action.payload; })
      .addCase(fetchDashboardStats.rejected, (state, action) => { state.loading = false; state.error = action.payload as string || 'Failed to load stats'; });
  }
});
export default dashboardSlice.reducer;