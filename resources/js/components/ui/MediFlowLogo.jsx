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
