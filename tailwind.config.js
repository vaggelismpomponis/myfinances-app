/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    safelist: [
        // Surface dark custom colors — must be safelisted so Tailwind
        // generates them even when used only via dark: prefix in JSX
        'bg-surface-dark',
        'bg-surface-dark2',
        'bg-surface-dark3',
        'bg-surface-dark4',
        'bg-surface-light',
        'dark:bg-surface-dark',
        'dark:bg-surface-dark2',
        'dark:bg-surface-dark3',
        'dark:bg-surface-dark4',
        'dark:bg-surface-light',
        'dark:bg-surface-dark/90',
        'dark:bg-surface-dark2/95',
        'dark:border-white/8',
        'dark:border-white/10',
        // Text on dark surfaces
        'dark:text-gray-100',
        'dark:text-gray-400',
        'dark:text-gray-500',
        'dark:text-white',
        // Other frequently dark: prefixed backgrounds
        'dark:bg-violet-900/30',
        'dark:bg-cyan-900/30',
        'dark:bg-amber-900/30',
        'dark:bg-emerald-900/30',
    ],
    theme: {
        extend: {
            colors: {
                white: '#F9F9F9',
                // Brand
                violet: {
                    50: '#f5f3ff',
                    100: '#ede9fe',
                    200: '#ddd6fe',
                    300: '#c4b5fd',
                    400: '#a78bfa',
                    500: '#8b5cf6',
                    600: '#7c3aed',
                    700: '#6d28d9',
                    800: '#5b21b6',
                    900: '#4c1d95',
                    950: '#2e1065',
                },
                // Surfaces
                'surface-dark': 'var(--surface-dark)',
                'surface-dark2': 'var(--surface-dark2)',
                'surface-dark3': 'var(--surface-dark3)',
                'surface-dark4': 'var(--surface-dark4)',
                'surface-light': 'var(--surface-light)',
                'brand-purple': 'var(--brand-purple)',
                'app-white': 'var(--app-white)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            fontSize: {
                'xs': ['0.75rem', { lineHeight: '1.1rem' }],
                'sm': ['0.875rem', { lineHeight: '1.35rem' }],
                'base': ['1rem', { lineHeight: '1.6rem' }],
                'lg': ['1.125rem', { lineHeight: '1.75rem' }],
                'xl': ['1.25rem', { lineHeight: '1.85rem' }],
                '2xl': ['1.5rem', { lineHeight: '2rem' }],
                '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
                '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
                '5xl': ['3rem', { lineHeight: '1' }],
            },
            animation: {
                'bounce-slow': 'bounce 3s infinite',
                'shimmer': 'shimmer 2s linear infinite',
                'float': 'float 6s ease-in-out infinite',
                'glow-pulse': 'glowPulse 2s ease-in-out infinite',
                'slide-up': 'slideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
                'slide-down': 'slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                'fade-in': 'fadeIn 0.35s ease-out',
                'pop': 'pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                'spin-slow': 'spin 3s linear infinite',
                'gradient-shift': 'gradientShift 8s ease infinite',
                'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
            },
            keyframes: {
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
                glowPulse: {
                    '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
                    '50%': { opacity: '1', transform: 'scale(1.05)' },
                },
                slideUp: {
                    from: { opacity: '0', transform: 'translateY(20px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                slideDown: {
                    from: { opacity: '0', transform: 'translateY(-10px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                fadeIn: {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                pop: {
                    '0%': { transform: 'scale(0.95)' },
                    '60%': { transform: 'scale(1.04)' },
                    '100%': { transform: 'scale(1)' },
                },
                gradientShift: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
            boxShadow: {
                'glow-violet': '0 0 24px 4px rgba(124, 58, 237, 0.35)',
                'glow-cyan': '0 0 24px 4px rgba(6,  182, 212, 0.35)',
                'glow-sm': '0 0 12px 2px rgba(124, 58, 237, 0.25)',
                'glass': '0 8px 32px rgba(0,0,0,0.18)',
                'card': '0 2px 12px rgba(0,0,0,0.04), 0 0 1px rgba(0,0,0,0.12)',
                'card-dark': '0 4px 20px rgba(0,0,0,0.4)',
            },
        },
    },
    plugins: [],
}
