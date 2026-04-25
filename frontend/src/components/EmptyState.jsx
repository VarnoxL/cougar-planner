export default function EmptyState({ message = 'No results found.' }) {
  return (
    <div className="py-12 text-center text-text-secondary text-sm">{message}</div>
  )
}
