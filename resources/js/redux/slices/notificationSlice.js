import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (params = {}, { rejectWithValue }) => {
    try {
        const res = await api.get('/notifications', { params });
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

export const markNotificationRead = createAsyncThunk('notifications/markRead', async (id, { rejectWithValue }) => {
    try {
        const res = await api.patch(`/notifications/${id}/read`);
        return res.data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

export const markAllRead = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
    try {
        await api.post('/notifications/mark-all-read');
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        items:       [],
        unreadCount: 0,
        loading:     false,
    },
    reducers: {
        addLiveNotification: (state, action) => {
            state.items.unshift(action.payload);
            state.unreadCount += 1;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.fulfilled, (s, a) => {
                s.loading     = false;
                s.items       = a.payload.data?.data ?? [];
                s.unreadCount = a.payload.meta?.unread_count ?? 0;
            })
            .addCase(markNotificationRead.fulfilled, (s, a) => {
                const idx = s.items.findIndex(n => n._id === a.payload._id);
                if (idx !== -1) s.items[idx] = a.payload;
                s.unreadCount = Math.max(0, s.unreadCount - 1);
            })
            .addCase(markAllRead.fulfilled, (s) => {
                s.items       = s.items.map(n => ({ ...n, is_read: true }));
                s.unreadCount = 0;
            });
    },
});

export const { addLiveNotification } = notificationSlice.actions;
export default notificationSlice.reducer;

export const selectNotifications = (s) => s.notifications.items;
export const selectUnreadCount   = (s) => s.notifications.unreadCount;
