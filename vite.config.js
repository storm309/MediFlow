import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/main.jsx'],
            refresh: true,
        }),
        tailwindcss(),
        react(),
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    // Core React libs — cached longest
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    // Redux state layer
                    'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
                    // Charts & date utilities
                    'vendor-charts': ['recharts', 'date-fns'],
                    // Pusher / real-time
                    'vendor-realtime': ['pusher-js', 'laravel-echo'],
                },
            },
        },
    },
});
