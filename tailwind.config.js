// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b0f14",
        card: "rgba(255,255,255,0.06)",
        muted: "#9fb0c8",
        text: "#25b309",
        brand1: "#20aa4b",
        brand2: "#7cffc1",
        brand3: "#48cb76",
        brand: {
          primary: "#0098C9",
          success: "#0D8B54",
          warning: "#DFDA0C",
          error: "#C90000",
        },
      },
      borderRadius: {
        radius: "20px",
      },
    },
  },
  plugins: [],
};
