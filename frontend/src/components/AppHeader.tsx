import React from 'react'
import Icon, { IconName } from './Icon'

interface AppHeaderProps {
  title: string
  icon?: IconName
}

const AppHeader: React.FC<AppHeaderProps> = ({ title, icon }) => {
  return (
    <header className="main-header">
      <div className="page-title-container">
        {icon && (
          <div className="page-title-icon">
            <Icon name={icon} size={24} />
          </div>
        )}
        <h1 className="page-title">{title}</h1>
      </div>
      
      <div className="header-actions">
        <a 
          href="https://github.com/Soleil1043/TodoGravita" 
          target="_blank" 
          rel="noopener noreferrer"
          className="github-link"
          title="View on GitHub"
        >
          <div className="user-profile">
            <div style={{ textAlign: 'right', marginRight: 'var(--space-2)' }}>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>TodoGravita</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Soleil1043</div>
            </div>
            <div className="avatar">
              <Icon name="github" size={20} />
            </div>
          </div>
        </a>
      </div>
    </header>
  )
}

export default React.memo(AppHeader)
