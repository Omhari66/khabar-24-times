import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#CC0000",
          dark: "#9E0000",
          light: "#FFDAD4",
        },
        secondary: {
          DEFAULT: "#1A237E",
          dark: "#000767",
          light: "#E0E0FF",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F5F5F5",
          border: "#E0E0E0",
        },
        text: {
          primary: "#212121",
          secondary: "#616161",
        }
      },
      fontFamily: {
        serif: ["var(--font-serif)"],
        sans: ["var(--font-sans)"],
        condensed: ["var(--font-condensed)"],
      },
      gridTemplateColumns: {
        '12': 'repeat(12, minmax(0, 1fr))',
      }
    },
  },
  plugins: [],
};
export default config;
