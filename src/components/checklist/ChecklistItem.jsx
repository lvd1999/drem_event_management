import { useUpdateTask, useDeleteTask } from '@/hooks/useChecklist'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

export default function ChecklistItem({ eventId, task }) {
  const update = useUpdateTask(eventId)
  const remove = useDeleteTask(eventId)
  const isDone = task.status === 'done'

  function toggle() {
    update.mutate({ id: task.id, status: isDone ? 'pending' : 'done' })
  }

  return (
    <div className="flex items-center gap-3 py-2.5 px-1 group">
      <input
        type="checkbox"
        checked={isDone}
        onChange={toggle}
        className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
        disabled={update.isPending}
      />
      <span className={`flex-1 text-sm ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
        {task.title}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 h-7 w-7"
        onClick={() => remove.mutate(task.id)}
        disabled={remove.isPending}
      >
        <Trash2 size={13} className="text-destructive" />
      </Button>
    </div>
  )
}
