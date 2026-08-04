import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        state: {
          inbox: "#6b7280",
          active: "#16a34a",
          waiting: "#d97706",
          dormant: "#7c3aed",
          closed: "#374151",
        },
        entity: {
          signal: "#3b82f6",
          intent: "#8b5cf6",
          exploration: "#f59e0b",
          experiment: "#ef4444",
          candidate: "#06b6d4",
          project: "#16a34a",
        },
      },
    },
  },
  plugins: [],
};

export default config;
