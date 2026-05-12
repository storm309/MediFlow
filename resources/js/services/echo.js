import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

let echoInstance = null;

export function getEcho() {
    if (!echoInstance) {
        echoInstance = new Echo({
            broadcaster:      'reverb',
            key:              import.meta.env.VITE_REVERB_APP_KEY,
            wsHost:           import.meta.env.VITE_REVERB_HOST ?? 'localhost',
            wsPort:           import.meta.env.VITE_REVERB_PORT ?? 8080,
            wssPort:          import.meta.env.VITE_REVERB_PORT ?? 8080,
            forceTLS:         (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
            enabledTransports:['ws', 'wss'],
            authEndpoint:     '/api/v1/broadcasting/auth',
            auth: {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('mediflow_token')}`,
                    Accept: 'application/json',
                },
            },
        });
    }
    return echoInstance;
}

export function disconnectEcho() {
    if (echoInstance) {
        echoInstance.disconnect();
        echoInstance = null;
    }
}
