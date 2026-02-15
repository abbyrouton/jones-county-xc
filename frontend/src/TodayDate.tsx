export default function TodayDate() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <p className="text-green-200 text-sm mt-2">
      {today}
    </p>
  )
}
