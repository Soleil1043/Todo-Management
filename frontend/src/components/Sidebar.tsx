import React from 'react'
import Icon from './Icon'

interface SidebarProps {
  viewMode: 'list' | 'quadrant'
  setViewMode: (mode: 'list' | 'quadrant') => void
  onOpenRecycleBin: () => void
  onOpenSettings: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ 
  viewMode, 
  setViewMode, 
  onOpenRecycleBin, 
  onOpenSettings 
}) => {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Icon name="check" size={24} />
        </div>
        <span className="logo-text">TodoGravita</span>
      </div>
      
      <nav className="sidebar-nav">
        <button 
          className={`nav-item ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          <Icon name="list" size={18} />
          <span>经典</span>
        </button>
        <button 
          className={`nav-item ${viewMode === 'quadrant' ? 'active' : ''}`}
          onClick={() => setViewMode('quadrant')}
        >
          <Icon name="grid" size={18} />
          <span>四象限</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <button 
          className="nav-item icon-only"
          onClick={onOpenSettings}
          title="设置"
        >
          <Icon name="settings" size={18} />
        </button>
        <button 
          className="nav-item icon-only"
          onClick={onOpenRecycleBin}
          title="垃圾桶"
        >
          <Icon name="trash" size={18} />
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
