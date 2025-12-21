import { useState, useCallback, useEffect } from 'react'
import { settingsApi } from '../services/api'

/**
 * 外观与主题设置 Hook
 */
export function useAppSettings() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  
  const [bgImage, setBgImage] = useState<string | null>(null)
  const [isBgLoading, setIsBgLoading] = useState(false)
  
  const [bgOpacity, setBgOpacity] = useState(() => {
    const saved = localStorage.getItem('bgOpacity')
    return saved ? parseFloat(saved) : 0.8
  })
  
  const [bgBlur, setBgBlur] = useState(() => {
    const saved = localStorage.getItem('bgBlur')
    return saved ? parseInt(saved) : 20
  })
  
  const [spotlightType, setSpotlightType] = useState<'glow' | 'flow' | 'focus' | 'none'>(() => {
    return (localStorage.getItem('spotlightType') as any) || 'glow'
  })
  
  const [autoTrash, setAutoTrash] = useState(() => {
    return localStorage.getItem('autoTrash') === 'true'
  })

  /**
   * 辅助函数：同步 DOM 状态
   */
  const syncDomSettings = useCallback(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.style.setProperty('--surface-opacity', bgOpacity.toString())
    const blurPx = (bgBlur / 100) * 20
    document.documentElement.style.setProperty('--bg-blur', `${blurPx}px`)
  }, [theme, bgOpacity, bgBlur])

  // 初始化 DOM 状态
  useEffect(() => {
    syncDomSettings()
    // 壁纸初始化
    handleBgImageChange()
  }, []) // 仅在挂载时运行一次

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

  // handleBgImageChange 已经在上面的 useEffect 中调用过一次了
  // 这里不再需要重复的初始化效果

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
