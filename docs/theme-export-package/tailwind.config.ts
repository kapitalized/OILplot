import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: [
          "var(--font-display)",
          "var(--font-sans)",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        ring: "hsl(var(--ring))",
        oilplot: {
          ink: "#3E322D",
          cream: "#F2EBD4",
          pale: "#A5C2D0",
          yellow: "#F8C43F",
          amber: "#F2A83A",
          burnt: "#F27D3B",
          coral: "#F14A42",
        },
      },
      boxShadow: {
        retro: "8px 8px 0 0 #3E322D",
        "retro-sm": "4px 4px 0 0 #3E322D",
      },
    },
  },
  plugins: [],
};

export default config;
