import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        brand: {
          red: "#FF3028",
          dark: "#09090b",
          card: "#111113",
          gray: "#a1a1aa",
        },
        primary: {
          DEFAULT: "#FF3028",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#18181b",
          foreground: "#a1a1aa",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#27272a",
          foreground: "#a1a1aa",
        },
        popover: {
          DEFAULT: "#09090b",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "#111113",
          foreground: "#ffffff",
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': 'linear-gradient(to bottom, rgba(9,9,11,0.4), rgba(9,9,11,1)), url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop")',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;