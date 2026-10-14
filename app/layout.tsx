import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'
import { SITE_URL } from '@/lib/site'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Avero Technology — Equipos, sistemas y soporte IT',
    template: '%s · Avero Technology',
  },
  description:
    'Equipos tecnológicos, sistemas para pequeños negocios (inventario, citas y condominios) y soporte IT en Santo Domingo, República Dominicana.',
  openGraph: {
    type: 'website',
    locale: 'es_DO',
    siteName: 'Avero Technology',
    images: ['/LOGO.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`font-sans antialiased min-h-screen bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
