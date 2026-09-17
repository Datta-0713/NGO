import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationsApi } from '../../api/notificationsApi';
import type { Notification, ContributorHighlight } from '../../types';

interface NotificationsState {
  items: Notification[];
  total: number;
  page: number;
  unreadCount: number;
  highlight: ContributorHighlight | null;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
}

const initialState: NotificationsState = { items: [], total: 0, page: 1, unreadCount: 0, highlight: null, loading: false, error: null, hasMore: true };

export const fetchNotifications = createAsyncThunk('notifications/fetchNotifications', async (params: { page: number; limit: number }, { rejectWithValue }) => {
  try { return await notificationsApi.getNotifications(params); }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Failed to load notifications'); }
});

export const refreshUnreadCount = createAsyncThunk('notifications/refreshUnreadCount', async (_, { rejectWithValue }) => {
  try { return await notificationsApi.getUnreadCount(); }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Failed to load notification count'); }
});

export const markReadThunk = createAsyncThunk('notifications/markRead', async (id: string, { rejectWithValue }) => {
  try { await notificationsApi.markRead(id); return id; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Failed to mark read'); }
});

export const markAllReadThunk = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try { await notificationsApi.markAllRead(); return true; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Failed to mark all read'); }
});

export const getHighlightThunk = createAsyncThunk('notifications/getHighlight', async (_, { rejectWithValue }) => {
  try { return (await notificationsApi.getContributorHighlight()).highlight; }
  catch (err: any) { return rejectWithValue(err.response?.data?.message || 'Failed to get highlight'); }
});

const notificationsSlice = createSlice({
  name: 'notifications', initialState, reducers: {}, extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, state => { state.loading = true; state.error = null; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        const { notifications, total, page, totalPages } = action.payload;
        state.items = page === 1 ? notifications : [...state.items, ...notifications];
        state.page = page; state.total = total; state.hasMore = page < totalPages;
      })
      .addCase(fetchNotifications.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(refreshUnreadCount.fulfilled, (state, action) => { state.unreadCount = Math.max(0, action.payload.count); })
      .addCase(markReadThunk.fulfilled, (state, action) => {
        const item = state.items.find(i => i._id === action.payload);
        if (item && !item.read) { item.read = true; state.unreadCount = Math.max(0, state.unreadCount - 1); }
      })
      .addCase(markAllReadThunk.fulfilled, (state) => { state.items.forEach(i => { i.read = true; }); state.unreadCount = 0; })
      .addCase(getHighlightThunk.fulfilled, (state, action) => { state.highlight = action.payload ?? null; });
  },
});

export default notificationsSlice.reducer;
