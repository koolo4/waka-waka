import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // New Cosmic Palette
        background: "#0F172A",
        foreground: "#F1F5F9",
        
        // Primary: Indigo
        primary: {
          50: "#F0F4FF",
          100: "#E0E7FF",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          900: "#312E81",
          DEFAULT: "#6366F1",
          foreground: "#FFFFFF",
        },
        
        // Secondary: Purple
        secondary: {
          300: "#D8B4FE",
          400: "#C084FC",
          500: "#A78BFA",
          600: "#9333EA",
          700: "#7E22CE",
          DEFAULT: "#A78BFA",
          foreground: "#FFFFFF",
        },
        
        // Accent: Cyan & Emerald
        accent: {
          400: "#22D3EE",
          500: "#06B6D4",
          600: "#0891B2",
          DEFAULT: "#06B6D4",
          foreground: "#0F172A",
        },
        
        emerald: {
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
        },
        
        // Glassmorphism cards
        glass: "rgba(15, 23, 42, 0.7)",
        
        // Semantic colors
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        info: "#3B82F6",
        
        // Neutral tones
        slate: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#020617",
        },
      },
      
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "12px",
        lg: "16px",
        xl: "24px",
      },
      
      backgroundImage: {
        "gradient-cosmic": "linear-gradient(135deg, #6366F1 0%, #A78BFA 50%, #06B6D4 100%)",
        "gradient-subtle": "linear-gradient(180deg, rgba(99, 102, 241, 0.05) 0%, rgba(167, 139, 250, 0.05) 100%)",
        "gradient-glow": "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
      },
      
      boxShadow: {
        "glow-sm": "0 0 8px rgba(99, 102, 241, 0.3)",
        "glow-md": "0 0 16px rgba(99, 102, 241, 0.4)",
        "glow-lg": "0 0 24px rgba(99, 102, 241, 0.5)",
        "glow-cyan": "0 0 20px rgba(6, 182, 212, 0.3)",
        "glass": "0 8px 32px rgba(31, 41, 55, 0.1)",
      },
      
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite",
      },
      
      scale: {
        75: ".75",
        90: ".9",
        95: ".95",
        100: "1",
        105: "1.05",
        110: "1.1",
        115: "1.15",
        120: "1.2",
        125: "1.25",
        130: "1.3",
      },
      
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 8px rgba(99, 102, 241, 0.3)" },
          "50%": { opacity: "0.8", boxShadow: "0 0 24px rgba(99, 102, 241, 0.6)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "2rem",
          lg: "4rem",
          xl: "5rem",
          "2xl": "6rem",
        },
        screens: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
          "2xl": "1536px",
        },
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
