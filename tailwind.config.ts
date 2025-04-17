module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      colors: {
        bg: "#0e0e0e",
        neon: "#00ff99",
        highlight: "#39ff14",
        faded: "#e6e6e6",
        heat: "#ff4c4c",
      },
    },
  },
  plugins: [],
}
