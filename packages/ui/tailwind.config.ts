import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  // Content paths must be defined in each app's tailwind.config.ts.
  // Preset paths resolve relative to the consuming app, not this file, so this
  // stays empty on purpose and each app provides its own content globs.
  content: [],
  theme: {
    extend: {
      colors: {
        // Brand colors — the two signature pinks of The Pink Binder
        brand: {
          pink: 'hsl(335, 77%, 73%)',
          'light-pink': 'hsl(335, 77%, 88%)',
        },
        // ShadCN-compatible CSS variable tokens
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        body: [
          'Avenir Next',
          'Nunito',
          'Segoe UI',
          'Helvetica Neue',
          'Trebuchet MS',
          'Arial Rounded MT',
          'Arial',
          'sans-serif',
        ],
        title: [
          'Avenir Next',
          'Trebuchet MS',
          'Segoe UI',
          'Arial Rounded MT',
          'Gill Sans',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [animate],
}

export default config
