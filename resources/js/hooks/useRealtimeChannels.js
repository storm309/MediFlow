import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { getEcho }      from '../services/echo';
import { addLiveMetric }       from '../redux/slices/metricsSlice';
import { addLiveAlert }        from '../redux/slices/alertSlice';
import { addLiveNotification } from '../redux/slices/notificationSlice';

/**
 * Hook that subscribes to patient's private channel for real-time updates.
 * @param {string|null} patientId
 */
export function usePatientChannel(patientId) {
    const dispatch   = useDispatch();
    const channelRef = useRef(null);

    useEffect(() => {
        if (!patientId) return;

        const echo    = getEcho();
        const channel = echo.private(`patient.${patientId}`);
        channelRef.current = channel;

        // Live metric updates
        channel.listen('.metric.updated', (data) => {
            dispatch(addLiveMetric(data));
        });

        // Live alert creation
        channel.listen('.alert.created', (data) => {
            dispatch(addLiveAlert(data));
        });

        return () => {
            echo.leave(`patient.${patientId}`);
        };
    }, [patientId, dispatch]);
}

/**
 * Hook that subscribes to the public alerts channel.
 */
export function useAlertsChannel() {
    const dispatch = useDispatch();

    useEffect(() => {
        const echo    = getEcho();
        const channel = echo.channel('alerts');

        channel.listen('.alert.created', (data) => {
            dispatch(addLiveAlert(data));
            dispatch(addLiveNotification({
                _id:     data._id ?? data.id,
                title:   `⚠️ ${data.severity} Alert`,
                message: data.message,
                type:    'alert',
                is_read: false,
                created_at: data.created_at,
            }));
        });

        return () => {
            echo.leave('alerts');
        };
    }, [dispatch]);
}
