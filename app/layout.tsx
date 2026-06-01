import type { Metadata } from 'next'
import '@tabler/icons-webfont/dist/tabler-icons.min.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'Discomon — Portfolio de Soluciones IoT para Municipios',
  description: 'Tecnología con impacto medioambiental para ayuntamientos inteligentes.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
