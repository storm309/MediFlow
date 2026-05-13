import React, { useEffect } from 'react';
import ReactDOM             from 'react-dom/client';
import { Provider }         from 'react-redux';
import { BrowserRouter }    from 'react-router-dom';
import { Toaster }          from 'react-hot-toast';
import { store }            from './redux/store';
import App                  from './App.jsx';
import { fetchMe }          from './redux/slices/authSlice';
import { selectDarkMode }   from './redux/slices/uiSlice';
import '../css/app.css';

// Init dark mode from localStorage
const dark = localStorage.getItem('mediflow_dark') === 'true';
if (dark) document.documentElement.classList.add('dark');

// Prefetch user on load
store.dispatch(fetchMe());

// Register service worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <App />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#1e293b',
                            color: '#f1f5f9',
                            fontSize: '14px',
                        },
                        success: { iconTheme: { primary: '#10B981', secondary: '#f1f5f9' } },
                        error:   { iconTheme: { primary: '#EF4444', secondary: '#f1f5f9' } },
                    }}
                />
            </BrowserRouter>
        </Provider>
    </React.StrictMode>
);
