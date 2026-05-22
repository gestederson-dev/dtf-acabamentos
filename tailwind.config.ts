import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dtf: {
          black: "#232021",
          white: "#FFFFFF",
        },
        gray: {
          50:  "#FAFAFA",
          100: "#F4F4F5",
          200: "#E4E4E7",
          300: "#D4D4D8",
          400: "#A1A1AA",
          500: "#71717A",
          600: "#52525B",
          700: "#3F3F46",
          900: "#232021",
        },
        success:    "#047857",
        "success-bg": "#ECFDF5",
        warning:    "#B45309",
        "warning-bg": "#FFFBEB",
        danger:     "#B91C1C",
        "danger-bg":  "#FEF2F2",
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT:    "var(--card)",
          foreground: "var(--card-foreground)",
        },
        primary: {
          DEFAULT:    "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT:    "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT:    "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        border: "var(--border)",
        input:  "var(--input)",
        ring:   "var(--ring)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.03em",
        tighter:  "-0.025em",
        tight:    "-0.015em",
      },
      borderRadius: {
        sm:      "4px",
        DEFAULT: "6px",
        md:      "8px",
        lg:      "12px",
        xl:      "12px",
        "2xl":   "12px",
        full:    "9999px",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(35 32 33 / 0.04)",
        sm: "0 1px 3px 0 rgb(35 32 33 / 0.06), 0 1px 2px -1px rgb(35 32 33 / 0.06)",
        DEFAULT: "0 4px 6px -1px rgb(35 32 33 / 0.08), 0 2px 4px -2px rgb(35 32 33 / 0.06)",
        md: "0 4px 6px -1px rgb(35 32 33 / 0.08), 0 2px 4px -2px rgb(35 32 33 / 0.06)",
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "1.4", letterSpacing: "0.02em" }],
      },
    },
  },
  plugins: [],
};
export default config;
