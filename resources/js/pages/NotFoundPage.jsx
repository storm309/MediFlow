import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="text-center">
                <div className="text-8xl font-extrabold text-blue-600 mb-4">404</div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Page Not Found</h1>
                <p className="text-slate-500 mb-6">The page you're looking for doesn't exist.</p>
                <Link to="/" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors">
                    Go Home
                </Link>
            </div>
        </div>
    );
}
