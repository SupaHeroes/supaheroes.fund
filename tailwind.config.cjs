const config = {
  mode: "jit",
  purge: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      fontFamily: {
        athelas: ['Athelas'],
        inter: ['Inter'],
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
          DEFAULT: "#269BA8",
          dark: "#79D38A",
        },
      },
    },
  },
  plugins: [],
};

module.exports = config;
