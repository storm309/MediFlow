import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchReports = createAsyncThunk('reports/fetch', async (params = {}, { rejectWithValue }) => {
    try {
        const res = await api.get('/reports', { params });
        return res.data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

export const generateReport = createAsyncThunk('reports/generate', async (data, { rejectWithValue }) => {
    try {
        const res = await api.post('/reports/generate', data);
        return res.data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

export const addReportNotes = createAsyncThunk('reports/addNotes', async ({ id, doctor_notes, status }, { rejectWithValue }) => {
    try {
        const res = await api.patch(`/reports/${id}/notes`, { doctor_notes, status });
        return res.data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

const reportSlice = createSlice({
    name: 'reports',
    initialState: { items: [], loading: false, error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchReports.pending,    (s) => { s.loading = true; })
            .addCase(fetchReports.fulfilled,  (s, a) => { s.loading = false; s.items = a.payload.data ?? []; })
            .addCase(fetchReports.rejected,   (s, a) => { s.loading = false; s.error = a.payload; })
            .addCase(generateReport.fulfilled,(s, a) => { s.items.unshift(a.payload); })
            .addCase(addReportNotes.fulfilled,(s, a) => {
                const idx = s.items.findIndex(i => i._id === a.payload._id);
                if (idx !== -1) s.items[idx] = a.payload;
            });
    },
});

export default reportSlice.reducer;
export const selectReports        = (s) => s.reports.items;
export const selectReportsLoading = (s) => s.reports.loading;
