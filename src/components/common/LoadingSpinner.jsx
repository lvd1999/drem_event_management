export default function LoadingSpinner({ size = 'md' }) {
  const s = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-10 w-10' : 'h-7 w-7'
  return (
    <div className={`${s} animate-spin rounded-full border-2 border-muted border-t-primary`} />
  )
}
