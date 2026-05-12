import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchPatients = createAsyncThunk('patients/fetchAll', async (params = {}, { rejectWithValue }) => {
    try {
        const res = await api.get('/patients', { params });
        return res.data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

export const fetchPatient = createAsyncThunk('patients/fetchOne', async (id, { rejectWithValue }) => {
    try {
        const res = await api.get(`/patients/${id}`);
        return res.data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

export const createPatient = createAsyncThunk('patients/create', async (data, { rejectWithValue }) => {
    try {
        const res = await api.post('/patients', data);
        return res.data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

export const updatePatient = createAsyncThunk('patients/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const res = await api.put(`/patients/${id}`, data);
        return res.data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message);
    }
});

const patientSlice = createSlice({
    name: 'patients',
    initialState: {
        items:      [],
        selected:   null,
        pagination: null,
        loading:    false,
        error:      null,
    },
    reducers: {
        clearSelected: (state) => { state.selected = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPatients.pending,   (s) => { s.loading = true; })
            .addCase(fetchPatients.fulfilled,  (s, a) => {
                s.loading = false;
                s.items      = a.payload.data ?? [];
                s.pagination = { ...a.payload, data: undefined };
            })
            .addCase(fetchPatients.rejected,   (s, a) => { s.loading = false; s.error = a.payload; })
            .addCase(fetchPatient.fulfilled,   (s, a) => { s.selected = a.payload; })
            .addCase(createPatient.fulfilled,  (s, a) => { s.items.unshift(a.payload); })
            .addCase(updatePatient.fulfilled,  (s, a) => {
                const idx = s.items.findIndex(p => p._id === a.payload._id);
                if (idx !== -1) s.items[idx] = a.payload;
                if (s.selected?._id === a.payload._id) s.selected = a.payload;
            });
    },
});

export const { clearSelected } = patientSlice.actions;
export default patientSlice.reducer;

export const selectPatients  = (s) => s.patients.items;
export const selectPatient   = (s) => s.patients.selected;
export const selectPatLoading = (s) => s.patients.loading;
