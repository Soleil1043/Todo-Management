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
    <div className="modal-overlay" role="presentation" onMouseDown={onClose}>
      <section
        className="modal-content"
        style={{ maxWidth: 480 }}
        role="dialog"
        aria-modal="true"
        aria-label="外观设置"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2 className="modal-title">外观设置</h2>
          <button
            ref={closeButtonRef}
            className="btn-close"
            onClick={onClose}
            aria-label="关闭设置"
            type="button"
          >
            <Icon name="x" size={20} />
          </button>
        </header>

        <div className="modal-body">
          <div className="settings-group">
            <h3 className="settings-title">
              <Icon name="sun" size={16} />
              主题模式
            </h3>
            <div className="theme-toggle">
              <button
                type="button"
                className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => onThemeChange('light')}
              >
                <Icon name="sun" size={18} />
                浅色
              </button>
              <button
                type="button"
                className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => onThemeChange('dark')}
              >
                <Icon name="moon" size={18} />
                深色
              </button>
            </div>
          </div>

          <div className="settings-group">
            <h3 className="settings-title">
              <Icon name="image" size={16} />
              背景壁纸
            </h3>
            
            <div className="wallpaper-preview" style={{ 
              backgroundImage: bgImage ? `url(${bgImage})` : 'none',
              backgroundColor: 'var(--color-bg)'
            }}>
              {!bgImage && <span className="no-wallpaper-text">无壁纸</span>}
            </div>

            <div className="wallpaper-actions">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
                aria-label="上传壁纸"
              />
              <button
                type="button"
                className="btn-save"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? '上传中...' : '上传壁纸'}
              </button>
              {bgImage && (
                <button
                  type="button"
                  className="btn-delete"
                  onClick={handleClearBg}
                  title="清除壁纸"
                >
                  <Icon name="trash" size={18} />
                </button>
              )}
            </div>
            <p className="settings-hint">支持 JPG, PNG, WebP 格式，最大 50MB</p>
          </div>

          <div className="settings-group">
            <h3 className="settings-title">
              <Icon name="settings" size={16} />
              界面效果
            </h3>
            
            <div className="range-control">
              <label htmlFor="bg-opacity">内容透明度: {Math.round(bgOpacity * 100)}%</label>
              <input
                id="bg-opacity"
                type="range"
                min="0.5"
                max="1"
                step="0.05"
                value={bgOpacity}
                onChange={(e) => onBgOpacityChange(parseFloat(e.target.value))}
              />
            </div>

            <div className="range-control">
              <label htmlFor="bg-blur">背景模糊: {bgBlur}%</label>
              <input
                id="bg-blur"
                type="range"
                min="0"
                max="100"
                step="10"
                value={bgBlur}
                onChange={(e) => onBgBlurChange(parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AppearanceSettings
