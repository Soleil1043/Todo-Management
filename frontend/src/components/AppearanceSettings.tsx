import React, { useRef, useState } from 'react'
import Modal from './Modal'
import { useSettingsContext } from '../contexts/SettingsContext'
import { settingsApi } from '../services/api'
import { useToast } from './Toast'
import Icon from './Icon'
import '../styles/AppearanceSettings.css'

interface AppearanceSettingsProps {
  isOpen: boolean
  onClose: () => void
}

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    theme,
    bgImage,
    isBgLoading,
    bgOpacity,
    bgBlur,
    spotlightType,
    autoTrash,
    handleThemeChange,
    handleBgImageChange,
    handleBgOpacityChange,
    handleBgBlurChange,
    handleSpotlightTypeChange,
    handleAutoTrashChange
  } = useSettingsContext()

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { showToast } = useToast()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 50 * 1024 * 1024) {
      showToast('文件大小不能超过 50MB', 'error')
      return
    }

    try {
      setIsUploading(true)
      await settingsApi.uploadWallpaper(file)
      handleBgImageChange(true)
      showToast('壁纸上传成功', 'success')
    } catch (error) {
      showToast('上传壁纸失败，请重试', 'error')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteWallpaper = async () => {
    try {
      await settingsApi.deleteWallpaper()
      handleBgImageChange(false)
      showToast('壁纸已移除', 'success')
    } catch (error) {
      showToast('移除壁纸失败', 'error')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="外观设置"
      maxWidth="500px"
    >
      <div className="settings-container">
        {/* 主题选择 */}
        <section className="settings-group">
          <div className="settings-title">
            <Icon name="sun" size={16} />
            主题模式
          </div>
          <div className="theme-toggle">
            <button
              className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
              onClick={() => handleThemeChange('light')}
            >
              浅色
            </button>
            <button
              className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => handleThemeChange('dark')}
            >
              深色
            </button>
          </div>
        </section>

        {/* 背景图片 */}
        <section className="settings-group">
          <div className="settings-title">
            <Icon name="image" size={16} />
            背景壁纸
          </div>
          <div className="wallpaper-settings">
            <div className={`wallpaper-preview ${isBgLoading || isUploading ? 'loading' : ''}`}>
              {bgImage ? (
                <img src={bgImage} alt="Wallpaper" className="preview-img" />
              ) : (
                <div className="no-wallpaper">
                  <Icon name="image" size={24} />
                  <span>无背景</span>
                </div>
              )}
              {(isBgLoading || isUploading) && <div className="loader"></div>}
            </div>
            <div className="wallpaper-actions">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button 
                className="btn-upload" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isBgLoading || isUploading}
              >
                {isUploading ? '上传中...' : '更换壁纸'}
              </button>
              {bgImage && (
                <button
                  className="btn-delete"
                  onClick={handleDeleteWallpaper}
                  disabled={isBgLoading || isUploading}
                >
                  <Icon name="trash" size={16} />
                </button>
              )}
            </div>
            <p className="settings-hint">支持 jpg, png 格式，最大 50MB</p>
          </div>
        </section>

        {/* 透明度与模糊度 */}
        <section className="settings-group">
          <div className="settings-title">
            卡片透明度
          </div>
          <div className="range-control">
            <input
              type="range"
              className="range-input"
              min="0.1"
              max="1"
              step="0.05"
              value={bgOpacity}
              onChange={(e) => handleBgOpacityChange(parseFloat(e.target.value))}
            />
            <span className="range-value">{(bgOpacity * 100).toFixed(0)}%</span>
          </div>

          <div className="settings-title" style={{ marginTop: 'var(--space-4)' }}>
            背景模糊度
          </div>
          <div className="range-control">
            <input
              type="range"
              className="range-input"
              min="0"
              max="100"
              step="5"
              value={bgBlur}
              onChange={(e) => handleBgBlurChange(parseInt(e.target.value))}
            />
            <span className="range-value">{bgBlur}%</span>
          </div>
        </section>

        {/* 聚光灯效果 */}
        <section className="settings-group">
          <div className="settings-title">
            <Icon name="zap" size={16} />
            聚光灯效果 (四象限)
          </div>
          <div className="spotlight-toggle">
            {(['glow', 'flow', 'focus', 'none'] as const).map(type => (
              <button
                key={type}
                className={`theme-btn ${spotlightType === type ? 'active' : ''}`}
                onClick={() => handleSpotlightTypeChange(type)}
              >
                {type === 'glow' && '柔光'}
                {type === 'flow' && '流动'}
                {type === 'focus' && '聚焦'}
                {type === 'none' && '关闭'}
              </button>
            ))}
          </div>
        </section>

        {/* 自动化 */}
        <section className="settings-group">
          <div className="settings-title">
            <Icon name="settings" size={16} />
            自动化
          </div>
          <div className="setting-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="setting-info">
              <span className="title" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>自动移入回收站</span>
              <p className="desc" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                当勾选完成时，自动将待办事项移动到回收站
              </p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={autoTrash}
                onChange={(e) => handleAutoTrashChange(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </section>
      </div>
    </Modal>
  )
}

export default React.memo(AppearanceSettings)
