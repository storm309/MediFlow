import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchRiskAnalysis = createAsyncThunk(
    'ai/fetchRiskAnalysis',
    async (patientId, { rejectWithValue }) => {
        try {
            const { data } = await api.post(`/ai/risk/${patientId}`);
            return data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message ?? 'AI analysis failed');
        }
    }
);

export const sendChatMessage = createAsyncThunk(
    'ai/sendChatMessage',
    async ({ message, sessionId = 'default' }, { rejectWithValue }) => {
        try {
            const { data } = await api.post('/ai/chat', { message, session_id: sessionId });
            return { userMessage: message, aiReply: data.data.message };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message ?? 'Chat unavailable');
        }
    }
);

export const fetchChatHistory = createAsyncThunk(
    'ai/fetchChatHistory',
    async (sessionId = 'default', { rejectWithValue }) => {
        try {
            const { data } = await api.get('/ai/chat/history', { params: { session_id: sessionId } });
            return data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message ?? 'Failed to load history');
        }
    }
);

export const clearChatHistory = createAsyncThunk(
    'ai/clearChatHistory',
    async (sessionId = 'default') => {
        await api.delete('/ai/chat/history', { params: { session_id: sessionId } });
        return sessionId;
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const aiSlice = createSlice({
    name: 'ai',
    initialState: {
        // Risk analysis
        risk: null,
        riskLoading: false,
        riskError: null,

        // Chat
        messages: [],       // { role: 'user'|'assistant', content, timestamp }
        chatLoading: false,
        chatError: null,
        chatOpen: false,
    },
    reducers: {
        setChatOpen(state, action) {
            state.chatOpen = action.payload;
        },
        clearRiskError(state) {
            state.riskError = null;
        },
        clearChatError(state) {
            state.chatError = null;
        },
    },
    extraReducers: (builder) => {
        // ── Risk Analysis
        builder
            .addCase(fetchRiskAnalysis.pending, (state) => {
                state.riskLoading = true;
                state.riskError   = null;
            })
            .addCase(fetchRiskAnalysis.fulfilled, (state, { payload }) => {
                state.riskLoading = false;
                state.risk        = payload;
            })
            .addCase(fetchRiskAnalysis.rejected, (state, { payload }) => {
                state.riskLoading = false;
                state.riskError   = payload;
            });

        // ── Chat History Load
        builder
            .addCase(fetchChatHistory.fulfilled, (state, { payload }) => {
                state.messages = (payload || []).map((m) => ({
                    role:      m.role,
                    content:   m.content,
                    timestamp: m.created_at,
                }));
            });

        // ── Send Message
        builder
            .addCase(sendChatMessage.pending, (state, { meta }) => {
                state.chatLoading = true;
                state.chatError   = null;
                // Optimistically add user message
                state.messages.push({
                    role:      'user',
                    content:   meta.arg.message,
                    timestamp: new Date().toISOString(),
                });
            })
            .addCase(sendChatMessage.fulfilled, (state, { payload }) => {
                state.chatLoading = false;
                // Add AI reply
                state.messages.push({
                    role:      'assistant',
                    content:   payload.aiReply,
                    timestamp: new Date().toISOString(),
                });
            })
            .addCase(sendChatMessage.rejected, (state, { payload }) => {
                state.chatLoading = false;
                state.chatError   = payload;
                // Remove the optimistic user message on failure
                state.messages.pop();
            });

        // ── Clear History
        builder
            .addCase(clearChatHistory.fulfilled, (state) => {
                state.messages = [];
            });
    },
});

export const { setChatOpen, clearRiskError, clearChatError } = aiSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectRisk        = (s) => s.ai.risk;
export const selectRiskLoading = (s) => s.ai.riskLoading;
export const selectRiskError   = (s) => s.ai.riskError;
export const selectChatMessages = (s) => s.ai.messages;
export const selectChatLoading  = (s) => s.ai.chatLoading;
export const selectChatOpen     = (s) => s.ai.chatOpen;

export default aiSlice.reducer;
