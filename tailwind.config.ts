import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        background: "var(--color-bg)",
        foreground: "var(--color-text)",
        surface: {
          DEFAULT: "var(--color-surface)",
          2: "var(--color-surface-2)",
          offset: "var(--color-surface-offset)",
          dynamic: "var(--color-surface-dynamic)",
        },
        divider: "var(--color-divider)",
        border: "var(--color-border)",
        text: {
          DEFAULT: "var(--color-text)",
          muted: "var(--color-text-muted)",
          faint: "var(--color-text-faint)",
          inverse: "var(--color-text-inverse)",
        },
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          active: "var(--color-primary-active)",
          highlight: "var(--color-primary-highlight)",
        },
        gold: {
          DEFAULT: "var(--color-gold)",
          hover: "var(--color-gold-hover)",
          highlight: "var(--color-gold-highlight)",
        },
        orange: {
          DEFAULT: "var(--color-orange)",
          hover: "var(--color-orange-hover)",
          highlight: "var(--color-orange-highlight)",
        },
        success: {
          DEFAULT: "var(--color-success)",
          highlight: "var(--color-success-highlight)",
        },
        error: {
          DEFAULT: "var(--color-error)",
          highlight: "var(--color-error-highlight)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "'Clash Display'", "'Helvetica Neue'", "sans-serif"],
        body: ["var(--font-body)", "'Satoshi'", "'Inter'", "sans-serif"],
        mono: ["var(--font-mono)", "'JetBrains Mono'", "'Fira Code'", "monospace"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      transitionTimingFunction: {
        interactive: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
