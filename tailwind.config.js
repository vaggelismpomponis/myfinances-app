/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'app-bg': '#F9F9F9',
            },
            fontSize: {
                'xs': ['0.8125rem', { lineHeight: '1.25rem' }],   // 13px
                'sm': ['0.9375rem', { lineHeight: '1.5rem' }],    // 15px
                'base': ['1.0625rem', { lineHeight: '1.75rem' }], // 17px
                'lg': ['1.25rem', { lineHeight: '1.75rem' }],     // 20px
                'xl': ['1.375rem', { lineHeight: '1.75rem' }],    // 22px
                '2xl': ['1.625rem', { lineHeight: '2rem' }],      // 26px
                '3xl': ['2rem', { lineHeight: '2.5rem' }],        // 32px
                '4xl': ['2.375rem', { lineHeight: '2.5rem' }],    // 38px
            },
            animation: {
                'bounce-slow': 'bounce 3s infinite',
            }
        },
    },
    plugins: [],
}
