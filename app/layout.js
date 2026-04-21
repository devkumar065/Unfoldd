import { Inter, Space_Grotesk } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { PageTransition } from '@/components/layout/PageTransition'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap'
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

import { MobileNav } from '@/components/layout/MobileNav'



export default function RootLayout({ children }) {

  return (

    <html 

      lang="en" 

      suppressHydrationWarning

      className={`${inter.variable} ${spaceGrotesk.variable}`}

    >

      <body className={`${inter.className} bg-[#0A0A0F] text-white antialiased`}>

        <ThemeProvider

          attribute="class"

          defaultTheme="dark"

          enableSystem={false}

        >

          <PageTransition>

            {children}

          </PageTransition>

          <MobileNav />

          <Toaster 

            position="bottom-right"

            toastOptions={{

              style: {

                background: '#12121A',

                color: '#fff',

                border: '1px solid rgba(108,99,255,0.2)'

              }

            }}

          />

        </ThemeProvider>

      </body>

    </html>

  )

}
