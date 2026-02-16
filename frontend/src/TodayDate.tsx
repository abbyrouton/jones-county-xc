export default function TodayDate() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <p className="text-green-100/80 text-sm mt-4 font-medium">
      {today}
    </p>
  )
}
