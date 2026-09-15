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

const initialState: NotificationsState = {
  items: [],
  total: 0,
  page: 1,
  unreadCount: 0,
  highlight: null,
  loading: false,
  error: null,
  hasMore: true,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params: { page: number; limit: number }, { rejectWithValue }) => {
    try {
      // API returns { notifications, total, page, totalPages }
      return await notificationsApi.getNotifications(params);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load notifications');
    }
  }
);

export const markReadThunk = createAsyncThunk(
  'notifications/markRead',
  async (id: string, { rejectWithValue }) => {
    try {
      await notificationsApi.markRead(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark read');
    }
  }
);

export const getHighlightThunk = createAsyncThunk(
  'notifications/getHighlight',
  async (_, { rejectWithValue }) => {
    try {
      // API returns { highlight }
      const data = await notificationsApi.getContributorHighlight();
      return data.highlight;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to get highlight');
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        const { notifications, total, page, totalPages } = action.payload!;
        if (page === 1) {
          state.items = notifications;
        } else {
          state.items = [...state.items, ...notifications];
        }
        state.page = page;
        state.total = total;
        state.hasMore = page < totalPages;
        state.unreadCount = state.items.filter(i => !i.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(markReadThunk.fulfilled, (state, action) => {
        const item = state.items.find(i => i._id === action.payload);
        if (item && !item.read) {
          item.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(getHighlightThunk.fulfilled, (state, action) => {
        state.highlight = action.payload ?? null;
      });
  },
});

export default notificationsSlice.reducer;
