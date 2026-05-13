import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ── Async Thunks ─────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        const res = await api.post('/auth/login', credentials);
        const { token, user } = res.data.data;
        localStorage.setItem('mediflow_token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return user;
    } catch (err) {
        const errors = err.response?.data?.errors;
        if (errors) {
            const first = Object.values(errors)[0];
            return rejectWithValue(Array.isArray(first) ? first[0] : first);
        }
        return rejectWithValue(err.response?.data?.message ?? 'Login failed');
    }
});

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
    try {
        const res = await api.post('/auth/register', data);
        const { token, user } = res.data.data;
        localStorage.setItem('mediflow_token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return user;
    } catch (err) {
        const errors = err.response?.data?.errors;
        if (errors) {
            const first = Object.values(errors)[0];
            return rejectWithValue(Array.isArray(first) ? first[0] : first);
        }
        return rejectWithValue(err.response?.data?.message ?? 'Registration failed');
    }
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
    try {
        const res = await api.get('/auth/me');
        return res.data.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message ?? 'Failed to fetch user');
    }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
    try {
        await api.post('/auth/logout');
    } catch (_) {/* swallow */}
    localStorage.removeItem('mediflow_token');
    delete api.defaults.headers.common['Authorization'];
});

// ── Slice ─────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user:    null,
        token:   localStorage.getItem('mediflow_token') ?? null,
        loading: false,
        error:   null,
        initialized: false,
    },
    reducers: {
        clearError: (state) => { state.error = null; },
        setUser:    (state, action) => { state.user = action.payload; },
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(loginUser.pending,    (s) => { s.loading = true; s.error = null; })
            .addCase(loginUser.fulfilled,  (s, a) => { s.loading = false; s.user = a.payload; })
            .addCase(loginUser.rejected,   (s, a) => { s.loading = false; s.error = a.payload; })
        // Register
            .addCase(registerUser.pending,   (s) => { s.loading = true; s.error = null; })
            .addCase(registerUser.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; })
            .addCase(registerUser.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })
        // Fetch me
            .addCase(fetchMe.pending,    (s) => { s.loading = true; })
            .addCase(fetchMe.fulfilled,  (s, a) => { s.loading = false; s.user = a.payload; s.initialized = true; })
            .addCase(fetchMe.rejected,   (s) => { s.loading = false; s.user = null; s.token = null; s.initialized = true; localStorage.removeItem('mediflow_token'); })
        // Logout
            .addCase(logoutUser.fulfilled, (s) => { s.user = null; s.token = null; });
    },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectUser        = (state) => state.auth.user;
export const selectIsLoggedIn  = (state) => !!state.auth.user;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError   = (state) => state.auth.error;
export const selectInitialized = (state) => state.auth.initialized;
