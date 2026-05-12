import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchAlerts = createAsyncThunk('alerts/fetchAll', async (params = {}, { rejectWithValue }) => {
    try {
        const res = await api.get('/alerts', { params });
        return res.data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message ?? 'Failed to fetch alerts');
    }
});

export const fetchAlertStats = createAsyncThunk('alerts/stats', async (_, { rejectWithValue }) => {
    try {
        const res = await api.get('/alerts/stats');
        return res.data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

export const updateAlertStatus = createAsyncThunk('alerts/updateStatus', async ({ id, status, notes }, { rejectWithValue }) => {
    try {
        const res = await api.patch(`/alerts/${id}/status`, { status, notes });
        return res.data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

const alertSlice = createSlice({
    name: 'alerts',
    initialState: {
        items:       [],
        pagination:  null,
        stats:       null,
        loading:     false,
        error:       null,
        // Real-time alerts pushed via WebSocket
        liveAlerts:  [],
    },
    reducers: {
        addLiveAlert: (state, action) => {
            state.liveAlerts.unshift(action.payload);
            // Keep only last 10
            if (state.liveAlerts.length > 10) state.liveAlerts.pop();
        },
        clearLiveAlerts: (state) => { state.liveAlerts = []; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAlerts.pending,  (s) => { s.loading = true; })
            .addCase(fetchAlerts.fulfilled,(s, a) => {
                s.loading = false;
                s.items      = a.payload.data ?? [];
                s.pagination = { ...a.payload, data: undefined };
            })
            .addCase(fetchAlerts.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
            .addCase(fetchAlertStats.fulfilled, (s, a) => { s.stats = a.payload; })
            .addCase(updateAlertStatus.fulfilled, (s, a) => {
                const idx = s.items.findIndex(al => al._id === a.payload._id);
                if (idx !== -1) s.items[idx] = a.payload;
            });
    },
});

export const { addLiveAlert, clearLiveAlerts } = alertSlice.actions;
export default alertSlice.reducer;

export const selectAlerts     = (s) => s.alerts.items;
export const selectAlertStats = (s) => s.alerts.stats;
export const selectLiveAlerts = (s) => s.alerts.liveAlerts;
