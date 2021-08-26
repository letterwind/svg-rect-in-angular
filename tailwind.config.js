module.exports = {
  purge: {
    enable: true,
    content: [
      "./src/**/*.html",
      "./src/**/*.scss"
    ]
  },
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
