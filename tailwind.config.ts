import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        blue: "#1B405D",
        blue100: "#122d42",
        blue200: "#0D6EFD",
        green100: "#B8D047",
        green200: "#198754",
        white: "#FFFFFF",
        grey: "#D9D9D9",
        red: "#DC3545",
        red700: "#b52b39",
        yellow: "#FFC107"
      },
    },
  },
  plugins: [],
} satisfies Config;
