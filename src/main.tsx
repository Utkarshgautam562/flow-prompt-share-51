
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'
import { Toaster } from 'sonner'
import { reportWebVitals, monitorLongTasks } from './utils/performance'

// Create a client with improved caching settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false, // Disable automatic refetching when window regains focus
      retry: 1, // Only retry failed queries once
    },
  },
})

// Use createRoot for React 18 concurrent features
const container = document.getElementById('root')
if (!container) throw new Error('Failed to find the root element')
const root = createRoot(container)

// Monitor long tasks
monitorLongTasks()

// Render app with StrictMode disabled in production for better performance
if (process.env.NODE_ENV === 'production') {
  root.render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" />
      </BrowserRouter>
    </QueryClientProvider>
  )
} else {
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <Toaster position="top-right" />
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  )
}

// Report web vitals
reportWebVitals(console.log)
