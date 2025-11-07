/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    // Stats bar colors - needed because they're dynamically assigned
    'bg-red-300',
    'bg-red-600',
    'bg-orange-300',
    'bg-orange-600',
    'bg-blue-300',
    'bg-blue-600',
    'bg-purple-300',
    'bg-purple-600',
    'bg-yellow-300',
    'bg-yellow-600',
    'bg-pink-300',
    'bg-pink-600',
  ],
  theme: {
    extend: {
      colors: {
        ring: '#0066ff',
      },
    },
  },
  plugins: [],
};
