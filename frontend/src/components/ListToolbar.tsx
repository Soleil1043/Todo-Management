import React from 'react'
import Icon from './Icon'

export type FilterStatus = 'all' | 'active' | 'completed'
export type SortType = 'priority' | 'time' | 'updated'

interface ListToolbarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  statusFilter: FilterStatus
  onStatusChange: (status: FilterStatus) => void
  sortBy: SortType
  onSortChange: (sort: SortType) => void
  hideCompleted: boolean
  onHideCompletedChange: (hide: boolean) => void
}

const ListToolbar: React.FC<ListToolbarProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
  hideCompleted,
  onHideCompletedChange,
}) => {
  return (
    <div className="list-toolbar">
      <div className="toolbar-left">
        <div className="search-box">
          <Icon name="search" size={16} className="search-icon" />
          <input
            type="text"
            placeholder="搜索待办..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="status-filters">
          <button
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => onStatusChange('all')}
          >
            全部
          </button>
          <button
            className={`filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
            onClick={() => onStatusChange('active')}
          >
            待完成
          </button>
          <button
            className={`filter-btn ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => onStatusChange('completed')}
          >
            已完成
          </button>
        </div>
      </div>

      <div className="toolbar-right">
        <label className="hide-completed-toggle">
          <input
            type="checkbox"
            checked={hideCompleted}
            onChange={(e) => onHideCompletedChange(e.target.checked)}
          />
          隐藏已完成
        </label>
        <div className="sort-control">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortType)}
            className="sort-select"
            aria-label="排序方式"
          >
            <option value="updated">最近更新</option>
            <option value="priority">优先级</option>
            <option value="time">时间</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default ListToolbar