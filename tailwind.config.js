module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        gold: {
          50: '#fdf9ee',
          100: '#f9efc8',
          200: '#f2da8d',
          300: '#e9c454',
          400: '#e0ae2a',
          500: '#c99318',
          600: '#a87212',
          700: '#835411',
          800: '#6d4214',
          900: '#5c3714',
        },
        noir: {
          50: '#f6f6f5',
          100: '#e8e7e4',
          200: '#d3d1cb',
          300: '#b4b0a7',
          400: '#8f8a7e',
          500: '#747068',
          600: '#5e5a54',
          700: '#4e4a44',
          800: '#44403c',
          900: '#1a1815',
          950: '#0d0c0a',
        },
        blush: {
          50: '#fdf5f3',
          100: '#fce8e3',
          200: '#fad4cb',
          300: '#f5b5a7',
          400: '#ed8a77',
          500: '#e2654e',
          600: '#ce4b34',
          700: '#ad3b27',
          800: '#903326',
          900: '#783024',
        }
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
