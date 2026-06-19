/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./index.html",
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            color: '#334155', // slate-700
            a: {
              color: '#2563eb', // blue-600
              '&:hover': {
                color: '#1d4ed8', // blue-700
              },
            },
            code: {
              color: '#db2777', // pink-600
            },
            h2: {
              color: '#0f172a', // slate-900
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '0.5rem',
            },
            li: {
              '&::marker': { color: '#2563eb' } // Cambia color de viñetas
            }
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}