import { useQuery } from '@tanstack/react-query'

// Handle arrow key navigation between cards
function handleArrowNavigation(e: React.KeyboardEvent<HTMLElement>) {
  const currentElement = e.currentTarget
  const container = currentElement.closest('[data-nav-container]')
  if (!container) return

  const items = Array.from(container.querySelectorAll<HTMLElement>('[data-nav-item]'))
  const currentIndex = items.indexOf(currentElement)
  if (currentIndex === -1) return

  let nextIndex = currentIndex

  switch (e.key) {
    case 'ArrowRight':
      nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
      e.preventDefault()
      break
    case 'ArrowLeft':
      nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
      e.preventDefault()
      break
    case 'ArrowDown':
      nextIndex = Math.min(currentIndex + 2, items.length - 1)
      e.preventDefault()
      break
    case 'ArrowUp':
      nextIndex = Math.max(currentIndex - 2, 0)
      e.preventDefault()
      break
    default:
      return
  }

  items[nextIndex]?.focus()
}

interface Meet {
  id: number
  name: string
  date: string
  location: string
  description: string
}

async function fetchMeets(): Promise<Meet[]> {
  const res = await fetch('/api/meets')
  if (!res.ok) throw new Error('Failed to fetch meets')
  return res.json()
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

export default function UpcomingMeets() {
  const { data: meets, isLoading, error } = useQuery({
    queryKey: ['meets'],
    queryFn: fetchMeets,
  })

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6" role="status" aria-live="polite">
        <p className="text-gray-500 text-center">Loading meets...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6" role="alert">
        <p className="text-red-500 text-center">Error: {error.message}</p>
      </div>
    )
  }

  // Filter to show only upcoming meets (today or future)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const upcomingMeets = (meets || []).filter(meet => new Date(meet.date) >= today)

  return (
    <section id="meets" aria-labelledby="meets-heading" className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <h2 id="meets-heading" className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">
        Upcoming <span className="text-[#16a34a]">Meets</span>
      </h2>
      {upcomingMeets.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No upcoming meets scheduled.</p>
      ) : (
        <div data-nav-container className="grid gap-3 sm:gap-4 md:grid-cols-2">
          {upcomingMeets.map((meet) => (
            <button
              key={meet.id}
              type="button"
              data-nav-item
              tabIndex={0}
              className="text-left bg-gray-50 rounded-xl p-5 hover:bg-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer border border-gray-100 hover:border-[#16a34a]/30 focus:ring-2 focus:ring-[#16a34a] focus:ring-offset-2 focus:outline-none"
              onClick={() => alert(`View details for ${meet.name}`)}
              onKeyDown={handleArrowNavigation}
              aria-label={`View details for ${meet.name} on ${formatDate(meet.date)}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                <h3 className="font-bold text-gray-900 text-base sm:text-lg">{meet.name}</h3>
                <span className="text-xs bg-[#16a34a] text-white px-3 py-1 rounded-full font-semibold flex items-center gap-1 w-fit shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <time dateTime={meet.date}>{formatDate(meet.date)}</time>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#16a34a] font-medium mb-2 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {meet.location}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 sm:line-clamp-none">{meet.description}</p>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
