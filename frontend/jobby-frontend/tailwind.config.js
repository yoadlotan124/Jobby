/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter","ui-sans-serif","system-ui","-apple-system"] },
      colors: {
        brand: {
          50:"#eef2ff",
          100:"#e0e7ff",
          500:"#3b82f6",
          600:"#2563eb",
          900:"#0f172a",
        },
      },
      boxShadow: {
        card: "0 4px 24px rgba(2,6,23,0.06)",
      },
      borderRadius: { xl2: "1.25rem" }
    },
  },
  plugins: [],
}