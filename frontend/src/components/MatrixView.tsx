import React from 'react'
import QuadrantView from './QuadrantView'
import { TodoSchema } from '../types/todo'

interface MatrixViewProps {
  todos: TodoSchema[]
  onUpdateTodo: (todo: TodoSchema) => void
  onDeleteTodo: (id: number) => void
  onToggleComplete: (id: number) => void
  spotlightType: 'glow' | 'flow' | 'focus' | 'none'
}

const MatrixView: React.FC<MatrixViewProps> = ({
  todos,
  onUpdateTodo,
  onDeleteTodo,
  onToggleComplete,
  spotlightType
}) => {
  return (
    <div className="quadrant-wrapper" style={{ height: 'calc(100vh - 120px)', paddingBottom: 'var(--space-4)' }}>
      <QuadrantView
        todos={todos}
        onUpdateTodo={onUpdateTodo}
        onDeleteTodo={onDeleteTodo}
        onToggleComplete={onToggleComplete}
        spotlightType={spotlightType}
      />
    </div>
  )
}

export default MatrixView
