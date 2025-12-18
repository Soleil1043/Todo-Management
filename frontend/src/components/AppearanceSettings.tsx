import React, { useRef, useEffect, useState } from 'react'
import Icon from './Icon'
import { settingsApi } from '../services/api'

interface AppearanceSettingsProps {
  isOpen: boolean
  onClose: () => void
  theme: 'light' | 'dark'
  onThemeChange: (theme: 'light' | 'dark') => void
  bgImage: string | null
  onBgImageChange: () => void
  bgOpacity: number
  onBgOpacityChange: (opacity: number) => void
  bgBlur: number
  onBgBlurChange: (blur: number) => void
}

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  bgImage,
  onBgImageChange,
  bgOpacity,
  onBgOpacityChange,
  bgBlur,
  onBgBlurChange,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isUploading, setIsUploading] = useState(false)

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (!file) return

    if (file.size > 50 * 1024 * 1024) {
      alert('文件大小不能超过 50MB')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    try {
      setIsUploading(true)
      await settingsApi.uploadWallpaper(file)
      onBgImageChange()
    } catch (error) {
      alert('上传壁纸失败，请重试')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleClearBg = async () => {
    try {
      await settingsApi.deleteWallpaper()
      onBgImageChange()
    } catch (error) {
      alert('清除壁纸失败，请重试')
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal modal--sm"
        role="dialog"
        aria-modal="true"
        aria-label="外观设置"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2>外观设置</h2>
          <button
            ref={closeButtonRef}
            className="btn-close"
            onClick={onClose}
            aria-label="关闭设置"
            type="button"
          >
            <Icon name="x" />
          </button>
        </header>

        <div className="modal-body">
          <div className="settings-group">
            <h3>主题模式</h3>
            <div className="theme-toggle">
              <button
                className={`btn-theme ${theme === 'light' ? 'active' : ''}`}
                onClick={() => onThemeChange('light')}
                type="button"
              >
                <Icon name="sun" />
                浅色
              </button>
              <button
                className={`btn-theme ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => onThemeChange('dark')}
                type="button"
              >
                <Icon name="moon" />
                深色
              </button>
            </div>
          </div>

          <div className="settings-group">
            <h3>背景图片</h3>
            <div className="bg-upload">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
                id="bg-upload"
                style={{ display: 'none' }}
              />
              <label htmlFor="bg-upload" className={`btn-upload ${isUploading ? 'disabled' : ''}`}>
                <Icon name="image" />
                {isUploading ? '上传中...' : '选择图片...'}
              </label>
              {bgImage && !isUploading && (
                <button
                  className="btn-clear-bg"
                  onClick={handleClearBg}
                  type="button"
                >
                  清除背景
                </button>
              )}
            </div>
            <p className="help-text">支持从本地文件选择图片作为背景</p>
          </div>

          {bgImage && (
            <div className="settings-group">
              <h3>界面透明度</h3>
              <div className="opacity-control">
                <input
                  type="range"
                  min="0.2"
                  max="1"
                  step="0.05"
                  value={bgOpacity}
                  onChange={(e) => onBgOpacityChange(parseFloat(e.target.value))}
                  className="range-input"
                  aria-label="界面透明度"
                />
                <span>{Math.round(bgOpacity * 100)}%</span>
              </div>
            </div>
          )}

          {bgImage && (
            <div className="settings-group">
              <h3>背景磨砂度</h3>
              <div className="opacity-control">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={bgBlur}
                  onChange={(e) => onBgBlurChange(parseInt(e.target.value))}
                  className="range-input"
                  aria-label="背景磨砂度"
                />
                <span>{bgBlur}%</span>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default AppearanceSettings
