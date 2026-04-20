/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
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
        'hx': {
          bg: {
            primary: '#050815',
            section: '#0A0F2E',
            card: '#0D1233',
          },
          accent: {
            cyan: '#00D4FF',
            purple: '#8B2FFF',
            magenta: '#E040FB',
          },
          text: {
            muted: '#8892B0',
          },
          border: {
            subtle: 'rgba(0, 212, 255, 0.15)',
            active: 'rgba(0, 212, 255, 0.5)',
          },
          success: '#00E676',
          warning: '#FFD600',
          error: '#FF1744',
        },
      },
      fontFamily: {
        display: ['"Poppins"', 'sans-serif'],
        heading: ['"Poppins"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
        'card': '12px',
        'card-lg': '16px',
        'button': '8px',
        'panel': '16px',
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        'cyan-glow': '0 0 20px rgba(0, 212, 255, 0.3), 0 0 60px rgba(0, 212, 255, 0.1)',
        'purple-glow': '0 0 20px rgba(139, 47, 255, 0.3)',
        'card-hover': '0 4px 24px rgba(0, 212, 255, 0.15)',
        'button-glow': '0 0 15px rgba(0, 212, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
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
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "neon-pulse": {
          "0%, 100%": { borderColor: "rgba(0, 212, 255, 0.3)", boxShadow: "0 0 10px rgba(0, 212, 255, 0.1)" },
          "50%": { borderColor: "rgba(0, 212, 255, 0.6)", boxShadow: "0 0 20px rgba(0, 212, 255, 0.3)" },
        },
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "progress-shimmer": {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-4px)" },
          "40%": { transform: "translateX(4px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "drift": {
          "0%": { transform: "translate(0, 0)" },
          "100%": { transform: "translate(var(--drift-x, 30px), var(--drift-y, -20px))" },
        },
        "twinkle": {
          "0%, 100%": { opacity: "var(--star-opacity, 0.6)" },
          "50%": { opacity: "0.2" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "neon-pulse": "neon-pulse 2s ease-in-out infinite",
        "shimmer": "shimmer 1.5s ease-in-out infinite",
        "progress-shimmer": "progress-shimmer 1.5s ease-in-out infinite",
        "shake": "shake 0.4s ease-in-out",
        "float": "float 3s ease-in-out infinite",
        "spin-slow": "spin-slow 8s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
