import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as adminApi from '@/api/adminApi';
import { DashboardStats } from '@/types';

export const fetchDashboardStats = createAsyncThunk('dashboard/fetchStats', async () => {
  const res = await adminApi.getDashboardStats();
  return res.data;
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: { stats: null as DashboardStats | null, loading: false, error: null as string | null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => { state.loading = false; state.stats = action.payload; })
      .addCase(fetchDashboardStats.rejected, (state, action) => { state.loading = false; state.error = action.error.message || 'Failed to load stats'; });
  }
});
export default dashboardSlice.reducer;