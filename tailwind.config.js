/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        xs: "350px",
      },
      colors: {
        primaryColor: "#573CFA",
        yellowColor: "#FB8D1A",
        blackColor: "#1C1A27",
        primary: "var(--primary-color)",
        secondary: "var(--secondary-color)",
        tertiary: "var(--tertiary-color)",
        textColor: "var(--text-color)",
        filledBg: "var(--filled-color)",
        bgColor: "var(--bg-color)",
        mainBg: "var(--main-bg)",
      },

      fontFamily: {
        primary: "var(--primary-font)",
        secondary: "var(--secondary-font)",
      },
    },
  },
};
