'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Prefetch critical routes on load
export default function Prefetcher() {
  const router = useRouter()

  useEffect(() => {
    // Prefetch these routes immediately
    const routes = [
      '/dashboard',
      '/missions',
      '/skills',
      '/internships',
    ]

    // Stagger prefetching to not block main thread
    routes.forEach((route, i) => {
      setTimeout(() => {
        router.prefetch(route)
      }, i * 200)
    })
  }, [router])

  return null // No UI
}
