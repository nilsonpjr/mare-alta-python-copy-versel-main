/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}",
        "./types/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: 'var(--primary-color)',
                'primary-hover': 'var(--primary-hover)',
                background: 'var(--bg-color)',
                surface: 'var(--card-bg)',
                'text-main': 'var(--text-main)',
                'text-muted': 'var(--text-muted)',
            },
            fontFamily: {
                sans: ['var(--font-family)', 'Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
