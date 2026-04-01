import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light Theme
        background: "#ffffff",
        foreground: "#0f172a",
        
        // Glass surfaces
        glass: {
          DEFAULT: "rgba(0, 0, 0, 0.03)",
          hover: "rgba(0, 0, 0, 0.06)",
          border: "rgba(0, 0, 0, 0.08)",
          muted: "rgba(0, 0, 0, 0.55)",
        },
        
        // Brand colors
        brand: {
          DEFAULT: "#2563eb", // Facebook-like Blue
          glow: "#3b82f6",
          muted: "rgba(37, 99, 235, 0.2)",
        },
        
        // Trust Level Colors
        trust: {
          newcomer: "#64748B",    // Slate
          verified: "#22C55E",    // Green
          trusted: "#3B82F6",     // Blue
          elite: "#F59E0B",       // Amber/Gold
        },
        
        // Match Score Gradient
        match: {
          low: "#EF4444",      // Red < 40%
          medium: "#F59E0B",   // Amber 40-70%
          high: "#22C55E",     // Green > 70%
        },
        
        // Data Tiers
        tier: {
          public: "#22C55E",
          protected: "#F59E0B",
          confidential: "#EF4444",
        },
        
        // Accents
        accent: {
          cyan: "#22D3EE",
          pink: "#EC4899",
          indigo: "#6366F1",
        },
        
        // Semantic
        muted: {
          DEFAULT: "#27272A",
          foreground: "#A1A1AA",
        },
        card: {
          DEFAULT: "rgba(0, 0, 0, 0.02)",
          hover: "rgba(0, 0, 0, 0.05)",
        },
        border: "rgba(0, 0, 0, 0.08)",
      },
      
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Cal Sans", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      
      fontSize: {
        "display-lg": ["4.5rem", { lineHeight: "1", letterSpacing: "-0.02em" }],
        "display": ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-sm": ["2.5rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
      },
      
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      
      boxShadow: {
        "glow": "0 0 20px rgba(139, 92, 246, 0.3)",
        "glow-lg": "0 0 40px rgba(139, 92, 246, 0.4)",
        "inner-glow": "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
        "card": "0 4px 24px -2px rgba(0, 0, 0, 0.5)",
      },
      
      backgroundImage: {
        // Aura/Aurora gradients
        "aura-1": "radial-gradient(ellipse at 20% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)",
        "aura-2": "radial-gradient(ellipse at 80% 70%, rgba(34, 211, 238, 0.1) 0%, transparent 50%)",
        "aura-3": "radial-gradient(ellipse at 50% 50%, rgba(236, 72, 153, 0.08) 0%, transparent 50%)",
        
        // Glass gradient
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
        
        // Border gradient
        "border-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%)",
        
        // Match score gradient
        "match-gradient": "linear-gradient(135deg, #22C55E 0%, #3B82F6 50%, #8B5CF6 100%)",
      },
      
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s ease-in-out infinite",
        "border-glow": "borderGlow 3s ease-in-out infinite",
      },
      
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(139, 92, 246, 0.5)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        borderGlow: {
          "0%, 100%": { borderColor: "rgba(139, 92, 246, 0.3)" },
          "50%": { borderColor: "rgba(139, 92, 246, 0.6)" },
        },
      },
      
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
