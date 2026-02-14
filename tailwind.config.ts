import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
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
        // primary: {
        //   DEFAULT: "hsl(var(--primary))",
        //   foreground: "hsl(var(--primary-foreground))",
        // },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        // Neon lie-detector palette
        neonGreen: "#10B981",
        neonPink: "#FF007A",
        neonBlue: "#00E0FF",
        deepBlack: "#050505",
        terminalGray: "#1A1A1A",
        // Truth Navigator style palette
        emerald: {
          50: "#ecfdf5",
          // 500: "#10b981", // Conflict with new primary
          600: "#059669",
        },
        softPink: {
          50: "#fff1f2",
          500: "#f43f5e",
        },
        electricBlue: {
          50: "#eff6ff",
          500: "#3b82f6",
        },
        surface: "#f9fafb",
        "primary": "#1173d4",
        "background-light": "#F5F5F3",
        "background-dark": "#101922",
        "paper": "#F5F5F3",
        "ink": "#1a1a1a",
        "verified": "#2D6A4F",
        "disputed": "#C92A2A",
      },
      fontFamily: {
        // Display font for big headings (professional dashboard)
        display: ["'Space Grotesk'", "sans-serif"],
        // Mono font for terminal-style text
        mono: ["'JetBrains Mono'", "monospace"],
        serif: ["'DM Serif Display'", "serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "DEFAULT": "0.25rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "spin-slow": "spin-slow 3s linear infinite",
      },
      boxShadow: {
        "neon-glow":
          "0 0 10px rgba(16, 185, 129, 0.5), 0 0 20px rgba(16, 185, 129, 0.2)",
        "neon-pink": "0 0 10px rgba(255, 0, 122, 0.5)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
