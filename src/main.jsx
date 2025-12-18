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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
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
    </ErrorBoundary>
  </StrictMode>,
)
