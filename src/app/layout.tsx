import type { Metadata } from 'next'
import { Fraunces, Karla } from 'next/font/google'
import './globals.css'

const display = Fraunces({
  subsets: ['latin'],
  axes: ['SOFT', 'opsz'],
  variable: '--fuente-display',
  display: 'swap',
})

const cuerpo = Karla({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--fuente-cuerpo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Álbum de Tavi',
  description: 'Álbum privado de fotos.',
  robots: { index: false, follow: false },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${display.variable} ${cuerpo.variable}`}>
      <body className="font-cuerpo antialiased">{children}</body>
    </html>
  )
}
