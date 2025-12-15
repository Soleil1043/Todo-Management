import React from 'react'

interface TimeSelectorProps {
  label: string
  value?: string
  onChange: (value: string) => void
  required?: boolean
}

const TimeSelector: React.FC<TimeSelectorProps> = ({ 
  label, 
  value, 
  onChange, 
  required = false 
}) => {
  // 生成时间选项（每30分钟一个间隔）
  const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        options.push(time)
      }
    }
    return options
  }

  const timeOptions = generateTimeOptions()

  return (
    <div className="time-selector">
      <label className="form-label">{label}</label>
      <select 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)}
        className="form-select"
        required={required}
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