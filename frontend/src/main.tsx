import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ToastProvider } from './components/Toast'
import { LoadingProvider } from './contexts/LoadingContext'
import ErrorBoundary from './components/ErrorBoundary'
import { initSentry } from './config/sentry'

// 初始化 Sentry
initSentry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <LoadingProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </LoadingProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)