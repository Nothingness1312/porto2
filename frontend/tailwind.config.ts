/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // All colors are RGB-triplet CSS variables so light/night theming
        // works by swapping :root vs [data-theme="night"] in global.css.
        // Tailwind maps <alpha-value> for /opacity modifiers on these.
        paper: {
          DEFAULT: "rgb(var(--paper) / <alpha-value>)",
          bright: "rgb(var(--paper-bright) / <alpha-value>)",
          dark: "rgb(var(--paper-dark) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          soft: "rgb(var(--ink-soft) / <alpha-value>)",
          faint: "rgb(var(--ink-faint) / <alpha-value>)",
        },
        volt: {
          DEFAULT: "rgb(var(--volt) / <alpha-value>)",
          bright: "rgb(var(--volt-bright) / <alpha-value>)",
          cyan: "rgb(var(--volt-cyan) / <alpha-value>)",
        },
        blaze: {
          DEFAULT: "rgb(var(--blaze) / <alpha-value>)",
          bright: "rgb(var(--blaze-bright) / <alpha-value>)",
        },
        citron: {
          DEFAULT: "rgb(var(--citron) / <alpha-value>)",
          bright: "rgb(var(--citron-bright) / <alpha-value>)",
        },
        night: {
          DEFAULT: "rgb(var(--night) / <alpha-value>)",
          panel: "rgb(var(--night-panel) / <alpha-value>)",
          line: "rgb(var(--night-line) / <alpha-value>)",
        },
        snow: "rgb(var(--snow) / <alpha-value>)",
        alert: {
          DEFAULT: "rgb(var(--alert) / <alpha-value>)",
        },
        ok: {
          DEFAULT: "rgb(var(--ok) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ['"Clash Display"', '"Sora"', 'system-ui', 'sans-serif'],
        body: ['"Sora"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        hard: "4px 4px 0px 0px var(--shadow-hard)",
        "hard-sm": "2px 2px 0px 0px var(--shadow-hard)",
        "hard-volt": "4px 4px 0px 0px var(--shadow-volt)",
        "hard-blaze": "4px 4px 0px 0px var(--shadow-blaze)",
        "hard-citron": "4px 4px 0px 0px var(--shadow-citron)",
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        blink: "blink 1s step-end infinite",
        "spin-slow": "spin 6s linear infinite",
        scan: "scan 2s ease-in-out infinite",
        "float-slow": "floatSlow 6s ease-in-out infinite",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        scan: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
    },
  },
  plugins: [],
};