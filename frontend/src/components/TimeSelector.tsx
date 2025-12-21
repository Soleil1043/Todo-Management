import React, { useMemo, useCallback, useId, useState, useRef, useEffect } from 'react'
import '../styles/TimeSelector.css'

interface TimeSelectorProps {
  label: string
  value?: string
  onChange: (value: string) => void
  required?: boolean
  disabled?: boolean
  minTime?: string
  maxTime?: string
  id?: string
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
const MINUTES = ['00', '30'] // Maintaining the 30-minute interval from original code

const TimeSelector: React.FC<TimeSelectorProps> = ({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  minTime,
  maxTime,
  id
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const hourColumnRef = useRef<HTMLDivElement>(null)
  const minuteColumnRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const generatedId = useId()
  const selectId = id || `time-selector-${generatedId}`

  // Parse current value
  const [currentHour, currentMinute] = useMemo(() => {
    if (!value) return ['', '']
    return value.split(':')
  }, [value])

  // Toggle dropdown
  const toggleDropdown = useCallback(() => {
    if (!disabled) setIsOpen(prev => !prev)
  }, [disabled])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle selection
   const handleSelect = useCallback((hour: string, minute: string) => {
     if (!hour || !minute) return
     const newValue = `${hour}:${minute}`
     
     // Validate range
     if ((minTime && newValue < minTime) || (maxTime && newValue > maxTime)) {
       return
     }
     
     onChange(newValue)
   }, [onChange, minTime, maxTime])

   const handleClear = useCallback((e: React.MouseEvent) => {
     e.stopPropagation()
     onChange('')
     setIsOpen(false)
   }, [onChange])
 
   // Scroll to active items when opened
  useEffect(() => {
    if (isOpen && !isScrollingRef.current) {
      const scrollToActive = (columnRef: React.RefObject<HTMLDivElement>, val: string) => {
        if (columnRef.current) {
          const activeItem = columnRef.current.querySelector(`[data-value="${val}"]`) as HTMLElement
          if (activeItem) {
            // 添加scrollTo方法存在性检查，避免测试环境中的错误
            if (typeof columnRef.current.scrollTo === 'function') {
              columnRef.current.scrollTo({
                top: activeItem.offsetTop - columnRef.current.offsetTop - 80,
                behavior: 'smooth'
              })
            } else {
              // 降级处理：直接设置scrollTop
              columnRef.current.scrollTop = activeItem.offsetTop - columnRef.current.offsetTop - 80
            }
          }
        }
      }
      const timer = setTimeout(() => {
        scrollToActive(hourColumnRef, currentHour || '00')
        scrollToActive(minuteColumnRef, currentMinute || '00')
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen, currentHour, currentMinute])

  // Handle scroll selection
  const handleWheelScroll = useCallback((e: React.UIEvent<HTMLDivElement>, type: 'hour' | 'minute') => {
    const container = e.currentTarget
    const scrollTop = container.scrollTop
    
    isScrollingRef.current = true
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    scrollTimeoutRef.current = setTimeout(() => {
      const index = Math.round(scrollTop / 40)
      
      if (type === 'hour') {
        const newHour = HOURS[Math.min(Math.max(0, index), HOURS.length - 1)]
        if (newHour && newHour !== currentHour) {
          handleSelect(newHour, currentMinute || '00')
        }
      } else {
        const newMinute = MINUTES[Math.min(Math.max(0, index), MINUTES.length - 1)]
        if (newMinute && newMinute !== currentMinute) {
          handleSelect(currentHour || '00', newMinute)
        }
      }
      
      // Reset scrolling flag after a short delay to allow effect to skip
      setTimeout(() => {
        isScrollingRef.current = false
      }, 200)
    }, 100)
  }, [currentHour, currentMinute, handleSelect])

  return (
     <div className={`time-selector ${isOpen ? 'open' : ''}`} ref={containerRef}>
       <label className="form-label" htmlFor={selectId}>
         {label}
         {required && <span className="required" aria-label="必填">*</span>}
       </label>
       
       <div className="time-selector-trigger-wrapper">
         <button
           id={selectId}
           type="button"
           className="time-selector-trigger"
           onClick={toggleDropdown}
           disabled={disabled}
           aria-haspopup="listbox"
           aria-expanded={isOpen}
         >
           {value ? (
             <span className="selected-time">{value}</span>
           ) : (
             <span className="placeholder">选择时间</span>
           )}
           <span className="chevron">
             <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
           </span>
         </button>
         {value && !disabled && (
           <button 
             type="button" 
             className="time-clear-btn" 
             onClick={handleClear}
             aria-label="清除时间"
           >
             ×
           </button>
         )}
       </div>
 
       {isOpen && (
         <div className="time-dropdown">
           <div className="time-dropdown-header">
             <span>选择时间</span>
             <button type="button" className="done-btn" onClick={() => setIsOpen(false)}>完成</button>
           </div>
           <div className="time-wheel-container">
             <div className="time-wheel-selection-highlight"></div>
             
             <div className="time-wheel-column" ref={hourColumnRef} onScroll={(e) => handleWheelScroll(e, 'hour')}>
              {HOURS.map(h => (
                <div
                  key={h}
                  data-value={h}
                  className={`time-wheel-item ${currentHour === h ? 'active' : ''}`}
                  onClick={() => handleSelect(h, currentMinute || '00')}
                >
                  {h}
                </div>
              ))}
            </div>

            <div className="time-wheel-column" ref={minuteColumnRef} onScroll={(e) => handleWheelScroll(e, 'minute')}>
              {MINUTES.map(m => (
                 <div
                   key={m}
                   data-value={m}
                   className={`time-wheel-item ${currentMinute === m ? 'active' : ''}`}
                   onClick={() => handleSelect(currentHour || '00', m)}
                 >
                   {m}
                 </div>
               ))}
             </div>
           </div>
         </div>
       )}
     </div>
   )
}

export default React.memo(TimeSelector)
