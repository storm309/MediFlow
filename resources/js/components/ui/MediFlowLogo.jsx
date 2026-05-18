import React from 'react';

/**
 * MediFlow Logo Component
 * Displays the official MediFlow medical cross logo with heart and arrow design
 *
 * Props:
 * - size: 'sm' (24px), 'md' (32px), 'lg' (48px), 'xl' (64px), 'full' - default 'md'
 * - variant: 'icon' (image only), 'text' (image + text), 'text-only' - default 'icon'
 * - showBadge: Display role badge below logo - default false
 * - badge: Role badge text ('Admin', 'Doctor', 'Patient') - optional
 */
export default function MediFlowLogo({
    size = 'md',
    variant = 'icon',
    showBadge = false,
    badge = null,
    className = ''
}) {
    const sizeMap = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
        full: 'w-full max-w-xs'
    };

    const textSizeMap = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-lg',
        xl: 'text-2xl',
        full: 'text-3xl'
    };

    const badgeSizeMap = {
        sm: 'text-[10px] px-1 py-0.5',
        md: 'text-xs px-1.5 py-0.5',
        lg: 'text-sm px-2 py-1',
        xl: 'text-base px-3 py-1.5',
        full: 'text-lg px-4 py-2'
    };

    return (
        <div className={`flex flex-col items-center gap-2 ${className}`}>
            {/* Logo Image */}
            {(variant === 'icon' || variant === 'text') && (
                <img
                    src="/images/mediflow-logo.jpg"
                    alt="MediFlow"
                    className={`${sizeMap[size]} rounded-lg object-cover shadow-md`}
                />
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
                <span className={`${badgeSizeMap[size]} bg-blue-600 text-white font-semibold rounded-full`}>
                    {badge}
                </span>
            )}
        </div>
    );
}
