import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#F4FF5C", // Brighter yellow for better visibility
        primaryDark: "#514DE0",
        accentBlue: "#0D6DFD",
        accentOrange: "#F16319",
        accentPeach: "#FF9960",
        surface: "#151518",
        surfaceAlt: "#072032",
        page: "#151518",
        card: "#1A1A1E",
        textMuted: "#CDCDCD",
        textSecondary: "#5C6972",
        border: "#2A2A2A",
        neutralLight: "#F2F2F2",
      },
    },
  },
  plugins: [],
};

export default config;
