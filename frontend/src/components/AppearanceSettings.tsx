import React, { useRef, useState } from 'react'
import Icon from './Icon'
import { settingsApi } from '../services/api'
import Modal from './Modal'
import { useToast } from './Toast'

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
      onBgImageChange()
      showToast('壁纸上传成功', 'success')
    } catch (error) {
      showToast('上传壁纸失败，请重试', 'error')
    } finally {
      setIsUploading(false)
      // 清空 input，允许重复选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteWallpaper = async () => {
    try {
      await settingsApi.deleteWallpaper()
      onBgImageChange()
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
      <div className="settings-group">
        <div className="settings-title">
          <Icon name="sun" size={18} />
          主题模式
        </div>
        <div className="theme-toggle">
          <button
            className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
            onClick={() => onThemeChange('light')}
          >
            <Icon name="sun" size={16} />
            浅色模式
          </button>
          <button
            className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => onThemeChange('dark')}
          >
            <Icon name="moon" size={16} />
            深色模式
          </button>
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-title">
          <Icon name="image" size={18} />
          自定义壁纸
        </div>
        <div className="wallpaper-settings">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <div className="wallpaper-actions">
            <button
              className="btn-upload"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Icon name="upload" size={16} />
              {isUploading ? '上传中...' : '上传壁纸'}
            </button>
            {bgImage && (
              <button
                className="btn-delete"
                onClick={handleDeleteWallpaper}
                title="移除壁纸"
              >
                <Icon name="trash" size={16} />
              </button>
            )}
          </div>
          <p className="settings-hint">支持 jpg, png 格式，最大 50MB</p>
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-title">
          <Icon name="droplet" size={18} />
          界面透明度
        </div>
        <div className="range-control">
          <input
            type="range"
            min="0.5"
            max="1"
            step="0.05"
            value={bgOpacity}
            onChange={(e) => onBgOpacityChange(parseFloat(e.target.value))}
            className="range-input"
          />
          <span className="range-value">{Math.round(bgOpacity * 100)}%</span>
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-title">
          <Icon name="eye" size={18} />
          背景模糊度
        </div>
        <div className="range-control">
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={bgBlur}
            onChange={(e) => onBgBlurChange(parseInt(e.target.value))}
            className="range-input"
          />
          <span className="range-value">{bgBlur}%</span>
        </div>
      </div>
    </Modal>
  )
}

export default AppearanceSettings
