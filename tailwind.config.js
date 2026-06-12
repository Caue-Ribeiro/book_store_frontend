/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                background: '#ffffff',
                foreground: '#111111',
                muted: '#f5f5f5',
                border: '#e5e5e5',
            },
        },
    },
    plugins: [],
}
