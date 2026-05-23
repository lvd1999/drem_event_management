export default function EmptyState({ title = 'No data', description = '' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
      <p className="text-base font-medium">{title}</p>
      {description && <p className="text-sm mt-1">{description}</p>}
    </div>
  )
}
