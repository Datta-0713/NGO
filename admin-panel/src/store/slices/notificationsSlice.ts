import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationsApi } from '@/api/notificationsApi';

interface NotificationsState {
  loading: boolean;
  error: string | null;
  broadcastSuccess: boolean;
}

const initialState: NotificationsState = {
  loading: false,
  error: null,
  broadcastSuccess: false,
};

export const broadcastThunk = createAsyncThunk(
  'notifications/broadcast',
  async (payload: { title: string; message: string }, { rejectWithValue }) => {
    try {
      await notificationsApi.broadcastNotification(payload.title, payload.message);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to broadcast');
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    resetBroadcast: (state) => { state.broadcastSuccess = false; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(broadcastThunk.pending, (state) => { state.loading = true; state.broadcastSuccess = false; state.error = null; })
      .addCase(broadcastThunk.fulfilled, (state) => { state.loading = false; state.broadcastSuccess = true; })
      .addCase(broadcastThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { resetBroadcast } = notificationsSlice.actions;
export default notificationsSlice.reducer;
