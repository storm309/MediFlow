import { configureStore } from '@reduxjs/toolkit';
import authReducer          from './slices/authSlice';
import patientReducer       from './slices/patientSlice';
import alertReducer         from './slices/alertSlice';
import metricsReducer       from './slices/metricsSlice';
import notificationReducer  from './slices/notificationSlice';
import reportReducer        from './slices/reportSlice';
import appointmentReducer   from './slices/appointmentSlice';
import uiReducer            from './slices/uiSlice';

export const store = configureStore({
    reducer: {
        auth:         authReducer,
        patients:     patientReducer,
        alerts:       alertReducer,
        metrics:      metricsReducer,
        notifications: notificationReducer,
        reports:      reportReducer,
        appointments: appointmentReducer,
        ui:           uiReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }),
});

/** @typedef {ReturnType<typeof store.getState>} RootState */
/** @typedef {typeof store.dispatch} AppDispatch */
