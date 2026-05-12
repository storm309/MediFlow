import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchMetrics = createAsyncThunk('metrics/fetch', async ({ patientId, params = {} }, { rejectWithValue }) => {
    try {
        const res = await api.get(`/patients/${patientId}/metrics`, { params });
        return res.data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

export const fetchRecentMetrics = createAsyncThunk('metrics/recent', async (patientId, { rejectWithValue }) => {
    try {
        const res = await api.get(`/patients/${patientId}/metrics/recent`);
        return { patientId, data: res.data.data };
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

export const fetchLatestMetric = createAsyncThunk('metrics/latest', async (patientId, { rejectWithValue }) => {
    try {
        const res = await api.get(`/patients/${patientId}/metrics/latest`);
        return { patientId, data: res.data.data };
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

export const postMetric = createAsyncThunk('metrics/post', async ({ patientId, data }, { rejectWithValue }) => {
    try {
        const res = await api.post(`/patients/${patientId}/metrics`, data);
        return res.data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

const metricsSlice = createSlice({
    name: 'metrics',
    initialState: {
        history:       [],
        recent:        [],   // chart data (last 50)
        latestByPatient: {}, // { patientId: metricObject }
        loading:       false,
        error:         null,
    },
    reducers: {
        addLiveMetric: (state, action) => {
            const m = action.payload;
            // Update recent list for charts (trim to last 50)
            state.recent = [m, ...state.recent].slice(0, 50);
            // Update latest
            state.latestByPatient[m.patient_id] = m;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMetrics.pending,   (s) => { s.loading = true; })
            .addCase(fetchMetrics.fulfilled,  (s, a) => {
                s.loading  = false;
                s.history  = a.payload.data ?? a.payload;
            })
            .addCase(fetchMetrics.rejected,   (s, a) => { s.loading = false; s.error = a.payload; })
            .addCase(fetchRecentMetrics.fulfilled, (s, a) => {
                s.recent = a.payload.data ?? [];
            })
            .addCase(fetchLatestMetric.fulfilled, (s, a) => {
                if (a.payload.data) {
                    s.latestByPatient[a.payload.patientId] = a.payload.data;
                }
            })
            .addCase(postMetric.fulfilled, (s, a) => {
                const m = a.payload;
                s.recent = [m, ...s.recent].slice(0, 50);
                s.latestByPatient[m.patient_id] = m;
            });
    },
});

export const { addLiveMetric } = metricsSlice.actions;
export default metricsSlice.reducer;

export const selectRecent       = (s) => s.metrics.recent;
export const selectHistory      = (s) => s.metrics.history;
export const selectLatestByPat  = (patientId) => (s) => s.metrics.latestByPatient[patientId];
