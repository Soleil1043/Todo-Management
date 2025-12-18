import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import RecycleBin from './RecycleBin'

const mocks = vi.hoisted(() => ({
  getRecycleBin: vi.fn(),
  batchRestoreTodos: vi.fn(),
  restoreTodo: vi.fn(),
  permanentlyDeleteTodo: vi.fn(),
  clearRecycleBin: vi.fn(),
}))

vi.mock('../services/api', () => ({
  todoApi: {
    getRecycleBin: mocks.getRecycleBin,
    batchRestoreTodos: mocks.batchRestoreTodos,
    restoreTodo: mocks.restoreTodo,
    permanentlyDeleteTodo: mocks.permanentlyDeleteTodo,
    clearRecycleBin: mocks.clearRecycleBin,
  },
  recordToArray: (record: Record<number, unknown>) => Object.values(record),
}))

describe('RecycleBin', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mocks.getRecycleBin.mockReset()
    mocks.batchRestoreTodos.mockReset()
    mocks.restoreTodo.mockReset()
    mocks.permanentlyDeleteTodo.mockReset()
    mocks.clearRecycleBin.mockReset()
  })

  it('restores all todos from recycle bin', async () => {
    const onRestore = vi.fn()

    const todo1 = { id: 1, title: 't1', description: '', completed: false, priority: 'high' as const }
    const todo2 = { id: 2, title: 't2', description: '', completed: false, priority: 'low' as const }
    const restored = [todo1, todo2]

    mocks.getRecycleBin.mockResolvedValue({ 1: todo1, 2: todo2 })
    mocks.batchRestoreTodos.mockResolvedValue({ message: 'ok', restored_todos: restored })

    render(
      <RecycleBin
        isOpen={true}
        onClose={() => {}}
        onRestore={onRestore}
        onPermanentlyDelete={() => {}}
        onClearBin={() => {}}
      />
    )

    await screen.findByText('t1')
    await screen.findByText('t2')

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: '一键恢复' }))

    await user.click(screen.getByRole('button', { name: '确认' }))

    await waitFor(() => {
      expect(mocks.batchRestoreTodos).toHaveBeenCalledWith([1, 2])
    })

    await waitFor(() => {
      expect(onRestore).toHaveBeenCalledTimes(2)
    })

    await screen.findByText('回收站为空')
  })
})
