import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
        'gaming': ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#6366F1',
        secondary: '#8B5CF6',
        accent: '#10B981',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-subtle': 'bounce 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
export default config