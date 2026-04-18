import React from 'react';

export default function Button({ type = 'button', className = '', children, ...props }) {
    return (
        <button
            type={type}
            className={`inline-flex items-center px-4 py-2 bg-[#1b2b20] border border-transparent rounded-lg font-semibold text-xs text-white uppercase tracking-widest hover:bg-[#121c15] focus:bg-[#121c15] active:bg-[#0a0f0c] focus:outline-none focus:ring-2 focus:ring-[#1b2b20] focus:ring-offset-2 transition ease-in-out duration-150 ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}