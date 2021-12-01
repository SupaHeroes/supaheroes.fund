const config = {
  mode: "jit",
  purge: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      fontFamily: {
        noto: ['Noto Serif Display'],
        commorant: ['Cormorant SC']
      },
      colors: {
        supadark: {
          light: "#303030",
          DEFAULT: "#1F1F1F",
          dark: "#1B1C1E",
        },
        supagreen: {
          light: "#DEFFEE",
          DEFAULT: "#67E9F1",
          dark: "#24E795",
        },
      },
    },
  },
  plugins: [],
};

module.exports = config;
