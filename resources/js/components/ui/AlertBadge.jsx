import React from 'react';

const severityMap = {
    emergency: 'bg-red-600   text-white',
    critical:  'bg-red-100   dark:bg-red-900/40  text-red-700  dark:text-red-300',
    warning:   'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
    info:      'bg-blue-100  dark:bg-blue-900/40  text-blue-700  dark:text-blue-300',
};

export default function AlertBadge({ severity }) {
    const cls = severityMap[severity] ?? severityMap.info;
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${cls}`}>
            {severity === 'emergency' && <span className="w-1.5 h-1.5 bg-white rounded-full mr-1 badge-pulse" />}
            {severity}
        </span>
    );
}
