import type { Config } from 'tailwindcss'
import sharedConfig from '@repo/ui/tailwind.config'

// Theme, colors, fonts, and plugins are centralized in @repo/ui.
// See packages/ui/tailwind.config.ts for all theme customization.
const config: Config = {
  presets: [sharedConfig],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
}

export default config
