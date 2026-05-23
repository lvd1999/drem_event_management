import { useState } from 'react'
import { useChecklist, useCreateTask } from '@/hooks/useChecklist'
import ChecklistItem from './ChecklistItem'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import EmptyState from '@/components/common/EmptyState'

export default function ChecklistPanel({ eventId }) {
  const { data: tasks, isLoading } = useChecklist(eventId)
  const createTask = useCreateTask(eventId)
  const [newTitle, setNewTitle] = useState('')

  async function handleAdd(e) {
    e.preventDefault()
    const title = newTitle.trim()
    if (!title) return
    await createTask.mutateAsync(title)
    setNewTitle('')
  }

  const done = tasks?.filter(t => t.status === 'done').length ?? 0
  const total = tasks?.length ?? 0

  if (isLoading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">{done}/{total} completed</p>
      </div>

      {!tasks?.length
        ? <EmptyState title="No tasks yet" description="Add checklist items below." />
        : (
          <div className="divide-y border rounded-md bg-white px-3 mb-4">
            {tasks.map(task => <ChecklistItem key={task.id} eventId={eventId} task={task} />)}
          </div>
        )
      }

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          placeholder="Add a task…"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={createTask.isPending || !newTitle.trim()}>
          <Plus size={15} />
        </Button>
      </form>
    </div>
  )
}
