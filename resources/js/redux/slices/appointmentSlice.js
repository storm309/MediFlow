import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchAppointments = createAsyncThunk('appointments/fetch', async (params = {}, { rejectWithValue }) => {
    try {
        const res = await api.get('/appointments', { params });
        return res.data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

export const createAppointment = createAsyncThunk('appointments/create', async (data, { rejectWithValue }) => {
    try {
        const res = await api.post('/appointments', data);
        return res.data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

const appointmentSlice = createSlice({
    name: 'appointments',
    initialState: { items: [], loading: false, error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAppointments.pending,   (s) => { s.loading = true; })
            .addCase(fetchAppointments.fulfilled,  (s, a) => { s.loading = false; s.items = a.payload.data ?? []; })
            .addCase(fetchAppointments.rejected,   (s, a) => { s.loading = false; s.error = a.payload; })
            .addCase(createAppointment.fulfilled,  (s, a) => { s.items.unshift(a.payload); });
    },
});

export default appointmentSlice.reducer;
export const selectAppointments = (s) => s.appointments.items;
