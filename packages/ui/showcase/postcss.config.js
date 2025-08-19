module.exports = {
  plugins: {
    'tailwindcss': {},
    'autoprefixer': {},
    'postcss-preset-env': {
      stage: 3,
      features: {
        'nesting-rules': true,
        'custom-properties': true,
        'custom-media-queries': true,
      },
    },
  },
}
