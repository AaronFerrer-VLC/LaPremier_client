import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/design-system.css'
import './styles/responsive.css'
import App from './App.jsx'
import { BrowserRouter as Router } from 'react-router-dom'

import { AuthProviderWrapper } from './contexts/auth.context.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.jsx'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './config/queryClient'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <ThemeProvider>
            <AuthProviderWrapper>
              <Router
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <App />
              </Router>
            </AuthProviderWrapper>
          </ThemeProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
