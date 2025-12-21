import React from 'react'
import QuadrantView from './QuadrantView'
import { useSettingsContext } from '../contexts/SettingsContext'

const MatrixView: React.FC = () => {
  const { spotlightType } = useSettingsContext()

  return (
    <div className="quadrant-wrapper" style={{ height: 'calc(100vh - 120px)', paddingBottom: 'var(--space-4)' }}>
      <QuadrantView
        spotlightType={spotlightType}
      />
    </div>
  )
}

export default React.memo(MatrixView)
