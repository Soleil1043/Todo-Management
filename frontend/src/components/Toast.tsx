import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import Icon from './Icon'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void
  hideToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, type, message, duration }])

    if (duration > 0) {
      setTimeout(() => {
        hideToast(id)
      }, duration)
    }
  }, [])

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <div className="toast-container">
        {useMemo(() => toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type} slide-in`}>
            <div className="toast-icon">
              {toast.type === 'success' && <Icon name="check" size={20} />}
              {toast.type === 'error' && <Icon name="alert-circle" size={20} />}
              {toast.type === 'info' && <Icon name="info" size={20} />}
            </div>
            <div className="toast-content">{toast.message}</div>
            <button
              className="toast-close"
              onClick={() => hideToast(toast.id)}
              aria-label="关闭"
            >
              <Icon name="x" size={16} />
            </button>
          </div>
        )), [toasts, hideToast])}
      </div>
    </ToastContext.Provider>
  )
}
