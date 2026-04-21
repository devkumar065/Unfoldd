'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function QueryProvider({ children }) {
  const [queryClient] = useState(() => 
    new QueryClient({
      defaultOptions: {
        queries: {
          // Cache for 5 minutes
          staleTime: 5 * 60 * 1000,
          // Keep in cache for 10 minutes
          gcTime: 10 * 60 * 1000,
          // Don't refetch on window focus
          refetchOnWindowFocus: false,
          // Retry once on failure
          retry: 1,
          // Don't refetch on reconnect
          refetchOnReconnect: false,
        },
      },
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
