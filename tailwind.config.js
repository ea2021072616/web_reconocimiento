/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#0F172A",
        "secondary": "#C96442",
        "background": "#F8FAFC",
        "surface": "#FFFFFF",
        "surface-container": "#F8FAFC",
        "on-surface": "#1E293B",
        "on-surface-variant": "#475569",
        "outline-variant": "#E2E8F0",
        "on-primary": "#FFFFFF",
        "on-secondary": "#FFFFFF",
        "primary-fixed": "#E2E8F0",
        "on-primary-fixed": "#0F172A",
        "tertiary-fixed": "#85f8c4",
        "on-tertiary-fixed": "#002114",
        "tertiary-fixed-dim": "#68dba9",
        "success-accent": "#059669",
        "error-accent": "#DC2626"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "full": "9999px"
      },
      spacing: {
        "margin-desktop": "48px",
        "gutter": "24px",
        "container-max": "1280px",
        "margin-mobile": "16px",
        "base": "8px"
      },
      fontFamily: {
        "headline-lg": ["Montserrat", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "headline-xl": ["Montserrat", "sans-serif"],
        "headline-md": ["Montserrat", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "headline-lg-mobile": ["Montserrat", "sans-serif"],
        "body-md": ["Inter", "sans-serif"]
      },
      fontSize: {
        "headline-xl": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "700" }],
        "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
        "body-sm": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
        "label-md": ["14px", { "lineHeight": "20px", "letterSpacing": "0.05em", "fontWeight": "600" }],
        "headline-lg-mobile": ["28px", { "lineHeight": "34px", "fontWeight": "700" }]
      }
    }
  },
  plugins: [],
}
