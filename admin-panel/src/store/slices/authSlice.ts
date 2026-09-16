import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authApi from '@/api/authApi';
import { User } from '@/types';

interface AuthState { user: User | null; accessToken: string | null; isAuthenticated: boolean; loading: boolean; error: string | null; }

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: false,
  error: null,
};

export const loginThunk = createAsyncThunk('auth/login', async (credentials: any, { rejectWithValue }) => {
  try {
    const res = await authApi.login(credentials);
    // res = ApiResponse: { success, data: { user, accessToken, refreshToken }, message }
    localStorage.setItem('accessToken', res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const getMeThunk = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const res = await authApi.getMe();
    // res.data = { user: User }
    return res.data as { user: User };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Session expired');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(loginThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload as string || 'Login failed'; })
      .addCase(getMeThunk.fulfilled, (state, action) => { state.user = action.payload.user; state.isAuthenticated = true; })
      .addCase(getMeThunk.rejected, (state) => { authSlice.caseReducers.logout(state); });
  }
});
export const { logout } = authSlice.actions;
export default authSlice.reducer;