import React, { useEffect, useRef } from 'react'
import Icon from './Icon'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  maxWidth?: string
  className?: string
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = '600px',
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement
      const previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      
      // Focus trap logic
      const focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'
      
      const trapFocus = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (!modalRef.current) return

          const focusableElements = modalRef.current.querySelectorAll(focusableElementsString)
          const firstElement = focusableElements[0] as HTMLElement
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus()
              e.preventDefault()
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus()
              e.preventDefault()
            }
          }
        }
        
        if (e.key === 'Escape') {
          onClose()
        }
      }

      document.addEventListener('keydown', trapFocus)
      
      // Initial focus
      setTimeout(() => {
        if (modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(focusableElementsString)
          if (focusableElements.length > 0) {
            (focusableElements[0] as HTMLElement).focus()
          } else {
            modalRef.current.focus()
          }
        }
      }, 50)

      return () => {
        document.body.style.overflow = previousOverflow
        document.removeEventListener('keydown', trapFocus)
        // Return focus
        if (previousActiveElement.current) {
          previousActiveElement.current.focus()
        }
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" role="presentation" onMouseDown={onClose}>
      <section
        ref={modalRef}
        className={`modal-content ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ maxWidth }}
        onMouseDown={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <header className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="关闭"
          >
            <Icon name="x" size={20} />
          </button>
        </header>

        <div className="modal-body">
          {children}
        </div>

        {footer && <footer className="modal-footer">{footer}</footer>}
      </section>
    </div>
  )
}

export default Modal
