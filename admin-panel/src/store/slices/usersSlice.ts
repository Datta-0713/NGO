import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '@/api/usersApi';
import type { User } from '@/types';

interface UsersState {
  items: User[];
  total: number;
  page: number;
  loading: boolean;
  error: string | null;
}

export const fetchUsers = createAsyncThunk(
  'users/fetch',
  async (params: { page?: number; limit?: number; search?: string; role?: 'user' | 'admin'; status?: 'active' | 'inactive' }, { rejectWithValue }) => {
    try {
      // API returns full ApiResponse: { success, data: { users, total, page, totalPages }, message }
      return await api.getUsers(params);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load users');
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    items: [] as User[],
    total: 0,
    page: 1,
    loading: false,
    error: null as string | null,
  } as UsersState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload = ApiResponse → .data = { users: User[], total, page, totalPages }
        state.items = action.payload?.data?.users ?? [];
        state.total = action.payload?.data?.total ?? 0;
        state.page  = action.payload?.data?.page  ?? 1;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default usersSlice.reducer;