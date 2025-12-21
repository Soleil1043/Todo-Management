import { ReactElement, ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { LoadingProvider } from '../contexts/LoadingContext'
import { SettingsProvider } from '../contexts/SettingsContext'
import { TodoProvider } from '../contexts/TodoContext'
import { ToastProvider } from '../components/Toast'

interface AllTheProvidersProps {
  children: ReactNode
}

export const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return (
    <LoadingProvider>
      <ToastProvider>
        <SettingsProvider>
          <TodoProvider>
            {children}
          </TodoProvider>
        </SettingsProvider>
      </ToastProvider>
    </LoadingProvider>
  )
}

export const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }