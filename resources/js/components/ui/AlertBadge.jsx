import React from 'react';

const severityConfig = {
    emergency: { cls: 'status-emergency', dot: true,  label: 'Emergency' },
    critical:  { cls: 'status-critical',  dot: false, label: 'Critical'  },
    warning:   { cls: 'status-warning',   dot: false, label: 'Warning'   },
    info:      { cls: 'status-info',      dot: false, label: 'Info'      },
    resolved:  { cls: 'status-resolved',  dot: false, label: 'Resolved'  },
};

export default function AlertBadge({ severity }) {
    const cfg = severityConfig[severity] ?? severityConfig.info;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${cfg.cls}`}>
            {cfg.dot && <span className="w-1.5 h-1.5 bg-current rounded-full badge-pulse flex-shrink-0" />}
            {cfg.label}
        </span>
    );
}
