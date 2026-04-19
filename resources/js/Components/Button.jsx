export default function Button({
    type = 'button',
    className = '',
    children,
    ...props
}) {
    return (
        <button
            type={type}
            className={`inline-flex items-center rounded-lg border border-transparent bg-[#000000] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-800 focus:bg-[#121c15] focus:outline-none focus:ring-2 focus:ring-[#1b2b20] focus:ring-offset-2 active:bg-[#0a0f0c] ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
