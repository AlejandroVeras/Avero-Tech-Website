import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'
import { SITE_URL } from '@/lib/site'


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Avero Technology: webs, SEO e IA en Santo Domingo',
    template: '%s | Avero Technology',
  },
  description:
    'Diseñamos páginas y portales web, hacemos SEO y creamos chatbots con IA para negocios en RD. También vendemos equipos y damos soporte técnico.',
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
