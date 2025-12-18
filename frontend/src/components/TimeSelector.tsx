import React, { useMemo, useCallback } from 'react'

interface TimeSelectorProps {
  label: string
  value?: string
  onChange: (value: string) => void
  required?: boolean
  disabled?: boolean
  minTime?: string
  maxTime?: string
}

// 使用useMemo缓存时间选项生成，避免重复计算
const useTimeOptions = (minTime?: string, maxTime?: string) => {
  return useMemo(() => {
    const options = []
    const startHour = minTime ? parseInt(minTime.split(':')[0]) : 0
    const endHour = maxTime ? parseInt(maxTime.split(':')[0]) : 23
    const startMinute = minTime ? parseInt(minTime.split(':')[1]) : 0
    const endMinute = maxTime ? parseInt(maxTime.split(':')[1]) : 59
    
    for (let hour = startHour; hour <= endHour; hour++) {
      const minuteStart = hour === startHour ? startMinute : 0
      const minuteEnd = hour === endHour ? endMinute : 59
      
      for (let minute = minuteStart; minute <= minuteEnd; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        
        // 如果时间选项在指定范围内，添加到选项列表
        if ((!minTime || time >= minTime) && (!maxTime || time <= maxTime)) {
          options.push(time)
        }
      }
    }
    return options
  }, [minTime, maxTime])
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  minTime,
  maxTime
}) => {
  const timeOptions = useTimeOptions(minTime, maxTime)

  // 使用useCallback优化事件处理函数
  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value)
  }, [onChange])

  // 验证当前值是否在有效范围内
  const isValidValue = useMemo(() => {
    if (!value) return true
    return timeOptions.includes(value)
  }, [value, timeOptions])

  return (
    <div className="time-selector">
      <label className="form-label" htmlFor={`time-selector-${label}`}>
        {label}
        {required && <span className="required" aria-label="必填">*</span>}
      </label>
      <select
        id={`time-selector-${label}`}
        value={isValidValue ? value || '' : ''}
        onChange={handleChange}
        className="form-select"
        required={required}
        disabled={disabled}
        aria-label={`选择${label}`}
      >
        <option value="">选择时间</option>
        {timeOptions.map(time => (
          <option key={time} value={time}>
            {time}
          </option>
        ))}
      </select>
    </div>
  )
}

export default TimeSelector