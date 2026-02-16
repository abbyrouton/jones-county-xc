import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
      nextIndex = Math.min(currentIndex + 3, items.length - 1)
      e.preventDefault()
      break
    case 'ArrowUp':
      nextIndex = Math.max(currentIndex - 3, 0)
      e.preventDefault()
      break
    default:
      return
  }

  items[nextIndex]?.focus()
}

interface Athlete {
  id: number
  name: string
  grade: number
  personalRecord: string
  events: string
}

async function fetchAthletes(): Promise<Athlete[]> {
  const res = await fetch('/api/athletes')
  if (!res.ok) throw new Error('Failed to fetch athletes')
  return res.json()
}

function AthleteCard({ athlete }: { athlete: Athlete }) {
  return (
    <article
      data-nav-item
      tabIndex={0}
      aria-label={`${athlete.name}, Grade ${athlete.grade}, Personal record ${athlete.personalRecord}${athlete.events ? `, Events: ${athlete.events}` : ''}. Press Enter for details.`}
      className="bg-gray-50 border border-gray-100 rounded-xl p-5 hover:border-[#16a34a]/30 hover:shadow-lg hover:bg-white transition-all duration-300 focus:ring-2 focus:ring-[#16a34a] focus:ring-offset-2 focus:outline-none focus-within:ring-2 focus-within:ring-[#16a34a] focus-within:ring-offset-2"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          alert(`View details for ${athlete.name}`)
        } else {
          handleArrowNavigation(e)
        }
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-lg text-gray-900" aria-hidden="true">{athlete.name}</h3>
        <span className="text-xs bg-[#16a34a]/10 text-[#16a34a] px-2 py-1 rounded-full font-semibold" aria-hidden="true">
          Grade {athlete.grade}
        </span>
      </div>
      <div className="flex items-center gap-4 mb-4" aria-hidden="true">
        <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          <span className="text-yellow-700 font-bold">{athlete.personalRecord}</span>
        </div>
        {athlete.events && (
          <span className="text-sm text-gray-600 font-medium">{athlete.events}</span>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full border-[#16a34a]/30 text-[#16a34a] hover:bg-[#16a34a] hover:text-white hover:border-[#16a34a] focus-visible:ring-2 focus-visible:ring-[#16a34a] focus-visible:ring-offset-2"
        onClick={() => alert(`View details for ${athlete.name}`)}
        aria-label={`View details for ${athlete.name}`}
      >
        View Details
      </Button>
    </article>
  )
}

function groupByGrade(athletes: Athlete[]): Record<number, Athlete[]> {
  return athletes.reduce((groups, athlete) => {
    const grade = athlete.grade
    if (!groups[grade]) groups[grade] = []
    groups[grade].push(athlete)
    return groups
  }, {} as Record<number, Athlete[]>)
}

const gradeLabels: Record<number, string> = {
  9: 'Freshmen',
  10: 'Sophomores',
  11: 'Juniors',
  12: 'Seniors'
}

export default function AthleteList() {
  const [raceCategory, setRaceCategory] = useState<string>('all')

  const { data: athletes, isLoading, error } = useQuery({
    queryKey: ['athletes'],
    queryFn: fetchAthletes,
  })

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6" role="status" aria-live="polite">
        <p className="text-gray-500 text-center">Loading athletes...</p>
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

  // Filter athletes by selected race category
  const filteredAthletes = (athletes || []).filter((athlete) => {
    if (raceCategory === 'all') return true
    const events = athlete.events?.toLowerCase() || ''
    return events.includes(raceCategory.toLowerCase())
  })

  const groupedAthletes = groupByGrade(filteredAthletes)
  const grades = [12, 11, 10, 9] // Seniors first

  return (
    <section id="athletes" aria-labelledby="athletes-heading" className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      {/* Live region for filter announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {filteredAthletes.length === 0
          ? 'No athletes found for this event.'
          : `Showing ${filteredAthletes.length} athletes${raceCategory !== 'all' ? ` for ${raceCategory}` : ''}.`}
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 id="athletes-heading" className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Our <span className="text-[#16a34a]">Athletes</span>
        </h2>
        <div className="flex flex-col gap-1">
          <label htmlFor="race-category" className="sr-only">Filter by event</label>
          <Select value={raceCategory} onValueChange={setRaceCategory}>
            <SelectTrigger id="race-category" className="w-full sm:w-48" aria-label="Filter athletes by event">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="5k">5K</SelectItem>
              <SelectItem value="3200m">3200m</SelectItem>
              <SelectItem value="1600m">1600m</SelectItem>
              <SelectItem value="800m">800m</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {filteredAthletes.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No athletes found for this event.</p>
      ) : (
        <div data-nav-container className="space-y-6">
          {grades.map((grade) => {
            const gradeAthletes = groupedAthletes[grade]
            if (!gradeAthletes || gradeAthletes.length === 0) return null

            return (
              <div key={grade}>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="bg-[#16a34a] text-white px-3 py-1 rounded-full text-sm font-bold">
                    {gradeLabels[grade]}
                  </span>
                  <span className="text-sm text-gray-400">({gradeAthletes.length} athletes)</span>
                </h3>
                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {gradeAthletes.map((athlete) => (
                    <AthleteCard key={athlete.id} athlete={athlete} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
