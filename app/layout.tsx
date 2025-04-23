import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fifa Career Manager',
  description: 'Created by ImaaValenzuela'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
