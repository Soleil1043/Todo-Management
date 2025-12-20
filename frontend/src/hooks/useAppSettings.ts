import { useState, useCallback, useEffect } from 'react'
import { settingsApi } from '../services/api'

/**
 * 外观与主题设置 Hook
 */
export function useAppSettings() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [bgImage, setBgImage] = useState<string | null>(null)
  const [isBgLoading, setIsBgLoading] = useState(false)
  const [bgOpacity, setBgOpacity] = useState(1)
  const [bgBlur, setBgBlur] = useState(0)
  const [spotlightType, setSpotlightType] = useState<'glow' | 'flow' | 'focus' | 'none'>('glow')
  const [autoTrash, setAutoTrash] = useState(false)

  /**
   * 处理自动移入回收站设置变化
   */
  const handleAutoTrashChange = useCallback((enabled: boolean) => {
    setAutoTrash(enabled)
    localStorage.setItem('autoTrash', enabled.toString())
  }, [])

  /**
   * 处理聚光灯效果变化
   */
  const handleSpotlightTypeChange = useCallback((type: 'glow' | 'flow' | 'focus' | 'none') => {
    setSpotlightType(type)
    localStorage.setItem('spotlightType', type)
  }, [])
  const handleBgOpacityChange = useCallback((opacity: number) => {
    setBgOpacity(opacity)
    localStorage.setItem('bgOpacity', opacity.toString())
    document.documentElement.style.setProperty('--surface-opacity', opacity.toString())
  }, [])

  /**
   * 处理模糊度变化
   */
  const handleBgBlurChange = useCallback((blur: number) => {
    setBgBlur(blur)
    localStorage.setItem('bgBlur', blur.toString())
    const blurPx = (blur / 100) * 20
    document.documentElement.style.setProperty('--bg-blur', `${blurPx}px`)
  }, [])

  /**
   * 处理主题变化
   */
  const handleThemeChange = useCallback((newTheme: 'light' | 'dark') => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }, [])

  /**
   * 处理背景图片变化
   */
  const handleBgImageChange = useCallback((isNewUpload: boolean = false) => {
    const baseUrl = settingsApi.getWallpaperUrl()
    const url = `${baseUrl}?t=${Date.now()}`
    
    setIsBgLoading(true)
    
    const img = new Image()
    img.onload = () => {
      setBgImage(url)
      setIsBgLoading(false)
      
      document.documentElement.style.setProperty('--bg-image', `url("${url}")`)
      document.documentElement.style.backgroundImage = `url("${url}")`
      document.body.style.backgroundImage = `url("${url}")`
      
      const rootElement = document.getElementById('root')
      if (rootElement) {
        rootElement.style.backgroundImage = `url("${url}")`
        rootElement.style.backgroundSize = 'cover'
        rootElement.style.backgroundPosition = 'center'
        rootElement.style.backgroundAttachment = 'fixed'
        rootElement.style.transition = 'background-image 0.5s ease-in-out'
      }
      
      document.body.classList.add('has-wallpaper')
      
      if (isNewUpload) {
        const currentOpacity = parseFloat(localStorage.getItem('bgOpacity') || '1')
        if (currentOpacity >= 0.95) {
          handleBgOpacityChange(0.8)
        }
      }
    }
    img.onerror = () => {
      setBgImage(null)
      setIsBgLoading(false)
      document.documentElement.style.removeProperty('--bg-image')
      document.documentElement.style.backgroundImage = ''
      document.body.style.backgroundImage = ''
      
      const rootElement = document.getElementById('root')
      if (rootElement) {
        rootElement.style.backgroundImage = ''
        rootElement.style.backgroundSize = ''
        rootElement.style.backgroundPosition = ''
        rootElement.style.backgroundAttachment = ''
      }
      
      document.body.classList.remove('has-wallpaper')
    }
    img.src = url
  }, [handleBgOpacityChange])

  // 初始化设置
  useEffect(() => {
    // 主题
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
    if (savedTheme) {
      handleThemeChange(savedTheme)
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      handleThemeChange('dark')
    }

    // 壁纸
    handleBgImageChange()

    // 透明度
    const savedOpacity = localStorage.getItem('bgOpacity')
    const initialOpacity = savedOpacity ? parseFloat(savedOpacity) : 0.8
    handleBgOpacityChange(initialOpacity)

    // 模糊度
    const savedBlur = localStorage.getItem('bgBlur')
    const initialBlur = savedBlur ? parseInt(savedBlur) : 20
    handleBgBlurChange(initialBlur)

    // 聚光灯效果
    const savedSpotlight = localStorage.getItem('spotlightType') as any
    if (savedSpotlight) {
      setSpotlightType(savedSpotlight)
    }

    // 自动移入回收站
    const savedAutoTrash = localStorage.getItem('autoTrash')
    if (savedAutoTrash !== null) {
      setAutoTrash(savedAutoTrash === 'true')
    }
  }, [handleThemeChange, handleBgOpacityChange, handleBgBlurChange])

  return {
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
  }
}
