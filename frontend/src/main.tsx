import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ToastProvider } from './components/Toast'
import { LoadingProvider } from './contexts/LoadingContext'
import { SettingsProvider } from './contexts/SettingsContext'
import { TodoProvider } from './contexts/TodoContext'
import ErrorBoundary from './components/ErrorBoundary'
import { initSentry } from './config/sentry'

// 初始化 Sentry
initSentry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <LoadingProvider>
          <SettingsProvider>
            <TodoProvider>
              <App />
            </TodoProvider>
          </SettingsProvider>
        </LoadingProvider>
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)