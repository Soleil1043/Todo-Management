import { ReactElement, ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { LoadingProvider } from '../contexts/LoadingContext'
import { ToastProvider } from '../components/Toast'

interface AllTheProvidersProps {
  children: ReactNode
}

export const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return (
    <LoadingProvider>
      <ToastProvider>
        {children}
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