import { useEffect, useRef } from 'react'
import Icon from './Icon'

type StyleGuideProps = {
  isOpen: boolean
  onClose: () => void
}

export default function StyleGuide({ isOpen, onClose }: StyleGuideProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!isOpen) return
    closeButtonRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="设计系统与样式指南"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2>设计系统</h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="关闭设计系统"
          >
            <Icon name="x" />
          </button>
        </header>

        <div className="modal-body">
          <div className="guide-grid">
            <section className="guide-card">
              <h3 className="guide-title">配色</h3>
              <div className="swatch-row" aria-label="配色示例">
                <div className="swatch swatch--neutral">
                  <span>Neutral</span>
                </div>
                <div className="swatch swatch--primary">
                  <span>Primary</span>
                </div>
                <div className="swatch swatch--danger">
                  <span>Danger</span>
                </div>
              </div>
            </section>

            <section className="guide-card">
              <h3 className="guide-title">排版</h3>
              <p className="guide-text">
                使用系统无衬线字体栈，默认字号 14–16px，标题加强字重与字距以提升层次。
              </p>
              <div className="guide-type">
                <div className="guide-type-title">标题 / Title</div>
                <div className="guide-type-body">正文 / Body</div>
                <div className="guide-type-meta">辅助信息 / Meta</div>
              </div>
            </section>

            <section className="guide-card">
              <h3 className="guide-title">间距与圆角</h3>
              <p className="guide-text">
                以 4px 为基准的间距刻度，组件最小可点击高度 40–44px，圆角使用 12–20px。
              </p>
              <div className="guide-pills">
                <span className="guide-pill">space-2</span>
                <span className="guide-pill">space-4</span>
                <span className="guide-pill">space-6</span>
                <span className="guide-pill">radius-md</span>
                <span className="guide-pill">radius-xl</span>
              </div>
            </section>

            <section className="guide-card">
              <h3 className="guide-title">组件示例</h3>
              <div className="guide-actions">
                <button type="button" className="btn-edit">
                  <Icon name="edit" />
                  主要按钮
                </button>
                <button type="button" className="btn-recycle-bin">
                  次要按钮
                </button>
                <button type="button" className="btn-delete">
                  <Icon name="delete" />
                  危险操作
                </button>
              </div>
              <div className="guide-surface">
                <div className="priority-badge priority-medium">中优先级</div>
                <div className="time-info">开始: 09:00 | 结束: 10:00</div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  )
}
