import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-noto)", "Hiragino Sans", "Meiryo", "sans-serif"],
        maru: ["var(--font-maru)", "var(--font-noto)", "sans-serif"],
        oswald: ["var(--font-oswald)", "var(--font-noto)", "sans-serif"],
        mono: ["var(--font-mono)", "var(--font-noto)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
