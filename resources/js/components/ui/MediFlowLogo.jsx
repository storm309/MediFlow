import React from 'react';

/**
 * MediFlow Logo Component
 * Displays the official MediFlow logo
 */
export default function MediFlowLogo({ size = 'md', className = '' }) {
    const sizeMap = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
        '2xl': 'w-20 h-20',
    };

    return (
        <img
            src="/images/mediflow-logo.jpg"
            alt="MediFlow"
            className={`${sizeMap[size] || sizeMap['md']} object-cover ${className}`}
        />
    );
}

    return (
        <div className={containerClasses}>
            {/* Logo Image */}
            {(variant === 'icon' || variant === 'text') && (
                <div className={`flex items-center justify-center ${withBg ? 'p-2 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 rounded-full shadow-lg ring-2 ring-blue-200 dark:ring-blue-900/50' : 'rounded-full'} transition-all duration-300`}>
                    <img
                        src="/images/mediflow-logo.jpg"
                        alt="MediFlow"
                        className={logoClasses}
                    />
                </div>
            )}

            {/* Text */}
            {(variant === 'text' || variant === 'text-only') && (
                <div className="text-center">
                    <p className={`font-black text-slate-900 dark:text-white leading-none tracking-tight ${textSizeMap[size]}`}>
                        MediFlow
                    </p>
                    {variant === 'text' && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Patient Monitoring
                        </p>
                    )}
                </div>
            )}

            {/* Role Badge */}
            {showBadge && badge && (
                <span className={`${badgeSizeMap[size]} bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all`}>
                    {badge}
                </span>
            )}
        </div>
    );
}
