import { Inter, Space_Grotesk } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import './globals.css'
import QueryProvider from '@/lib/providers/QueryProvider'
import ServiceWorkerRegistration from '@/components/layout/ServiceWorkerRegistration'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  weight: ['400', '500', '600', '700'],
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  weight: ['600', '700'],
})

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://unfoldd.me'),
  title: {
    default: 'Unfoldd — Unfold Your Career',
    template: '%s | Unfoldd'
  },
  description: 'AI-powered career platform for engineering students. Unfold your potential through personalized roadmaps, verified skills, and smart internship matching.',
  keywords: [
    'student career platform',
    'BTech internship',
    'skill verification',
    'coding roadmap',
    'engineering student',
    'AI learning',
    'Unfoldd',
    'internship matching India'
  ],
  authors: [{ name: 'Unfoldd' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://unfoldd.me',
    siteName: 'Unfoldd',
    title: 'Unfoldd — Unfold Your Career',
    description: 'AI-powered career platform for engineering students.',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Unfoldd Platform'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Unfoldd',
    description: 'AI-powered career platform for students',
    images: ['/og-image.png'],
    creator: '@unfoldd_me'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-16.png', sizes: '16x16' },
      { url: '/icon-32.png', sizes: '32x32' },
    ],
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json'
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable}`}
    >
      <head>
        <link rel="dns-prefetch" href="//img.youtube.com" />
        <link rel="dns-prefetch" href="//www.youtube.com" />
        <link rel="preconnect" href="https://img.youtube.com" />
      </head>
      <body
        className="bg-[#0A0A0F] text-white antialiased"
        style={{ fontFamily: 'var(--font-inter)' }}
      >
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
            <Toaster
              position="bottom-right"
              duration={3000}
              toastOptions={{
                style: {
                  background: '#12121A',
                  color: '#fff',
                  border: '1px solid rgba(108,99,255,0.2)',
                  fontSize: '14px',
                },
              }}
            />
            <ServiceWorkerRegistration />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}