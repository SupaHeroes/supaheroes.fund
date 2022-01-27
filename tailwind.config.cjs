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
          DEFAULT: "#0D1016",
          dark: "#0D1016",
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
