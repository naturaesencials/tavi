import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        pino: 'var(--pino)',
        'pino-claro': 'var(--pino-claro)',
        hueso: 'var(--hueso)',
        'hueso-hondo': 'var(--hueso-hondo)',
        ocre: 'var(--ocre)',
        rosa: 'var(--rosa)',
        tinta: 'var(--tinta)',
        mandarina: 'var(--mandarina)',
        turquesa: 'var(--turquesa)',
        mostaza: 'var(--mostaza)',
        frambuesa: 'var(--frambuesa)',
        hoja: 'var(--hoja)',
        cielo: 'var(--cielo)',
      },
      fontFamily: {
        display: ['var(--fuente-display)', 'Georgia', 'serif'],
        cuerpo: ['var(--fuente-cuerpo)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
